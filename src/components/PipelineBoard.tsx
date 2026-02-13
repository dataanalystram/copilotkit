"use client";

import { useState, useCallback } from "react";
import { useCopilotReadable, useCopilotAction, useCopilotChatSuggestions } from "@copilotkit/react-core";
import { Deal, DealStage, PIPELINE_STAGES, STAGE_CONFIG, SAMPLE_DEALS } from "@/lib/types";
import { DealCard } from "./DealCard";
import { PipelineSummary } from "./PipelineSummary";
import { DealPreview, MovePreview, CloseDealConfirm } from "./GenerativeUI";
import confetti from "canvas-confetti";

// 🎉 Fire confetti when a deal is won
function fireCelebration() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#22c55e", "#a855f7", "#f59e0b", "#818cf8"],
    });
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#6366f1", "#22c55e"],
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#a855f7", "#f59e0b"],
        });
    }, 250);
}

export function PipelineBoard() {
    const [deals, setDeals] = useState<Deal[]>(SAMPLE_DEALS);

    // ── Smart context for the copilot ───────────────────────────────
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const activeDeals = deals.filter(
        (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
    );
    const wonDeals = deals.filter((d) => d.stage === "closed_won");
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

    useCopilotReadable({
        description: "Current sales pipeline state with all deals and analytics",
        value: JSON.stringify({
            summary: {
                totalDeals: deals.length,
                totalPipelineValue: totalValue,
                activeDeals: activeDeals.length,
                closedWon: wonDeals.length,
                closedWonValue: wonValue,
            },
            deals: deals.map((d) => ({
                name: d.name,
                company: d.company,
                value: d.value,
                stage: d.stage,
                stageLabel: STAGE_CONFIG[d.stage].label,
                contact: d.contactName,
                email: d.contactEmail,
            })),
        }),
    });

    // ── Chat suggestion chips (guided experience) ───────────────────
    useCopilotChatSuggestions({
        instructions: `Based on the current pipeline state, suggest 3 helpful actions. Available deals: ${deals.map((d) => `${d.name} (${STAGE_CONFIG[d.stage].label})`).join(", ")}. Suggest realistic next steps like moving deals forward, creating new deals, getting analytics, or closing deals. Keep suggestions short and actionable (under 8 words).`,
        maxSuggestions: 3,
    });

    // ── Tool: Create Deal (with Generative UI) ─────────────────────
    useCopilotAction({
        name: "create_deal",
        description:
            "Create a new deal in the sales pipeline. Use this when the user wants to add a new deal, opportunity, or prospect.",
        parameters: [
            { name: "name", type: "string", description: "Deal name/title", required: true },
            { name: "value", type: "number", description: "Deal value in USD", required: true },
            { name: "company", type: "string", description: "Company name", required: true },
            { name: "contactName", type: "string", description: "Contact person name" },
            { name: "contactEmail", type: "string", description: "Contact email" },
            {
                name: "stage",
                type: "string",
                description: "Pipeline stage: lead, qualified, proposal, negotiation, closed_won, closed_lost. Defaults to lead.",
            },
        ],
        handler: async ({ name, value, company, contactName, contactEmail, stage }) => {
            const newDeal: Deal = {
                id: `deal_${Date.now()}`,
                name,
                value,
                company,
                contactName: contactName || "",
                contactEmail: contactEmail || "",
                stage: (stage as DealStage) || "lead",
                createdAt: new Date().toISOString(),
            };
            setDeals((prev) => [...prev, newDeal]);
            return `✅ Deal "${name}" created in ${STAGE_CONFIG[(stage as DealStage) || "lead"].label} stage — $${value.toLocaleString()} for ${company}.`;
        },
        render: ({ status, args }) => (
            <DealPreview
                deal={{
                    name: args.name,
                    value: args.value,
                    company: args.company,
                    contactName: args.contactName,
                    stage: (args.stage as DealStage) || "lead",
                }}
                status={status}
            />
        ),
    });

    // ── Tool: Move Deal (with Generative UI) ────────────────────────
    useCopilotAction({
        name: "move_deal",
        description: "Move an existing deal to a different pipeline stage. Use when the user wants to advance, promote, or change a deal's stage.",
        parameters: [
            { name: "dealName", type: "string", description: "Name of the deal to move (case-insensitive)", required: true },
            {
                name: "newStage",
                type: "string",
                description: "Target stage: lead, qualified, proposal, negotiation. For closing deals use the close_deal tool instead.",
                required: true,
            },
        ],
        handler: async ({ dealName, newStage }) => {
            const dealIndex = deals.findIndex(
                (d) => d.name.toLowerCase() === dealName.toLowerCase()
            );
            if (dealIndex === -1) {
                return `❌ Deal "${dealName}" not found. Available deals: ${deals.map((d) => d.name).join(", ")}`;
            }
            setDeals((prev) => {
                const updated = [...prev];
                updated[dealIndex] = { ...updated[dealIndex], stage: newStage as DealStage };
                return updated;
            });
            return `✅ Deal "${dealName}" moved to ${STAGE_CONFIG[newStage as DealStage].label}.`;
        },
        render: ({ status, args }) => (
            <MovePreview
                dealName={args.dealName || ""}
                newStage={args.newStage || "lead"}
                status={status}
            />
        ),
    });

    // ── Tool: Pipeline Summary (with Generative UI) ─────────────────
    useCopilotAction({
        name: "get_pipeline_summary",
        description:
            "Show a visual summary and analytics of the current sales pipeline. Use when asked about pipeline health, stats, totals, or overview.",
        parameters: [],
        handler: async () => {
            return `📊 Pipeline: ${deals.length} deals worth $${totalValue.toLocaleString()}. ${activeDeals.length} active, ${wonDeals.length} won ($${wonValue.toLocaleString()}).`;
        },
        render: ({ status }) =>
            status === "complete" ? <PipelineSummary deals={deals} /> : (
                <div className="deal-preview-loading">
                    <div className="loading-spinner"></div>
                    <span>Analyzing pipeline...</span>
                </div>
            ),
    });

    // ── Tool: Close Deal (HITL — Human in the Loop) ─────────────────
    useCopilotAction({
        name: "close_deal",
        description:
            "Close a deal as won or lost. This is a significant, irreversible action that requires user confirmation via Human-in-the-Loop.",
        parameters: [
            { name: "dealName", type: "string", description: "Name of the deal to close", required: true },
            {
                name: "outcome",
                type: "string",
                description: "Either 'closed_won' or 'closed_lost'",
                required: true,
            },
        ],
        renderAndWaitForResponse: ({ args, status, respond }) => (
            <CloseDealConfirm
                dealName={args.dealName || ""}
                outcome={args.outcome || "closed_won"}
                isExecuting={status === "executing"}
                onConfirm={() => {
                    const dealIndex = deals.findIndex(
                        (d) => d.name.toLowerCase() === (args.dealName || "").toLowerCase()
                    );
                    if (dealIndex !== -1) {
                        const isWon = (args.outcome || "closed_won") === "closed_won";
                        setDeals((prev) => {
                            const updated = [...prev];
                            updated[dealIndex] = {
                                ...updated[dealIndex],
                                stage: (args.outcome as DealStage) || "closed_won",
                            };
                            return updated;
                        });
                        // 🎉 Confetti on deal won!
                        if (isWon) {
                            setTimeout(fireCelebration, 300);
                        }
                    }
                    respond?.({ approved: true, outcome: args.outcome });
                }}
                onCancel={() => {
                    respond?.({ approved: false });
                }}
            />
        ),
    });

    // ── Render Pipeline Board ───────────────────────────────────────

    const getDealsForStage = useCallback(
        (stage: DealStage) => deals.filter((d) => d.stage === stage),
        [deals]
    );

    return (
        <div className="pipeline-container">
            {/* Header */}
            <header className="pipeline-header">
                <div className="header-left">
                    <h1 className="app-title">
                        <span className="title-icon">⚡</span>
                        DealFlow
                    </h1>
                    <span className="app-subtitle">AI-Powered Sales Pipeline</span>
                </div>
                <div className="header-stats">
                    <div className="header-stat">
                        <span className="header-stat-value">{deals.length}</span>
                        <span className="header-stat-label">Deals</span>
                    </div>
                    <div className="header-stat">
                        <span className="header-stat-value">
                            ${(totalValue / 1000).toFixed(0)}k
                        </span>
                        <span className="header-stat-label">Pipeline</span>
                    </div>
                    <div className="header-stat active-stat">
                        <span className="header-stat-value">{activeDeals.length}</span>
                        <span className="header-stat-label">Active</span>
                    </div>
                    <div className="header-stat won-stat">
                        <span className="header-stat-value">
                            ${(wonValue / 1000).toFixed(0)}k
                        </span>
                        <span className="header-stat-label">Won</span>
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="pipeline-board">
                {PIPELINE_STAGES.map((stage) => {
                    const config = STAGE_CONFIG[stage];
                    const stageDeals = getDealsForStage(stage);
                    const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

                    return (
                        <div key={stage} className="pipeline-column">
                            <div className="column-header">
                                <div className="column-title-row">
                                    <div className="column-info">
                                        <span className="column-emoji">{config.emoji}</span>
                                        <h3 className="column-title">{config.label}</h3>
                                    </div>
                                    <span className="column-count">{stageDeals.length}</span>
                                </div>
                                <div
                                    className="column-bar"
                                    style={{
                                        background: config.color, // Pure color for Apple style
                                    }}
                                />
                                <span className="column-value">
                                    ${stageValue.toLocaleString()}
                                </span>
                            </div>
                            <div className="column-deals">
                                {stageDeals.map((deal) => (
                                    <DealCard key={deal.id} deal={deal} />
                                ))}
                                {stageDeals.length === 0 && (
                                    <div className="empty-column">
                                        <span className="empty-icon">📭</span>
                                        <span>No deals yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <footer className="pipeline-footer">
                <span>Built with</span>
                <a href="https://copilotkit.ai" target="_blank" rel="noopener noreferrer" className="footer-link">
                    CopilotKit
                </a>
                <span>+</span>
                <a href="https://langchain-ai.github.io/langgraphjs/" target="_blank" rel="noopener noreferrer" className="footer-link">
                    LangGraph JS
                </a>
                <span className="footer-divider">|</span>
                <span className="footer-hint">💡 Try: &quot;Show me a pipeline summary&quot;</span>
            </footer>
        </div>
    );
}
