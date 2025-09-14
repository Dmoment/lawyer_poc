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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 mr-4">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Documents</h2>
            <p className="text-sm text-gray-600">Your uploaded policies</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col h-fit max-h-[600px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2.5 mr-3">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Documents</h2>
            <p className="text-xs text-gray-600">{documents.length} policy document{documents.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {documents.length > 0 && (
          <div className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            {documents.filter(doc => doc.status === 'processed').length} Ready
          </div>
        )}
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col justify-center">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-3">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No documents yet</h3>
          <p className="text-sm text-gray-500">Upload your first policy to get started</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.filename}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedDocument?.filename === doc.filename
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
              onClick={() => onDocumentSelect(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-start mb-2">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-2 mr-3 flex-shrink-0">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {doc.filename}
                      </h3>
                      <div className="flex items-center">
                        {doc.status === 'processed' ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">Ready for queries</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-600 border-t-transparent mr-1"></div>
                            <span className="text-xs font-medium">Processing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 ml-11">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(doc.upload_date)}
                    </div>
                    <div className="flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      {doc.total_pages} pages
                    </div>
                    {doc.total_chunks && (
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                        {doc.total_chunks} chunks
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.filename, doc.filename);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 flex-shrink-0"
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
