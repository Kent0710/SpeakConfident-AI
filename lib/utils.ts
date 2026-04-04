import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Helper to convert file to Base64
export const fileToGenerativePart = async (
    file: File,
): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    return {
        inlineData: {
            data: base64Data,
            mimeType: file.type,
        },
    };
};
