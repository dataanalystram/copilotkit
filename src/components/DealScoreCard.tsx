"use client";

import { Deal, STAGE_CONFIG, STAGE_PROBABILITY } from "@/lib/types";
import { computeDealScore } from "./DealInsights";

interface DealScoreCardProps {
    deals: Deal[];
    status: "inProgress" | "executing" | "complete";
}

export function DealScoreCard({ deals, status }: DealScoreCardProps) {
    const isLoading = status === "inProgress" || status === "executing";

    // Score all active deals
    const activeDeals = deals.filter(
        (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
    );

    const scoredDeals = activeDeals
        .map((deal) => ({
            deal,
            ...computeDealScore(deal, deals),
        }))
        .sort((a, b) => b.score - a.score);

    const riskColors = { low: "#30d158", medium: "#ff9f0a", high: "#ff453a" };
    const riskEmoji = { low: "🟢", medium: "🟡", high: "🔴" };

    return (
        <div style={{
            background: "rgba(28, 28, 30, 0.95)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "18px",
            color: "#fff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: "14px",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "14px", paddingBottom: "10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <span style={{ fontSize: "1.2rem" }}>🏅</span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Deal Scores</h3>
                <span style={{
                    marginLeft: "auto", fontSize: "0.7rem",
                    color: "rgba(235,235,245,0.4)", background: "rgba(255,255,255,0.05)",
                    padding: "2px 8px", borderRadius: "10px",
                }}>
                    {scoredDeals.length} active deals
                </span>
            </div>

            {/* Scored Deal List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {scoredDeals.map((sd, i) => (
                    <div key={sd.deal.id} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 12px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "10px",
                        borderLeft: `3px solid ${riskColors[sd.riskLevel]}`,
                        opacity: isLoading ? 0.3 : 1,
                        transition: `opacity 0.5s ease ${i * 0.1}s`,
                    }}>
                        {/* Rank */}
                        <span style={{
                            fontSize: "0.75rem", fontWeight: 700,
                            color: "rgba(235,235,245,0.3)", width: "20px",
                        }}>
                            #{i + 1}
                        </span>

                        {/* Deal Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: "0.85rem", fontWeight: 600,
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                                {sd.deal.name}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "rgba(235,235,245,0.5)", display: "flex", gap: "8px" }}>
                                <span>{sd.deal.company}</span>
                                <span>•</span>
                                <span>{STAGE_CONFIG[sd.deal.stage].emoji} {STAGE_CONFIG[sd.deal.stage].label}</span>
                            </div>
                        </div>

                        {/* Value */}
                        <div style={{ textAlign: "right", minWidth: "60px" }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                ${(sd.deal.value / 1000).toFixed(0)}k
                            </div>
                            <div style={{ fontSize: "0.6rem", color: "rgba(235,235,245,0.4)" }}>
                                wt: ${((sd.deal.value * (STAGE_PROBABILITY[sd.deal.stage] || 0)) / 1000).toFixed(0)}k
                            </div>
                        </div>

                        {/* Score Badge */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            background: `${riskColors[sd.riskLevel]}12`,
                            border: `0.5px solid ${riskColors[sd.riskLevel]}25`,
                            borderRadius: "16px", padding: "3px 10px",
                            minWidth: "55px", justifyContent: "center",
                        }}>
                            <span style={{ fontSize: "0.6rem" }}>{riskEmoji[sd.riskLevel]}</span>
                            <span style={{
                                fontSize: "0.8rem", fontWeight: 700,
                                color: riskColors[sd.riskLevel],
                            }}>
                                {isLoading ? "—" : sd.score}
                            </span>
                        </div>
                    </div>
                ))}

                {scoredDeals.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "20px",
                        color: "rgba(235,235,245,0.4)", fontSize: "0.85rem",
                    }}>
                        No active deals to score
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{
                display: "flex", gap: "12px", marginTop: "12px", paddingTop: "10px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                fontSize: "0.65rem", color: "rgba(235,235,245,0.4)",
            }}>
                <span>🟢 Low Risk (70+)</span>
                <span>🟡 Medium (40-69)</span>
                <span>🔴 High Risk (&lt;40)</span>
            </div>
        </div>
    );
}
