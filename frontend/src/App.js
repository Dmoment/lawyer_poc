import React, { useState, useEffect } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import QueryInterface from './components/QueryInterface';
import Header from './components/Header';
import { getDocuments } from './services/api';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleDocumentDeleted = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.filename !== documentId));
    if (selectedDocument && selectedDocument.filename === documentId) {
      setSelectedDocument(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Document Management */}
          <div className="lg:col-span-1 space-y-6">
            <DocumentUpload 
              onDocumentUploaded={handleDocumentUploaded}
              loading={loading}
            />
            
            <DocumentList 
              documents={documents}
              selectedDocument={selectedDocument}
              onDocumentSelect={setSelectedDocument}
              onDocumentDeleted={handleDocumentDeleted}
              loading={loading}
            />
          </div>
          
          {/* Right Column - Query Interface */}
          <div className="lg:col-span-2">
            <QueryInterface 
              selectedDocument={selectedDocument}
              documents={documents}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
