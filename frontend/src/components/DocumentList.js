import React from 'react';
import { FileText, Trash2, Calendar, Hash, CheckCircle } from 'lucide-react';
import { deleteDocument } from '../services/api';

const DocumentList = ({ documents, selectedDocument, onDocumentSelect, onDocumentDeleted, loading }) => {
  const handleDelete = async (documentId, filename) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        await deleteDocument(documentId);
        onDocumentDeleted(documentId);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete document');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
      
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.filename}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedDocument?.filename === doc.filename
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onDocumentSelect(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-primary-600 mr-2 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {doc.filename}
                    </h3>
                    {doc.status === 'processed' && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(doc.upload_date)}
                    </div>
                    <div className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      {doc.total_pages} pages
                    </div>
                  </div>
                  
                  {doc.status === 'processed' && (
                    <div className="mt-2 text-xs text-green-600">
                      Ready for queries
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.filename, doc.filename);
                  }}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
