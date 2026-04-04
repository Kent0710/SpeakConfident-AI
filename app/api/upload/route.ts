import { NextRequest, NextResponse } from "next/server";
import { analyzePresentation } from "@/services/gemini-analyze-presentation";

export const runtime = "nodejs"; 

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: "No file provided or invalid file." },
                { status: 400 },
            );
        }

        const result = await analyzePresentation(file);

        return NextResponse.json(result, { status: 200 });
    } catch (err: unknown) {
        console.error("[/api/upload] Error:", err);

        const message =
            err instanceof Error ? err.message : "An unknown error occurred.";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
