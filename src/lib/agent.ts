import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// ── Tool Definitions ──────────────────────────────────────────────

const createDeal = tool(
    async ({ name, value, company, contactName, contactEmail, stage }) => {
        return JSON.stringify({
            action: "create_deal",
            deal: {
                id: `deal_${Date.now()}`,
                name,
                value,
                company,
                contactName: contactName || "",
                contactEmail: contactEmail || "",
                stage: stage || "lead",
                createdAt: new Date().toISOString(),
            },
        });
    },
    {
        name: "create_deal",
        description:
            "Create a new deal in the sales pipeline. Use this when the user wants to add a new deal, opportunity, or prospect.",
        schema: z.object({
            name: z.string().describe("The name/title of the deal"),
            value: z.number().describe("The monetary value of the deal in USD"),
            company: z.string().describe("The company name associated with the deal"),
            contactName: z
                .string()
                .optional()
                .describe("The primary contact person's name"),
            contactEmail: z
                .string()
                .optional()
                .describe("The primary contact person's email"),
            stage: z
                .enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"])
                .optional()
                .describe(
                    "The pipeline stage. Defaults to 'lead'. Options: lead, qualified, proposal, negotiation, closed_won, closed_lost"
                ),
        }),
    }
);

const moveDeal = tool(
    async ({ dealName, newStage }) => {
        return JSON.stringify({
            action: "move_deal",
            dealName,
            newStage,
        });
    },
    {
        name: "move_deal",
        description:
            "Move an existing deal to a different stage in the pipeline. Use this when the user wants to advance, promote, or move a deal.",
        schema: z.object({
            dealName: z
                .string()
                .describe("The name of the deal to move (case-insensitive match)"),
            newStage: z
                .enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"])
                .describe(
                    "The target stage to move the deal to. Options: lead, qualified, proposal, negotiation, closed_won, closed_lost"
                ),
        }),
    }
);

const getPipelineSummary = tool(
    async () => {
        return JSON.stringify({
            action: "get_pipeline_summary",
        });
    },
    {
        name: "get_pipeline_summary",
        description:
            "Get a summary and analytics of the current sales pipeline. Use this when the user asks about pipeline health, stats, totals, or overview.",
        schema: z.object({}),
    }
);

// ── Agent Creation ────────────────────────────────────────────────

export function createAgent() {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.3,
    });

    const agent = createReactAgent({
        llm: model,
        tools: [createDeal, moveDeal, getPipelineSummary],
        prompt: `You are DealFlow AI, an expert sales pipeline copilot. You help sales teams manage their deals efficiently.

Your capabilities:
- Create new deals in the pipeline with the create_deal tool
- Move deals between pipeline stages with the move_deal tool
- Provide pipeline analytics and summaries with the get_pipeline_summary tool

Pipeline stages (in order): Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost

Guidelines:
- Always be helpful, concise, and proactive
- When creating deals, suggest reasonable defaults if not all info is provided
- When moving deals, confirm the action clearly
- For pipeline summaries, provide actionable insights
- Use a professional but friendly tone
- Format monetary values nicely (e.g., $50,000)
- If unsure about a deal name for moving, ask for clarification`,
    });

    return agent;
}
