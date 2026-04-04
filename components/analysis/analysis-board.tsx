'use client'

import { useAnalysisResultStore } from "@/store/use-analysis-result";

const AnalysisBoard = () => {
    const { analysisResult } = useAnalysisResultStore();

    return (
        <div>   
            <pre>
                {JSON.stringify(analysisResult, null, 2)}
            </pre>

            this is the analysisboard
        </div>
    )
};

export default AnalysisBoard;