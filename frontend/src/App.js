import React, { useState, useEffect } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import QueryInterface from './components/QueryInterface';
import Header from './components/Header';
import { getDocuments, resetSession, resetSessionBeacon } from './services/api';

const UPLOAD_LIMIT = 3;

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadCount = documents.length;
  const uploadCounterLabel = `${Math.min(uploadCount, UPLOAD_LIMIT)}/${UPLOAD_LIMIT}`;

  const fetchDocuments = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleDocumentUploaded = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleDocumentDeleted = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
    if (selectedDocument && selectedDocument.document_id === documentId) {
      setSelectedDocument(null);
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        await resetSession();
        await fetchDocuments(false);
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const handleBeforeUnload = () => {
      resetSessionBeacon();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      resetSessionBeacon();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Trial usage</h1>
            <p className="text-sm text-gray-600">
              You can upload up to {UPLOAD_LIMIT} documents during the trial. Questions are unlimited.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Documents uploaded</span>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <span className="text-lg font-semibold text-gray-900">{uploadCounterLabel}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Document Management */}
          <div className="lg:col-span-1 space-y-6">
            <DocumentUpload 
              onDocumentUploaded={handleDocumentUploaded}
              loading={loading}
              uploadLimit={UPLOAD_LIMIT}
              uploadCount={uploadCount}
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
          <div className="lg:col-span-3">
            <QueryInterface 
              selectedDocument={selectedDocument}
              documents={documents}
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2024 Document Analyzer. Powered by AI technology for document analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
