# Insurance Policy Document Analyzer

A comprehensive POC system for analyzing insurance policy documents using AI-powered document processing and retrieval-augmented generation (RAG).

## Features

- **Document Upload**: Upload PDF insurance policy documents (up to 40 pages, 50MB max)
- **Intelligent Processing**: Automatic text extraction, chunking, and vectorization
- **AI-Powered Q&A**: Ask questions about policy content with accurate answers
- **Citation References**: Get precise page and section references for all answers
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Architecture

### Backend (FastAPI)
- **Document Processing**: PyPDF2/pdfplumber for PDF text extraction
- **Vector Database**: ChromaDB for semantic search
- **LLM Integration**: OpenAI GPT-4 for Q&A generation
- **API**: RESTful endpoints for document management and queries

### Frontend (React)
- **Modern UI**: Built with React 18 and Tailwind CSS
- **File Upload**: Drag-and-drop interface with progress tracking
- **Real-time Queries**: Interactive Q&A interface with citation display
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key

### Installation

1. **Clone and setup backend**:
```bash
cd /Users/deepakchauhan/lawyer_poc
pip install -r requirements.txt
```

2. **Setup environment variables**:
```bash
cp env_example.txt .env
# Edit .env and add your OpenAI API key
```

3. **Start the backend server**:
```bash
python main.py
```

4. **Setup and start frontend** (in a new terminal):
```bash
cd frontend
npm install
npm start
```

5. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Usage

1. **Upload Documents**: Drag and drop PDF insurance policy documents
2. **Select Document**: Choose a document from the list
3. **Ask Questions**: Type questions about the policy content
4. **View Results**: Get AI-generated answers with citation references

## API Endpoints

- `POST /upload` - Upload and process documents
- `GET /documents` - List all documents
- `POST /query` - Query documents for answers
- `DELETE /documents/{id}` - Delete documents

## Configuration

Key configuration options in `config.py`:
- `CHUNK_SIZE`: Text chunk size for processing (default: 1000)
- `CHUNK_OVERLAP`: Overlap between chunks (default: 200)
- `MAX_FILE_SIZE_MB`: Maximum file size (default: 50MB)
- `EMBEDDING_MODEL`: OpenAI embedding model
- `LLM_MODEL`: OpenAI language model

## Technical Details

### Document Processing Pipeline
1. **PDF Extraction**: Extract text from each page
2. **Text Chunking**: Split text into overlapping chunks
3. **Vectorization**: Generate embeddings using OpenAI
4. **Storage**: Store in ChromaDB with metadata

### RAG System
1. **Query Processing**: Generate query embeddings
2. **Semantic Search**: Find relevant document chunks
3. **Context Assembly**: Combine relevant chunks
4. **Answer Generation**: Use GPT-4 with context
5. **Citation Tracking**: Map answers to source pages

### Citation System
- **Page References**: Exact page numbers for each answer
- **Relevance Scores**: Confidence metrics for citations
- **Content Excerpts**: Relevant text snippets
- **Multiple Sources**: Support for multiple citation sources

## Development

### Backend Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

## Production Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `CHROMA_PERSIST_DIRECTORY`: Vector database storage path
- `UPLOAD_DIRECTORY`: File upload storage path

## Troubleshooting

### Common Issues
1. **OpenAI API Key**: Ensure valid API key is set
2. **File Size**: Check file size limits (50MB default)
3. **PDF Processing**: Ensure PDFs are text-based, not scanned images
4. **Memory Usage**: Large documents may require more RAM

### Performance Optimization
- Adjust chunk size based on document complexity
- Use GPU acceleration for embedding generation
- Implement document caching for frequently accessed files

## License

This is a proof-of-concept system for demonstration purposes.
