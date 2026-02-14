import React from "react";
import { AnalysisResult } from "../types";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface AnalysisViewProps {
    result: AnalysisResult;
    onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
    result,
    onReset,
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-green-100";
        if (score >= 60) return "bg-yellow-100";
        return "bg-red-100";
    };

    // Transform metrics for charts
    const chartData = result.metrics.map((m) => ({
        subject: m.category,
        A: m.score,
        fullMark: 100,
    }));

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in ">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Analysis Report
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here is how you sounded in your presentation.
                    </p>
                </div>
                <button
                    onClick={onReset}
                    className="
                            bg-gradient-to-r from-fuchsia-600 to-pink-600
                            px-8 py-2 rounded-full text-white font-semibold 
                            flex items-center gap-2 place-self-center md:place-self-start 
                        "
                >
                    Analyze Another
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Score */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-2">
                        Overall Score
                    </h3>
                    <div
                        className={`relative flex items-center justify-center w-32 h-32 rounded-full border-8 ${result.overallScore >= 80 ? "border-green-100" : result.overallScore >= 60 ? "border-yellow-100" : "border-red-100"}`}
                    >
                        <span
                            className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}
                        >
                            {result.overallScore}
                        </span>
                    </div>
                    <p className="mt-4 text-center text-gray-600 text-sm italic">
                        "{result.summary}"
                    </p>
                </div>

                {/* Radar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-1 md:col-span-2 flex flex-col">
                    <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-4">
                        Performance Dimensions
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                                cx="50%"
                                cy="50%"
                                outerRadius="80%"
                                data={chartData}
                            >
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: "#64748b", fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    tick={false}
                                    axisLine={false}
                                />
                                <Radar
                                    name="You"
                                    dataKey="A"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fill="#818cf8"
                                    fillOpacity={0.4}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Visual Analysis Section (Only for Videos) */}
            {result.visualAnalysis && (
                <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-2xl p-6 shadow-lg border border-pink-300 relative overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold">
                            Visual Presence Analysis
                        </h3>
                        <p className="text-indigo-200 mb-8 max-w-3xl ">
                            {result.visualAnalysis.generalFeedback}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {result.visualAnalysis.metrics.map(
                                (metric, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-lg tracking-wide">
                                                {metric.label}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold ${metric.score >= 80 ? "bg-green-500/30 text-green-200" : metric.score >= 60 ? "bg-yellow-500/30 text-yellow-200" : "bg-red-500/30 text-red-200"}`}
                                            >
                                                {metric.score}/100
                                            </span>
                                        </div>
                                        <div className="w-full bg-black/30 rounded-full h-1.5 mb-3">
                                            <div
                                                className={`h-1.5 rounded-full ${metric.score >= 80 ? "bg-green-400" : metric.score >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                                                style={{
                                                    width: `${metric.score}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-indigo-100/90 leading-relaxed">
                                            {metric.feedback}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Detailed Metrics */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-gray-900 font-bold text-lg mb-6">
                        Detailed Breakdown
                    </h3>
                    <div className="space-y-6">
                        {result.metrics.map((metric) => (
                            <div key={metric.category}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-700 font-medium">
                                        {metric.category}
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-bold ${getScoreBg(metric.score)} ${getScoreColor(metric.score)}`}
                                    >
                                        {metric.score}/100
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-1000 ${metric.score >= 80 ? "bg-green-500" : metric.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                                        style={{ width: `${metric.score}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {metric.feedback}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="space-y-6">
                    <div className="rounded-2xl p-6 border border-green-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            Top Strengths
                        </h3>
                        <ul className="space-y-3">
                            {result.strengths.map((str, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3 text-green-900 text-sm"
                                >
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {str}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className=" rounded-2xl p-6 border border-orange-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {result.improvements.map((imp, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3 text-orange-900 text-sm"
                                >
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                    {imp}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
