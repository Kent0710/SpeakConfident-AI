"use client";

import { useAnalysisResultStore } from "@/store/use-analysis-result";
import { AnalysisResultType } from "@/types";
import React from "react";
import { useEffect } from "react";

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
        return <div>Loading analysis...</div>;
    }

    return (
        <div className="flex gap-4 w-full h-full">
            {/* left result  */}
            <section className="flex-1 flex-col flex border p-4 rounded-2xl">
                <div>
                    {/* overall score  */}
                    <div className="flex flex-col gap-2 justify-center items-center">
                        <p className="font-semibold"
                            onClick={() => console.log(analysisResult)}
                        >Overall Score</p>
                        <p className="text-4xl p-8 rounded-full border-10 border-primary/20">
                            {analysisResult.overallScore}
                        </p>
                        <p className="text-muted-foreground text-center mt-4">
                            {" "}
                            {analysisResult.summary}{" "}
                        </p>
                    </div>
                </div>
                <div className='flex'>
                    <div className="w-[50%]">
                     
                    </div>
                    <div className='w-[50%]'>

                    </div>
                </div>

            </section>

            {/* right chat  */}
            <section className="w-[40%] border p-4 rounded-2xl"></section>
        </div>
    );
};

export default AnalysisBoard;
