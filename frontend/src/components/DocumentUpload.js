import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadDocument } from '../services/api';

const DocumentUpload = ({ onDocumentUploaded, loading }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadDocument(formData);
      onDocumentUploaded(response);
      setUploadStatus({ type: 'success', message: 'Document uploaded and processed successfully!' });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to upload document' 
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading || loading
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-2.5 mr-3">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Upload Document</h2>
          <p className="text-xs text-gray-600">Add insurance policy PDFs for analysis</p>
        </div>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 scale-[1.02] shadow-lg'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 hover:shadow-md'
        } ${uploading || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-base font-medium text-gray-700 mt-3">Processing document...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-4 mb-4">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop your PDF here' : 'Upload Insurance Policy'}
            </h3>
            <p className="text-sm text-gray-600 mb-3 max-w-sm">
              {isDragActive
                ? 'Release to upload the document'
                : 'Drag & drop your PDF file here, or click to browse'}
            </p>
            <div className="bg-gray-100 rounded-lg px-3 py-1.5">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Supported:</span> PDF files up to 50MB
              </p>
            </div>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`mt-6 p-4 rounded-xl flex items-center ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
          )}
          <span className="font-medium">{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
