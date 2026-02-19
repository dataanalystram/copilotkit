import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";

/**
 * LangGraph Agent Endpoint
 * 
 * Exposes the DealFlow LangGraph agent as an HTTP endpoint.
 * The agent runs with 7 backend tools and processes messages
 * through a ReAct agent pattern.
 */
export const POST = async (req: NextRequest) => {
    try {
        // Dynamic import to avoid module initialization errors at build time
        const { graph } = await import("@/lib/agent");

        const body = await req.json();
        const userMessages = body.messages || [];

        // Convert raw messages to LangChain format
        const messages = userMessages.map((msg: { role: string; content: string }) => {
            if (msg.role === "user") {
                return new HumanMessage(msg.content);
            }
            return new HumanMessage(msg.content); // fallback
        });

        if (messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        // Invoke the LangGraph ReAct agent
        const result = await graph.invoke({
            messages,
        });

        // Extract the last AI message
        const lastMessage = result.messages[result.messages.length - 1];

        return NextResponse.json({
            success: true,
            response: lastMessage?.content || "No response",
            messageCount: result.messages.length,
            agentType: "LangGraph ReAct Agent",
            tools: ["create_deal", "move_deal", "get_pipeline_summary", "analyze_pipeline", "get_deal_insights", "score_deals", "show_activity"],
        });
    } catch (error) {
        console.error("[DealFlow Agent] Error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Agent execution error",
                hint: "Make sure OPENAI_API_KEY or GOOGLE_API_KEY is set in .env",
            },
            { status: 500 }
        );
    }
};
