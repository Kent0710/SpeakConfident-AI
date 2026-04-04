import { create } from 'zustand';
import { UploadFileType } from '@/types';

interface FileState {
  currentFile: UploadFileType | null;
  setCurrentFile: (file: UploadFileType | null) => void;
  clearFile: () => void;
}

export const useFileStore = create<FileState>((set) => ({
  currentFile: null,
  
  setCurrentFile: (file) => set({ currentFile: file }),
  
  clearFile: () => set({ currentFile: null }),
}));