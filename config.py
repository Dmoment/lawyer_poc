import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Google Gemini Configuration
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    LLM_MODEL = os.getenv("LLM_MODEL", "gemini-flash-latest")
    
    # File Upload Configuration
    UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "./uploads")
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "pdf").split(",")
    
    # ChromaDB Configuration
    CHROMA_PERSIST_DIRECTORY = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
    
    # Chunking Configuration
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    
    # Model Configuration
    EMBEDDING_MODEL = "text-embedding-ada-002"
    LLM_MODEL = "gemini-flash-latest"
    
    # Citation Configuration
    CITATION_PREFIX = "Page"
    MAX_CITATIONS = 5
