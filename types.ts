export interface Metric {
  category: string;
  score: number; // 0-100
  feedback: string;
}

export interface VisualMetric {
  label: string;
  score: number;
  feedback: string;
}

export interface AnalysisResult {
  overallScore: number;
  summary: string;
  metrics: Metric[];
  visualAnalysis?: {
    generalFeedback: string;
    metrics: VisualMetric[];
  };
  strengths: string[];
  improvements: string[];
  transcriptionSnippet: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface UploadFile {
  file: File;
  previewUrl: string;
  type: 'video' | 'audio';
}
