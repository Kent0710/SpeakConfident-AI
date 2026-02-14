import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FileUpload } from './components/FileUpload';
import { LoadingState } from './components/LoadingState';
import { AnalysisView } from './components/AnalysisView';
import { AppState, UploadFile, AnalysisResult } from './types';
import { analyzePresentation } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentFile, setCurrentFile] = useState<UploadFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleStart = () => {
    setAppState(AppState.UPLOADING);
  };

  const handleFileSelect = async (fileData: UploadFile) => {
    setCurrentFile(fileData);
    setAppState(AppState.ANALYZING);
    setErrorMsg('');

    try {
      const result = await analyzePresentation(fileData.file);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during analysis. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentFile(null);
    setAnalysisResult(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full">
            {appState === AppState.IDLE && (
            <Hero onStart={handleStart} />
            )}

            {appState === AppState.UPLOADING && (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                 <div className="flex items-center gap-2 mb-8 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors" onClick={handleReset}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back
                 </div>
                <FileUpload onFileSelect={handleFileSelect} />
            </div>
            )}

            {appState === AppState.ANALYZING && (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                {currentFile && (
                    <div className="mb-8 w-64 h-36 bg-black rounded-lg overflow-hidden shadow-lg relative">
                        {currentFile.type === 'video' ? (
                            <video src={currentFile.previewUrl} className="w-full h-full object-cover opacity-50" muted loop autoPlay />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-900 opacity-50">
                                <span className="text-4xl">🎵</span>
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-indigo-500/50 absolute top-1/2 transform -translate-y-1/2 animate-pulse"></div>
                        </div>
                    </div>
                )}
                <LoadingState />
            </div>
            )}

            {appState === AppState.RESULTS && analysisResult && (
            <div className="py-10">
                <AnalysisView result={analysisResult} onReset={handleReset} />
            </div>
            )}

            {appState === AppState.ERROR && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h3>
                <p className="text-gray-500 max-w-md mb-8">{errorMsg}</p>
                <button
                onClick={handleReset}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                Try Again
                </button>
            </div>
            )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto relative z-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SpeakConfident AI. We help students sound confident before it matters.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
