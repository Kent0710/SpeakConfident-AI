export interface UploadFileType {
    name?: string;
    file: File;
    previewUrl?: string;
    type: "video" | "audio" | string;
}

export interface MetricType {
  category: string;
  score: number; // 0-100
  feedback: string;
}

export interface VisualMetricType {
  label: string;
  score: number;
  feedback: string;
}

export interface AnalysisResultType {
  id: string;
  overallScore: number;
  summary: string;
  metrics: MetricType[];
  visualAnalysis?: {
    generalFeedback: string;
    metrics: VisualMetricType[];
  };
  strengths: string[];
  improvements: string[];
  transcriptionSnippet: string;
  recording_url?: string;
}