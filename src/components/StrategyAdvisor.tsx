"use client";

import { Deal, DealStage, STAGE_CONFIG, STAGE_PROBABILITY } from "@/lib/types";
import { computeDealScore } from "./DealInsights";

interface StrategyAction {
    id: string;
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    dealName?: string;
    actionType: "move" | "follow_up" | "create" | "close" | "alert";
    emoji: string;
}

interface StrategyAdvisorProps {
    deals: Deal[];
    status: "inProgress" | "executing" | "complete";
    respond?: (response: string) => void;
}

// Generate strategy actions based on pipeline analysis
function generateStrategy(deals: Deal[]): {
    actions: StrategyAction[];
    healthScore: number;
    summary: string;
} {
    const actions: StrategyAction[] = [];
    const activeDeals = deals.filter(d => d.stage !== "closed_won" && d.stage !== "closed_lost");
    const totalValue = deals.reduce((s, d) => s + d.value, 0);
    const wonDeals = deals.filter(d => d.stage === "closed_won");
    const lostDeals = deals.filter(d => d.stage === "closed_lost");
    const closedCount = wonDeals.length + lostDeals.length;
    const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 50;

    // Score each deal
    const scoredDeals = activeDeals.map(deal => ({
        deal,
        ...computeDealScore(deal, deals),
    })).sort((a, b) => a.score - b.score);

    // Strategy 1: High-risk deals need attention
    const highRisk = scoredDeals.filter(sd => sd.riskLevel === "high");
    if (highRisk.length > 0) {
        actions.push({
            id: `strat_${Date.now()}_1`,
            title: `Rescue ${highRisk.length} at-risk deal${highRisk.length > 1 ? "s" : ""}`,
            description: `${highRisk.map(sd => `"${sd.deal.name}" (score: ${sd.score})`).join(", ")} need${highRisk.length === 1 ? "s" : ""} immediate attention. ${highRisk[0].suggestedAction}`,
            impact: "high",
            dealName: highRisk[0].deal.name,
            actionType: "alert",
            emoji: "🚨",
        });
    }

    // Strategy 2: Advance deals close to closing
    const nearClose = scoredDeals.filter(sd => sd.deal.stage === "negotiation");
    if (nearClose.length > 0) {
        const topDeal = nearClose.sort((a, b) => b.deal.value - a.deal.value)[0];
        actions.push({
            id: `strat_${Date.now()}_2`,
            title: `Close "${topDeal.deal.name}" ($${(topDeal.deal.value / 1000).toFixed(0)}k)`,
            description: `This deal is in negotiation and worth $${topDeal.deal.value.toLocaleString()}. Prepare final terms and push for commitment this week.`,
            impact: "high",
            dealName: topDeal.deal.name,
            actionType: "close",
            emoji: "🏆",
        });
    }

    // Strategy 3: Move qualified deals to proposal
    const qualifiedDeals = activeDeals.filter(d => d.stage === "qualified");
    if (qualifiedDeals.length > 0) {
        const topQualified = qualifiedDeals.sort((a, b) => b.value - a.value)[0];
        actions.push({
            id: `strat_${Date.now()}_3`,
            title: `Send proposal to ${topQualified.company}`,
            description: `"${topQualified.name}" ($${topQualified.value.toLocaleString()}) has been qualified. Move to Proposal stage by sending a tailored pricing proposal.`,
            impact: "medium",
            dealName: topQualified.name,
            actionType: "move",
            emoji: "📄",
        });
    }

    // Strategy 4: Leads that need qualification
    const leads = activeDeals.filter(d => d.stage === "lead");
    if (leads.length > 0) {
        actions.push({
            id: `strat_${Date.now()}_4`,
            title: `Qualify ${leads.length} lead${leads.length > 1 ? "s" : ""}`,
            description: `${leads.map(d => `"${d.name}"`).join(", ")} are still in Lead stage. Schedule discovery calls to understand requirements and budget.`,
            impact: leads.length > 2 ? "high" : "medium",
            actionType: "follow_up",
            emoji: "📞",
        });
    }

    // Strategy 5: Pipeline gap analysis
    const forecastValue = activeDeals.reduce((s, d) => s + d.value * (STAGE_PROBABILITY[d.stage] || 0), 0);
    if (forecastValue < totalValue * 0.3) {
        actions.push({
            id: `strat_${Date.now()}_5`,
            title: "Build pipeline — forecast is thin",
            description: `Weighted forecast is only $${(forecastValue / 1000).toFixed(0)}k (${Math.round((forecastValue / totalValue) * 100)}% of total pipeline). Create new high-value deals or advance existing ones fast.`,
            impact: "high",
            actionType: "create",
            emoji: "📈",
        });
    }

    // Overall health
    const healthScore = Math.min(100, Math.round(
        (winRate * 0.3) +
        (Math.min(activeDeals.length, 10) * 3) +
        (nearClose.length > 0 ? 20 : 0) +
        (highRisk.length === 0 ? 20 : 0) +
        (leads.length > 0 ? 10 : 0)
    ));

    const summary = activeDeals.length === 0
        ? "No active deals. Focus on building your pipeline."
        : `${activeDeals.length} active deals worth $${(totalValue / 1000).toFixed(0)}k. ${highRisk.length > 0 ? `⚠️ ${highRisk.length} at-risk.` : "✅ No critical risks."} Win rate: ${winRate}%.`;

    return { actions: actions.slice(0, 5), healthScore, summary };
}

export function StrategyAdvisor({ deals, status, respond }: StrategyAdvisorProps) {
    const isLoading = status === "inProgress" || status === "executing";
    const strategy = generateStrategy(deals);

    const impactColors = { high: "#ff453a", medium: "#ff9f0a", low: "#30d158" };
    const impactLabels = { high: "High Impact", medium: "Medium", low: "Low" };
    const healthColor = strategy.healthScore >= 70 ? "#30d158" : strategy.healthScore >= 40 ? "#ff9f0a" : "#ff453a";

    return (
        <div style={{
            background: "rgba(28, 28, 30, 0.95)",
            border: "0.5px solid rgba(191, 90, 242, 0.2)",
            borderRadius: "16px",
            padding: "20px",
            color: "#fff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: "14px",
            minWidth: "340px",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "16px", paddingBottom: "14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <span style={{ fontSize: "1.4rem" }}>🧠</span>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                        AI Strategy Advisor
                    </h3>
                    <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "rgba(235,235,245,0.5)" }}>
                        {isLoading ? "Analyzing your pipeline..." : strategy.summary}
                    </p>
                </div>
                {/* Health Score */}
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    background: `${healthColor}10`, border: `0.5px solid ${healthColor}25`,
                    borderRadius: "12px", padding: "8px 14px", minWidth: "60px",
                }}>
                    <span style={{
                        fontSize: "1.3rem", fontWeight: 800, color: healthColor,
                        opacity: isLoading ? 0.3 : 1, transition: "opacity 0.6s",
                    }}>
                        {isLoading ? "—" : strategy.healthScore}
                    </span>
                    <span style={{ fontSize: "0.55rem", color: "rgba(235,235,245,0.4)", marginTop: "1px" }}>
                        HEALTH
                    </span>
                </div>
            </div>

            {/* Action Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {strategy.actions.map((action, i) => (
                    <div key={action.id} style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `0.5px solid ${impactColors[action.impact]}18`,
                        borderRadius: "12px",
                        padding: "14px",
                        opacity: isLoading ? 0.3 : 1,
                        transition: `opacity 0.5s ease ${i * 0.12}s`,
                    }}>
                        {/* Action header */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "1rem", lineHeight: 1 }}>{action.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: "0.85rem", fontWeight: 600,
                                    lineHeight: 1.3, marginBottom: "3px",
                                }}>
                                    {action.title}
                                </div>
                                <div style={{
                                    fontSize: "0.72rem", color: "rgba(235,235,245,0.5)",
                                    lineHeight: 1.4,
                                }}>
                                    {action.description}
                                </div>
                            </div>
                            {/* Impact badge */}
                            <span style={{
                                fontSize: "0.55rem", fontWeight: 600,
                                color: impactColors[action.impact],
                                background: `${impactColors[action.impact]}12`,
                                border: `0.5px solid ${impactColors[action.impact]}20`,
                                borderRadius: "6px", padding: "2px 6px",
                                whiteSpace: "nowrap",
                            }}>
                                {impactLabels[action.impact]}
                            </span>
                        </div>

                        {/* Action buttons (only if respond is available and complete) */}
                        {!isLoading && respond && (
                            <div style={{
                                display: "flex", gap: "6px", marginTop: "8px",
                                paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)",
                            }}>
                                <button
                                    onClick={() => respond(`Execute: ${action.title}`)}
                                    style={{
                                        flex: 1, padding: "6px 10px",
                                        background: "rgba(191, 90, 242, 0.12)",
                                        border: "0.5px solid rgba(191, 90, 242, 0.25)",
                                        borderRadius: "8px", color: "#bf5af2",
                                        fontSize: "0.72rem", fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    ✅ Execute This
                                </button>
                                <button
                                    onClick={() => respond(`Skip: ${action.title}`)}
                                    style={{
                                        padding: "6px 10px",
                                        background: "rgba(255,255,255,0.04)",
                                        border: "0.5px solid rgba(255,255,255,0.08)",
                                        borderRadius: "8px", color: "rgba(235,235,245,0.4)",
                                        fontSize: "0.72rem", fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    Skip
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {strategy.actions.length === 0 && !isLoading && (
                    <div style={{
                        textAlign: "center", padding: "20px",
                        color: "rgba(235,235,245,0.4)", fontSize: "0.85rem",
                    }}>
                        🎯 Pipeline looks healthy — no urgent actions needed
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: "14px", paddingTop: "10px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                fontSize: "0.6rem", color: "rgba(235,235,245,0.3)",
            }}>
                <span>🤖 Powered by LangGraph ReAct Agent</span>
                <span>{strategy.actions.length} actions • {isLoading ? "analyzing..." : "ready"}</span>
            </div>
        </div>
    );
}
