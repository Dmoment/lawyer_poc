from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentUpload(BaseModel):
    filename: str
    content_type: str
    size: int

class DocumentChunk(BaseModel):
    content: str
    page_number: int
    chunk_index: int
    metadata: Dict[str, Any]

class Citation(BaseModel):
    page_number: int
    section: Optional[str] = None
    content: str
    relevance_score: float

class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence_score: float
    processing_time: float

class DocumentInfo(BaseModel):
    filename: str
    upload_date: datetime
    total_pages: int
    total_chunks: int
    status: str

class QueryRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    include_citations: bool = True
    max_citations: int = 5
