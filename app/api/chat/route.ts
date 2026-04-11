import { NextRequest, NextResponse } from "next/server";
import { getChatCoachResponse } from "@/services/gemini-chat-coach";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const responseText = await getChatCoachResponse(messages, context);

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
