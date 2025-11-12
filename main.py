import asyncio
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
import os
import uuid
from datetime import datetime
from typing import List, Optional
import aiofiles

from config import Config
from models import DocumentInfo, QueryRequest, QueryResponse
from document_processor import DocumentProcessor
from rag_system import RAGSystem

app = FastAPI(title="Document Analyzer", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
config = Config()
document_processor = DocumentProcessor()
rag_system = RAGSystem(document_processor=document_processor)

# Create necessary directories
os.makedirs(config.UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(config.CHROMA_PERSIST_DIRECTORY, exist_ok=True)

# Mount static files for React frontend
if os.path.exists("frontend/build"):
    app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

# Store for document metadata
documents_store = {}
session_lock = asyncio.Lock()


def _clean_directory(directory: str):
    """Remove all files/subdirectories inside the given directory."""
    if not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)
        return

    for item in os.listdir(directory):
        item_path = os.path.join(directory, item)
        try:
            if os.path.isfile(item_path) or os.path.islink(item_path):
                os.remove(item_path)
            else:
                shutil.rmtree(item_path, ignore_errors=True)
        except Exception as exc:
            print(f"Failed to remove {item_path}: {exc}")


def clear_document_data():
    """Remove uploaded files, reset vector store, and clear in-memory state."""
    documents_store.clear()
    _clean_directory(config.UPLOAD_DIRECTORY)
    document_processor.reset_storage()
    rag_system.document_processor.reset_storage()


@app.on_event("startup")
async def startup_cleanup():
    # Ensure a clean slate whenever the service restarts
    clear_document_data()

@app.get("/")
async def read_root():
    """Serve the React frontend or API info"""
    if os.path.exists("frontend/build/index.html"):
        return FileResponse("frontend/build/index.html")
    return {"message": "Document Analyzer API", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is running"}

@app.post("/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document"""
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Validate file size
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > config.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400, 
            detail=f"File size exceeds {config.MAX_FILE_SIZE_MB}MB limit"
        )
    
    # Generate unique document ID
    document_id = str(uuid.uuid4())
    filename = f"{document_id}_{file.filename}"
    file_path = os.path.join(config.UPLOAD_DIRECTORY, filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    try:
        # Process document
        result = document_processor.process_document(file_path, document_id)
        
        # Store document info
        document_info = DocumentInfo(
            document_id=document_id,
            filename=file.filename,
            upload_date=datetime.now(),
            total_pages=result['total_pages'],
            total_chunks=result['total_chunks'],
            status=result['status']
        )
        
        documents_store[document_id] = document_info
        
        return document_info
    
    except Exception as e:
        # Clean up file if processing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.get("/documents", response_model=List[DocumentInfo])
async def list_documents():
    """List all uploaded documents"""
    return list(documents_store.values())

@app.get("/documents/{document_id}", response_model=DocumentInfo)
async def get_document(document_id: str):
    """Get specific document information"""
    if document_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    return documents_store[document_id]

@app.post("/query", response_model=QueryResponse)
async def query_document(query_request: QueryRequest):
    """Query documents for answers with citations"""
    try:
        # If document_id is provided, verify it exists
        if query_request.document_id and query_request.document_id not in documents_store:
            query_request.document_id = None

        print(
            f"[Query] question='{query_request.question[:50]}...', "
            f"document_id={query_request.document_id}, "
            f"available_docs={list(documents_store.keys())}"
        )
        
        response = rag_system.query_document(query_request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@app.post("/session/reset")
async def reset_session():
    """Clear all uploaded documents and associated vector data."""
    async with session_lock:
        clear_document_data()
    return {"status": "reset"}


@app.get("/documents/{document_id}/summary")
async def get_document_summary(document_id: str):
    """Get summary information about a document"""
    if document_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        summary = rag_system.get_document_summary(document_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting document summary: {str(e)}")

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its associated data"""
    if document_id not in documents_store:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Remove from ChromaDB
        document_processor.collection.delete(
            where={"document_id": document_id}
        )
        
        # Remove from store
        del documents_store[document_id]
        
        return {"message": "Document deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
