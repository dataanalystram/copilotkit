import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
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

const analyzePipeline = tool(
    async () => {
        return JSON.stringify({
            action: "analyze_pipeline",
            description: "Comprehensive pipeline analytics with KPIs, stage distribution, win rate, and weighted forecast",
        });
    },
    {
        name: "analyze_pipeline",
        description:
            "Show a comprehensive pipeline analytics dashboard with KPIs, stage distribution chart, win rate, and weighted forecast. Use when the user asks about pipeline health, analytics, performance, or deep statistics.",
        schema: z.object({}),
    }
);

const getDealInsights = tool(
    async ({ dealName }) => {
        return JSON.stringify({
            action: "get_deal_insights",
            dealName,
            description: "AI-powered insights with risk score and suggested next action",
        });
    },
    {
        name: "get_deal_insights",
        description:
            "Get AI-powered insights for a specific deal including risk score (0-100), score breakdown factors, and suggested next action.",
        schema: z.object({
            dealName: z.string().describe("Name of the deal to analyze"),
        }),
    }
);

const scoreDeals = tool(
    async () => {
        return JSON.stringify({
            action: "score_deals",
            description: "AI-scored ranking of all active deals by health score",
        });
    },
    {
        name: "score_deals",
        description:
            "Score and rank all active deals by AI-computed health score. Shows a ranked list with risk levels, weighted values, and scores.",
        schema: z.object({}),
    }
);

const showActivity = tool(
    async () => {
        return JSON.stringify({
            action: "show_activity",
            description: "Recent activity log of all deal mutations with timestamps",
        });
    },
    {
        name: "show_activity",
        description:
            "Show the recent activity log of all deal mutations — creates, moves, closes, deletes. Shows who triggered each action (user vs AI) with timestamps.",
        schema: z.object({}),
    }
);

// All backend tools
const allTools = [
    createDeal,
    moveDeal,
    getPipelineSummary,
    analyzePipeline,
    getDealInsights,
    scoreDeals,
    showActivity,
];

// ── Agent Creation ────────────────────────────────────────────────

function getModel() {
    if (process.env.OPENAI_API_KEY) {
        return new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0.3,
        });
    }

    if (process.env.GOOGLE_API_KEY) {
        return new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0.3,
            apiKey: process.env.GOOGLE_API_KEY,
        });
    }

    // Fallback to OpenAI (will error if no key is set)
    return new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.3,
    });
}

export function createAgent() {
    const model = getModel();

    const agent = createReactAgent({
        llm: model,
        tools: allTools,
        prompt: `You are DealFlow AI, an expert sales pipeline copilot built with CopilotKit and LangGraph. You help sales teams manage their deals efficiently.

Your capabilities (9 tools):
- create_deal: Create new deals in the pipeline
- move_deal: Move deals between pipeline stages
- get_pipeline_summary: Quick pipeline overview with stats
- analyze_pipeline: Deep analytics dashboard with KPIs and charts
- get_deal_insights: AI scoring (0-100) for a specific deal with risk factors
- score_deals: Rank all active deals by health score
- show_activity: View activity timeline of all deal mutations

Pipeline stages (in order): Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost

Stage win probabilities for forecasting:
- Lead: 10% | Qualified: 25% | Proposal: 50% | Negotiation: 75% | Closed Won: 100% | Closed Lost: 0%

Guidelines:
- Always be helpful, concise, and proactive
- When creating deals, suggest reasonable defaults if not all info is provided
- When moving deals, confirm the action clearly
- For pipeline analysis, provide actionable insights
- Proactively suggest scoring deals or getting insights when appropriate
- Use a professional but friendly tone
- Format monetary values nicely (e.g., $50,000)
- If unsure about a deal name, ask for clarification
- You are a Tier 3 agentic application with advanced Generative UI capabilities`,
    });

    return agent;
}

// Export the graph for use by the agent endpoint
export const graph = createAgent();
