import os
import uuid
from typing import List, Dict, Any, Tuple
import PyPDF2
import pdfplumber
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import tiktoken
from config import Config
from models import DocumentChunk, Citation

class DocumentProcessor:
    def __init__(self):
        self.config = Config()
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        
        # Initialize ChromaDB with error handling
        try:
            self.chroma_client = chromadb.PersistentClient(
                path=self.config.CHROMA_PERSIST_DIRECTORY
            )
            self.collection = self.chroma_client.get_or_create_collection(
                name="insurance_documents",
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            print(f"ChromaDB initialization error: {e}")
            # Clear the database directory and retry
            import shutil
            if os.path.exists(self.config.CHROMA_PERSIST_DIRECTORY):
                shutil.rmtree(self.config.CHROMA_PERSIST_DIRECTORY)
            os.makedirs(self.config.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
            
            self.chroma_client = chromadb.PersistentClient(
                path=self.config.CHROMA_PERSIST_DIRECTORY
            )
            self.collection = self.chroma_client.get_or_create_collection(
                name="insurance_documents",
                metadata={"hnsw:space": "cosine"}
            )
    
    def extract_text_from_pdf(self, file_path: str) -> List[Tuple[str, int]]:
        """Extract text from PDF with page numbers"""
        pages_text = []
        
        try:
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    if text and text.strip():
                        pages_text.append((text.strip(), page_num))
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            # Fallback to PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    text = page.extract_text()
                    if text and text.strip():
                        pages_text.append((text.strip(), page_num))
        
        return pages_text
    
    def chunk_text(self, text: str, page_number: int) -> List[DocumentChunk]:
        """Split text into chunks with overlap"""
        chunks = []
        
        # Tokenize the text
        tokens = self.tokenizer.encode(text)
        
        # Create chunks
        chunk_size = self.config.CHUNK_SIZE
        overlap = self.config.CHUNK_OVERLAP
        
        for i in range(0, len(tokens), chunk_size - overlap):
            chunk_tokens = tokens[i:i + chunk_size]
            chunk_text = self.tokenizer.decode(chunk_tokens)
            
            if chunk_text.strip():
                chunk = DocumentChunk(
                    content=chunk_text,
                    page_number=page_number,
                    chunk_index=len(chunks),
                    metadata={
                        "start_token": i,
                        "end_token": min(i + chunk_size, len(tokens)),
                        "token_count": len(chunk_tokens)
                    }
                )
                chunks.append(chunk)
        
        return chunks
    
    def process_document(self, file_path: str, document_id: str = None) -> Dict[str, Any]:
        """Process a PDF document and store in vector database"""
        if not document_id:
            document_id = str(uuid.uuid4())
        
        # Extract text from PDF
        pages_text = self.extract_text_from_pdf(file_path)
        
        
        if not pages_text:
            raise ValueError("No text could be extracted from the PDF")
        
        # Process each page
        all_chunks = []
        for page_text, page_number in pages_text:
            chunks = self.chunk_text(page_text, page_number)
            all_chunks.extend(chunks)
        
        # Generate embeddings and store in ChromaDB
        chunk_contents = [chunk.content for chunk in all_chunks]
        embeddings = self.embedding_model.encode(chunk_contents).tolist()
        
        # Prepare metadata for ChromaDB
        metadatas = []
        ids = []
        
        for i, chunk in enumerate(all_chunks):
            metadata = {
                "document_id": document_id,
                "page_number": chunk.page_number,
                "chunk_index": chunk.chunk_index,
                "content": chunk.content[:500]  # Store first 500 chars for reference
            }
            metadatas.append(metadata)
            ids.append(f"{document_id}_{i}")
        
        # Store in ChromaDB
        self.collection.add(
            embeddings=embeddings,
            documents=chunk_contents,
            metadatas=metadatas,
            ids=ids
        )
        
        return {
            "document_id": document_id,
            "total_pages": len(pages_text),
            "total_chunks": len(all_chunks),
            "status": "processed"
        }
    
    def search_documents(self, query: str, document_id: str = None, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant chunks in the document"""
        # Generate query embedding
        query_embedding = self.embedding_model.encode([query]).tolist()[0]
        
        # Prepare where clause for document filtering
        where_clause = {}
        if document_id:
            where_clause["document_id"] = document_id
        
        # Search in ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where_clause if where_clause else None
        )
        
        # Format results and filter by relevance threshold
        formatted_results = []
        relevance_threshold = 0.1  # Lowered threshold to 10% relevance
        
        for i in range(len(results['documents'][0])):
            distance = results['distances'][0][i]
            relevance_score = 1 - distance  # Convert distance to relevance
            
            # Only include results above relevance threshold
            if relevance_score >= relevance_threshold:
                result = {
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "distance": distance,
                    "relevance_score": relevance_score
                }
                formatted_results.append(result)
        
        return formatted_results
    
    def get_citations(self, search_results: List[Dict[str, Any]]) -> List[Citation]:
        """Convert search results to citation format and remove duplicates"""
        citations = []
        seen_pages = set()  # Track pages to avoid duplicates
        
        for result in search_results:
            page_number = result['metadata']['page_number']
            
            # Skip if we've already seen this page
            if page_number in seen_pages:
                continue
                
            citation = Citation(
                page_number=page_number,
                content=result['content'][:200] + "..." if len(result['content']) > 200 else result['content'],
                relevance_score=result['relevance_score']
            )
            citations.append(citation)
            seen_pages.add(page_number)
        
        # Sort by relevance score
        citations.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return citations[:self.config.MAX_CITATIONS]
