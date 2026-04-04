import { create } from "zustand";
import { AnalysisResultType } from "@/types";

interface AnalysisResultState {
    analysisResult: AnalysisResultType | null;
    isLoading: boolean;
    error: string | null;
    setAnalysisResult: (result: AnalysisResultType | null) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (message: string | null) => void;
    resetAnalysis: () => void;
}

export const useAnalysisResultStore = create<AnalysisResultState>((set) => ({
    analysisResult: null,
    isLoading: false,
    error: null,

    setAnalysisResult: (result) =>
        set({
            analysisResult: result,
            isLoading: false,
            error: null,
        }),

    setIsLoading: (loading) => set({ isLoading: loading }),

    setError: (message) => set({ error: message, isLoading: false }),

    resetAnalysis: () =>
        set({
            analysisResult: null,
            isLoading: false,
            error: null,
        }),
}));
