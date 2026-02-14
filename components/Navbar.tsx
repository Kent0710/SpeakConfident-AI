import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <span className="font-bold text-xl text-gray-900 tracking-tight">SpeakConfident<span className="text-indigo-600">AI</span></span>
      </div>
      <a href="#" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Documentation</a>
    </nav>
  );
};
