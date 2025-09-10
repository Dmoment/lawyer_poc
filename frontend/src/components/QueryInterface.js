import React, { useState } from 'react';
import { Search, MessageSquare, Clock, FileText, AlertCircle } from 'lucide-react';
import { queryDocument } from '../services/api';

const QueryInterface = ({ selectedDocument, documents }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const queryData = {
        question: query,
        document_id: selectedDocument?.filename,
        include_citations: true,
        max_citations: 5
      };

      const result = await queryDocument(queryData);
      setResponse(result);
    } catch (err) {
      console.error('Query error:', err);
      setError(err.response?.data?.detail || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const formatConfidence = (score) => {
    return Math.round(score * 100);
  };

  return (
    <div className="space-y-6">
      {/* Query Form */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
          Ask Questions
        </h2>
        
        {!selectedDocument && documents.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-sm text-amber-800">
                Select a document from the list to start asking questions
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                selectedDocument 
                  ? "Ask a question about the selected insurance policy..."
                  : "Select a document first to ask questions"
              }
              disabled={!selectedDocument || loading}
              className="input-field min-h-[100px] resize-none"
              rows={3}
            />
          </div>
          
          <button
            type="submit"
            disabled={!selectedDocument || !query.trim() || loading}
            className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Ask Question
              </>
            )}
          </button>
        </form>
      </div>

      {/* Response */}
      {response && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Answer</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {response.processing_time.toFixed(2)}s
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                {formatConfidence(response.confidence_score)}% confidence
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              {response.answer}
            </p>
          </div>

          {/* Citations */}
          {response.citations && response.citations.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Citations
              </h4>
              <div className="space-y-3">
                {response.citations.map((citation, index) => (
                  <div key={index} className="citation-card">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        Page {citation.page_number}
                      </span>
                      <span className="text-xs text-blue-600">
                        {Math.round(citation.relevance_score * 100)}% relevant
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      "{citation.content}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryInterface;
