import React from 'react';
import { FileText, Brain, Shield, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <FileText className="h-8 w-8 text-white" />
              <Brain className="h-6 w-6 text-blue-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Insurance Policy Analyzer
              </h1>
              <p className="text-blue-100 text-lg">
                AI-Powered Legal Document Analysis
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white/80">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Lightning Fast</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center space-x-4 text-white/90">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Online</span>
            </div>
            <div className="text-sm">
              Upload PDF documents and get instant AI-powered answers with precise citations
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
