import {
    CopilotRuntime,
    OpenAIAdapter,
    GoogleGenerativeAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

function getServiceAdapter() {
    // Support both OpenAI and Google Gemini — auto-detect which key is available
    if (process.env.OPENAI_API_KEY) {
        console.log("🔑 Using OpenAI adapter");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        return new OpenAIAdapter({ openai } as any);
    }

    if (process.env.GOOGLE_API_KEY) {
        console.log("🔑 Using Google Gemini adapter");
        return new GoogleGenerativeAIAdapter({
            model: "gemini-2.0-flash",
        });
    }

    throw new Error(
        "No API key found. Set either OPENAI_API_KEY or GOOGLE_API_KEY in your .env file."
    );
}

export const POST = async (req: NextRequest) => {
    try {
        const serviceAdapter = getServiceAdapter();
        const runtime = new CopilotRuntime();

        const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
            runtime,
            serviceAdapter,
            endpoint: "/api/copilotkit",
        });

        return handleRequest(req);
    } catch (error) {
        console.error("[DealFlow] Runtime error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
};
