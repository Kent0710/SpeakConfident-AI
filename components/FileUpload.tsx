import React, { useState, useRef } from "react";
import { UploadFile } from "../types";
import { Upload } from "lucide-react";

interface FileUploadProps {
    onFileSelect: (file: UploadFile) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");

        if (!isVideo && !isAudio) {
            alert("Please upload a video or audio file.");
            return;
        }

        // Limit size to 20MB for inline data API limits
        if (file.size > 20 * 1024 * 1024) {
            alert(
                "File size is too large for this demo. Please use a file under 20MB.",
            );
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        onFileSelect({
            file,
            previewUrl,
            type: isVideo ? "video" : "audio",
        });
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-10 p-6 animate-fade-in">
            <div
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer
          ${
              isDragging
                  ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                  : "border-gray-300 hover:border-fuchsia-400 hover:bg-gray-50 bg-white"
          }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*,audio/*"
                    className="hidden"
                />

                <div
                  className="flex mb-4 justify-center "
                  >
                    <Upload className="" size={50} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Upload your presentation
                </h3>
                <p className="text-gray-500 mb-6">
                    Drag & drop video/audio here, or click to browse
                </p>

                <div className="text-xs text-gray-400 mt-4">
                    Supported: MP4, MOV, MP3, WAV (Max 20MB)
                </div>
            </div>
        </div>
    );
};
