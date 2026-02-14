import React from 'react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in-up">
      <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
        AI-Powered Public Speaking Coach
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-4xl">
        Sound confident <br className="hidden md:block" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
           before it matters.
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
        Upload your practice presentation audio or video. Get instant, actionable feedback on pacing, tone, and filler words from our advanced AI.
      </p>
      
      <button 
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1"
      >
        Start Analysis
        <svg className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full">
         <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">⏱️</span>
            </div>
            <h3 className="font-bold text-gray-900">Pacing Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">Are you speaking too fast or too slow? We'll tell you the sweet spot.</p>
         </div>
         <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">🗣️</span>
            </div>
            <h3 className="font-bold text-gray-900">Filler Word Detection</h3>
            <p className="text-sm text-gray-500 mt-1">Catch those "ums", "ahs", and "likes" before your audience does.</p>
         </div>
         <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">🎯</span>
            </div>
            <h3 className="font-bold text-gray-900">Tone & Confidence</h3>
            <p className="text-sm text-gray-500 mt-1">Ensure your voice projects authority and keeps engagement high.</p>
         </div>
      </div>
    </div>
  );
};
