import { NextRequest, NextResponse } from "next/server";
import { graph } from "@/lib/agent";

/**
 * LangGraph Agent Endpoint
 * 
 * This endpoint exposes the DealFlow LangGraph agent as an HTTP endpoint
 * that CopilotKit's `LangGraphHttpAgent` can connect to.
 * 
 * The agent runs as a co-agent alongside the frontend tools,
 * enabling true agentic architecture with:
 * - Backend tool execution via LangGraph
 * - CopilotKit middleware for state synchronization
 * - AG-UI protocol compliance
 */
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        // Invoke the LangGraph agent
        const result = await graph.invoke({
            messages: body.messages || [],
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[DealFlow Agent] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Agent execution error" },
            { status: 500 }
        );
    }
};
