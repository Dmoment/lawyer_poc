import google.generativeai as genai
from typing import List, Dict, Any
import time
from config import Config
from models import QueryResponse, Citation, QueryRequest
from document_processor import DocumentProcessor

class RAGSystem:
    def __init__(self, document_processor: DocumentProcessor | None = None):
        self.config = Config()
        self.document_processor = document_processor or DocumentProcessor()
        
        # Configure Gemini
        genai.configure(api_key=self.config.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(self.config.LLM_MODEL)
    
    def generate_answer(self, query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Generate answer using Google Gemini with context"""
        
        # Prepare context from chunks
        context_text = "\n\n".join([
            f"Page {chunk['metadata']['page_number']}: {chunk['content']}"
            for chunk in context_chunks
        ])
        
        # Create prompt for Gemini
        prompt = f"""You are a document analysis assistant that can work with any type of document. 
        Your task is to answer questions based on the provided document excerpts.
        
        Guidelines:
        1. Provide accurate, specific answers based only on the provided document content
        2. If the answer is not found in the document, clearly state this
        3. Be precise and professional in your responses
        4. Focus on the most relevant information from the document
        5. Use appropriate terminology based on the document type (legal, technical, business, etc.)
        
        Question: {query}

        Document excerpts:
        {context_text}
        
        Please provide a comprehensive answer with specific details from the document."""
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=1000,
                    temperature=0.1
                )
            )
            
            return response.text.strip()
        
        except Exception as e:
            error_msg = str(e)
            return f"Error generating answer: {error_msg}"
    
    def calculate_confidence_score(self, context_chunks: List[Dict[str, Any]]) -> float:
        """Calculate confidence score based on relevance of context chunks"""
        if not context_chunks:
            return 0.0
        
        # Calculate average relevance score
        avg_relevance = sum(chunk['relevance_score'] for chunk in context_chunks) / len(context_chunks)
        
        # Adjust based on number of relevant chunks
        chunk_factor = min(len(context_chunks) / 3, 1.0)  # Normalize to max 1.0
        
        # Combine factors
        confidence = (avg_relevance * 0.7) + (chunk_factor * 0.3)
        
        return min(confidence, 1.0)
    
    def query_document(self, query_request: QueryRequest) -> QueryResponse:
        """Main method to query documents and get answers with citations"""
        start_time = time.time()
        
        # Search for relevant chunks
        search_results = self.document_processor.search_documents(
            query=query_request.question,
            document_id=query_request.document_id,
            n_results=5
        )
        
        # If no relevant results found (below threshold), return early
        if not search_results:
            return QueryResponse(
                answer="No relevant information found in the document for your question. The question appears to be outside the scope of this document.",
                citations=[],
                confidence_score=0.0,
                processing_time=time.time() - start_time
            )
        
        # Generate answer using RAG
        answer = self.generate_answer(query_request.question, search_results)
        
        # Generate citations (only if we have relevant results)
        citations = []
        if query_request.include_citations and search_results:
            citations = self.document_processor.get_citations(search_results)
            # Limit citations as requested
            citations = citations[:query_request.max_citations]
        
        # Calculate confidence score
        confidence_score = self.calculate_confidence_score(search_results)
        
        processing_time = time.time() - start_time
        
        return QueryResponse(
            answer=answer,
            citations=citations,
            confidence_score=confidence_score,
            processing_time=processing_time
        )
    
    def get_document_summary(self, document_id: str) -> Dict[str, Any]:
        """Get summary information about a processed document"""
        # Query all chunks for this document
        results = self.document_processor.collection.query(
            query_texts=[""],
            n_results=1000,  # Get all chunks
            where={"document_id": document_id} if document_id else None
        )
        
        if not results['documents'][0]:
            return {"error": "Document not found"}
        
        # Extract unique pages
        pages = set()
        for metadata in results['metadatas'][0]:
            pages.add(metadata['page_number'])
        
        return {
            "document_id": document_id,
            "total_chunks": len(results['documents'][0]),
            "total_pages": len(pages),
            "pages": sorted(list(pages))
        }
