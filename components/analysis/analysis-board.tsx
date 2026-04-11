"use client";

import { useAnalysisResultStore } from "@/store/use-analysis-result";
import { AnalysisResultType } from "@/types";
import React, { useEffect } from "react";
import ChatCoach from "./chat-coach";
import { 
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from "recharts";

interface AnalysisBoardProps {
    data: AnalysisResultType;
}

const AnalysisBoard: React.FC<AnalysisBoardProps> = ({ data }) => {
    const { analysisResult, setAnalysisResult } = useAnalysisResultStore();

    useEffect(() => {
        const checkExistingAnalysis = () => {
            if (analysisResult && analysisResult.id === data.id) {
                return;
            } else {
                setAnalysisResult(data);
            }
        };

        checkExistingAnalysis();
    }, [analysisResult, data, setAnalysisResult]);

    if (!analysisResult) {
        return <div className="p-8 text-center text-muted-foreground w-full">Loading analysis...</div>;
    }

    const audioAvg = analysisResult.metrics.length > 0 
        ? Math.round(analysisResult.metrics.reduce((acc, m) => acc + m.score, 0) / analysisResult.metrics.length) 
        : 0;
        
    const visualAvg = analysisResult.visualAnalysis?.metrics && analysisResult.visualAnalysis.metrics.length > 0
        ? Math.round(analysisResult.visualAnalysis.metrics.reduce((acc, m) => acc + m.score, 0) / analysisResult.visualAnalysis.metrics.length)
        : null;

    const audioData = analysisResult.metrics.map(m => ({
        subject: m.category,
        score: m.score,
        fullMark: 100,
    }));

    const visualData = analysisResult.visualAnalysis?.metrics?.map(m => ({
        subject: m.label,
        score: m.score,
        fullMark: 100,
    })) || [];

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full h-full p-4 sm:p-6 overflow-hidden">
            {/* Left Result - Dashboard Scrollable Area */}
            <section className="flex-[2] flex flex-col gap-6 overflow-y-auto pr-2 pb-6 min-h-0">
                
                {/* Recording Player */}
                {analysisResult.recording_url ? (
                    <div className="border bg-card p-6 rounded-2xl shadow-sm flex flex-col">
                        <h2 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">Recording</h2>
                        <div className="w-full rounded-xl overflow-hidden bg-black flex justify-center">
                            <video 
                                src={analysisResult.recording_url} 
                                controls 
                                className="w-full max-h-[400px] object-contain"
                            />
                        </div>
                    </div>
                ): (
                    <div
                        onClick={()=>console.log(data)}
                    >no recording</div>
                )}

                {/* Header overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1 flex flex-col items-center justify-center border bg-card p-6 rounded-2xl shadow-sm text-center">
                        <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Overall Score</h2>
                        <div className="text-6xl font-bold tracking-tighter text-primary">
                            {analysisResult.overallScore}
                        </div>
                        <div className="mt-4 flex gap-4 text-sm text-muted-foreground font-medium">
                            <span className="bg-muted px-2 py-1 rounded-md">Audio: {audioAvg}</span>
                            {visualAvg !== null && <span className="bg-muted px-2 py-1 rounded-md">Visual: {visualAvg}</span>}
                        </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center border bg-card p-6 rounded-2xl shadow-sm">
                        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Executive Summary</h2>
                        <p className="text-foreground leading-relaxed text-lg font-medium">
                            {analysisResult.summary}
                        </p>
                    </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border bg-card p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-medium mb-4 text-green-600 dark:text-green-500 uppercase tracking-wide">Key Strengths</h3>
                        <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground text-sm">
                            {analysisResult.strengths.map((str, idx) => (
                                <li key={idx} className="leading-relaxed pl-1">{str}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="border bg-card p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-medium mb-4 text-orange-600 dark:text-orange-500 uppercase tracking-wide">Areas for Improvement</h3>
                        <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground text-sm">
                            {analysisResult.improvements.map((imp, idx) => (
                                <li key={idx} className="leading-relaxed pl-1">{imp}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Radar Charts for Metrics */}
                <div className={`grid grid-cols-1 ${visualAvg !== null ? 'md:grid-cols-2' : ''} gap-4`}>
                    <div className="border bg-card p-6 rounded-2xl shadow-sm flex flex-col items-center">
                        <h3 className="text-sm font-medium w-full text-left mb-4 text-muted-foreground uppercase tracking-wide">Audio Breakdowns</h3>
                        <div className="h-[280px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height={280}>
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={audioData}>
                                    <PolarGrid opacity={0.2} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: 'currentColor', opacity: 0.8 }} />
                                    <PolarRadiusAxis angle={30} domain={['dataMin - 15', 100]} opacity={0} />
                                    <Radar name="Audio" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {visualAvg !== null && (
                        <div className="border bg-card p-6 rounded-2xl shadow-sm flex flex-col items-center">
                            <h3 className="text-sm font-medium w-full text-left mb-4 text-muted-foreground uppercase tracking-wide">Visual Breakdowns</h3>
                            <div className="h-[280px] w-full min-w-0">
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={visualData}>
                                        <PolarGrid opacity={0.2} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fill: 'currentColor', opacity: 0.8 }} />
                                        <PolarRadiusAxis angle={30} domain={['dataMin - 15', 100]} opacity={0} />
                                        <Radar name="Visual" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detailed Feedback Breakdown */}
                <div className="border bg-card p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-6">Detailed Feedback</h3>
                    
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide border-b pb-2">Audio Metrics</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {analysisResult.metrics.map((metric, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl bg-muted/40">
                                        <div className="flex flex-col min-w-[150px]">
                                            <span className="font-semibold text-foreground">{metric.category}</span>
                                            <span className="text-3xl font-bold tracking-tight text-primary mt-1">{metric.score}</span>
                                            <div className="w-full bg-primary/20 rounded-full h-1.5 mt-auto mb-1">
                                                <div 
                                                    className="bg-primary h-1.5 rounded-full" 
                                                    style={{ width: `${Math.max(0, Math.min(100, metric.score))}%` }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed pt-1 sm:border-l sm:pl-4 border-muted-foreground/20">
                                            {metric.feedback}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {visualAvg !== null && analysisResult.visualAnalysis && (
                            <div>
                                <h4 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide border-b pb-2 mt-8">Visual Metrics</h4>
                                {analysisResult.visualAnalysis.generalFeedback && (
                                    <p className="text-sm text-foreground/80 mb-6 italic border-l-2 pl-4 border-muted-foreground/30">
                                        &quot;{analysisResult.visualAnalysis.generalFeedback}&quot;
                                    </p>
                                )}
                                <div className="grid grid-cols-1 gap-4">
                                    {analysisResult.visualAnalysis.metrics.map((metric, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl bg-muted/40">
                                            <div className="flex flex-col min-w-[150px]">
                                                <span className="font-semibold text-foreground">{metric.label}</span>
                                                <span className="text-3xl font-bold tracking-tight text-purple-500 mt-1">{metric.score}</span>
                                                <div className="w-full bg-purple-500/20 rounded-full h-1.5 mt-auto mb-1">
                                                    <div 
                                                        className="bg-purple-500 h-1.5 rounded-full" 
                                                        style={{ width: `${Math.max(0, Math.min(100, metric.score))}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground/80 leading-relaxed pt-1 sm:border-l sm:pl-4 border-muted-foreground/20">
                                                {metric.feedback}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transcription */}
                {analysisResult.transcriptionSnippet && (
                    <div className="border bg-card p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Speech Snippet</h3>
                        <p className="text-sm text-foreground/80 italic font-mono bg-muted/30 p-4 rounded-xl">
                            &quot;{analysisResult.transcriptionSnippet}&quot;
                        </p>
                    </div>
                )}
            </section>

            {/* Right Chat Column */}
            <section className="flex-1 min-w-[300px] border-none shadow-none p-0 flex flex-col h-full">
                <ChatCoach data={analysisResult} />
            </section>
        </div>
    );
};

export default AnalysisBoard;
