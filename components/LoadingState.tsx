import React, { useEffect, useState } from 'react';

const messages = [
  "Uploading your presentation...",
  "Analyzing speech patterns...",
  "Detecting filler words...",
  "Evaluating tone and confidence...",
  "Generating feedback report..."
];

export const LoadingState: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🧠</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Performance</h3>
      <p className="text-gray-500 animate-pulse text-center min-w-[250px]">
        {messages[msgIndex]}
      </p>
    </div>
  );
};
