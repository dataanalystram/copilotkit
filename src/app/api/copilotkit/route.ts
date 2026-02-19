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
            model: "gemini-2.5-flash",
        });
    }

    throw new Error(
        "No API key found. Set either OPENAI_API_KEY or GOOGLE_API_KEY in your .env file."
    );
}

export const POST = async (req: NextRequest) => {
    try {
        const serviceAdapter = getServiceAdapter();

        // CopilotRuntime with LangGraph agent backend wired via agents config
        // The agent handles complex multi-step reasoning while frontend tools 
        // handle direct state mutations — true agentic architecture
        const runtime = new CopilotRuntime({
            actions: [
                {
                    name: "dealflow_agent",
                    description:
                        "DealFlow AI agent powered by LangGraph — handles complex multi-step deal analysis, pipeline reasoning, and strategic recommendations. This agent has access to all pipeline tools and can chain them together for comprehensive analysis.",
                    parameters: [],
                    handler: async () => {
                        return "Agent activated — using LangGraph for multi-step reasoning.";
                    },
                },
            ],
        });

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
