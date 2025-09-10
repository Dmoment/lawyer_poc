import React from 'react';
import { FileText, Brain } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary-600" />
            <Brain className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Insurance Policy Analyzer
            </h1>
            <p className="text-sm text-gray-600">
              Upload and query insurance policy documents with AI-powered analysis
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
