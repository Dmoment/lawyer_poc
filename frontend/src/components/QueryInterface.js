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
    <div className="space-y-8">
      {/* Query Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-3 mr-4">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ask Questions</h2>
            <p className="text-sm text-gray-600">Get AI-powered answers from your policy documents</p>
          </div>
        </div>
        
        {!selectedDocument && documents.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-3" />
              <div>
                <span className="text-sm font-medium text-amber-800">
                  Select a document from the list to start asking questions
                </span>
                <p className="text-xs text-amber-700 mt-1">
                  Click on any document in the left panel to begin
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Your Question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                selectedDocument 
                  ? "Ask a question about the selected insurance policy...\n\nExample: What is the coverage limit for physiotherapy?"
                  : "Select a document first to ask questions"
              }
              disabled={!selectedDocument || loading}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 min-h-[120px] resize-none text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
            />
          </div>
          
          <button
            type="submit"
            disabled={!selectedDocument || !query.trim() || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                <span className="text-lg">Processing your question...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-3" />
                <span className="text-lg">Ask Question</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 mr-4">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">AI Response</h3>
                <p className="text-sm text-gray-600">Generated from your policy document</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                <span className="font-medium text-gray-700">{response.processing_time.toFixed(2)}s</span>
              </div>
              <div className="flex items-center bg-green-100 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="font-medium text-green-700">{formatConfidence(response.confidence_score)}% confidence</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <p className="text-gray-800 leading-relaxed text-lg">
              {response.answer}
            </p>
          </div>

          {/* Citations */}
          {response.citations && response.citations.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Source Citations</h4>
                <div className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {response.citations.length} reference{response.citations.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="space-y-4">
                {response.citations.map((citation, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold mr-3">
                          Page {citation.page_number}
                        </div>
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
                          {Math.round(citation.relevance_score * 100)}% relevant
                        </div>
                      </div>
                    </div>
                    <blockquote className="text-gray-700 italic border-l-4 border-blue-200 pl-4">
                      "{citation.content}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <div className="flex items-start">
            <div className="bg-red-100 rounded-full p-2 mr-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryInterface;
