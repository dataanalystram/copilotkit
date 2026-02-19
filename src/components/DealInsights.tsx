"use client";

import { Deal, DealStage, STAGE_CONFIG, STAGE_PROBABILITY } from "@/lib/types";

interface DealInsightsProps {
    deal: Deal;
    allDeals: Deal[];
    status: "inProgress" | "executing" | "complete";
}

export function computeDealScore(deal: Deal, allDeals: Deal[]): {
    score: number;
    riskLevel: "low" | "medium" | "high";
    factors: { label: string; impact: "positive" | "negative" | "neutral"; detail: string }[];
    suggestedAction: string;
} {
    let score = 50; // baseline
    const factors: { label: string; impact: "positive" | "negative" | "neutral"; detail: string }[] = [];

    // Factor 1: Deal value vs average
    const avgValue = allDeals.reduce((s, d) => s + d.value, 0) / (allDeals.length || 1);
    if (deal.value > avgValue * 1.5) {
        score += 15;
        factors.push({ label: "High Value", impact: "positive", detail: `${((deal.value / avgValue) * 100).toFixed(0)}% above average` });
    } else if (deal.value < avgValue * 0.5) {
        score -= 10;
        factors.push({ label: "Low Value", impact: "negative", detail: `${((deal.value / avgValue) * 100).toFixed(0)}% of average` });
    } else {
        factors.push({ label: "Value", impact: "neutral", detail: "Within normal range" });
    }

    // Factor 2: Stage progression (later stages = higher score)
    const stageOrder: DealStage[] = ["lead", "qualified", "proposal", "negotiation", "closed_won"];
    const stageIndex = stageOrder.indexOf(deal.stage);
    if (stageIndex >= 3) {
        score += 20;
        factors.push({ label: "Advanced Stage", impact: "positive", detail: `${STAGE_CONFIG[deal.stage].label} — close to closing` });
    } else if (stageIndex <= 1) {
        score -= 5;
        factors.push({ label: "Early Stage", impact: "negative", detail: `Still in ${STAGE_CONFIG[deal.stage].label}` });
    } else {
        score += 10;
        factors.push({ label: "Mid-Pipeline", impact: "neutral", detail: `Active in ${STAGE_CONFIG[deal.stage].label}` });
    }

    // Factor 3: Days since creation
    const daysSinceCreation = Math.floor(
        (Date.now() - new Date(deal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation > 30) {
        score -= 15;
        factors.push({ label: "Aging Deal", impact: "negative", detail: `${daysSinceCreation} days in pipeline` });
    } else if (daysSinceCreation < 7) {
        score += 10;
        factors.push({ label: "Fresh Deal", impact: "positive", detail: `Only ${daysSinceCreation} days old` });
    } else {
        factors.push({ label: "Age", impact: "neutral", detail: `${daysSinceCreation} days in pipeline` });
    }

    // Factor 4: Has contact info
    if (deal.contactName && deal.contactEmail) {
        score += 10;
        factors.push({ label: "Contact Info", impact: "positive", detail: "Complete contact details" });
    } else {
        score -= 10;
        factors.push({ label: "Missing Contact", impact: "negative", detail: "Incomplete contact info" });
    }

    score = Math.max(0, Math.min(100, score));
    const riskLevel = score >= 70 ? "low" : score >= 40 ? "medium" : "high";

    // Suggested action based on stage + score
    const actions: Record<DealStage, string> = {
        lead: "Schedule a discovery call to qualify this lead",
        qualified: "Send a tailored proposal with pricing options",
        proposal: "Follow up on proposal and address objections",
        negotiation: "Prepare final terms and close conditions",
        closed_won: "Onboard and plan expansion opportunities",
        closed_lost: "Conduct post-mortem and plan re-engagement",
    };

    return { score, riskLevel, factors, suggestedAction: actions[deal.stage] };
}

export function DealInsights({ deal, allDeals, status }: DealInsightsProps) {
    const isLoading = status === "inProgress" || status === "executing";
    const insights = computeDealScore(deal, allDeals);

    const riskColors = { low: "#30d158", medium: "#ff9f0a", high: "#ff453a" };
    const riskEmoji = { low: "🟢", medium: "🟡", high: "🔴" };

    const weightedValue = deal.value * (STAGE_PROBABILITY[deal.stage] || 0);

    return (
        <div style={{
            background: "rgba(28, 28, 30, 0.95)",
            border: `0.5px solid ${riskColors[insights.riskLevel]}25`,
            borderRadius: "14px",
            padding: "18px",
            color: "#fff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: "14px",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "14px", paddingBottom: "10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.1rem" }}>🔍</span>
                    <div>
                        <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>{deal.name}</h4>
                        <span style={{ fontSize: "0.7rem", color: "rgba(235,235,245,0.5)" }}>{deal.company}</span>
                    </div>
                </div>
                {/* Score Badge */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: `${riskColors[insights.riskLevel]}15`,
                    border: `0.5px solid ${riskColors[insights.riskLevel]}30`,
                    borderRadius: "20px", padding: "4px 12px",
                }}>
                    <span style={{ fontSize: "0.7rem" }}>{riskEmoji[insights.riskLevel]}</span>
                    <span style={{
                        fontSize: "0.85rem", fontWeight: 700,
                        color: riskColors[insights.riskLevel],
                        opacity: isLoading ? 0.3 : 1, transition: "opacity 0.5s",
                    }}>
                        {isLoading ? "—" : insights.score}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: "rgba(235,235,245,0.4)" }}>/100</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px", marginBottom: "14px",
            }}>
                <MiniStat label="Value" value={`$${(deal.value / 1000).toFixed(0)}k`} />
                <MiniStat label="Stage" value={STAGE_CONFIG[deal.stage].label} />
                <MiniStat label="Weighted" value={`$${(weightedValue / 1000).toFixed(0)}k`} />
            </div>

            {/* Score Factors */}
            <div style={{ marginBottom: "14px" }}>
                <p style={{ fontSize: "0.7rem", color: "rgba(235,235,245,0.5)", marginBottom: "6px", fontWeight: 500 }}>
                    Score Breakdown
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {insights.factors.map((f, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            fontSize: "0.75rem", padding: "4px 8px",
                            background: "rgba(255,255,255,0.03)", borderRadius: "6px",
                        }}>
                            <span style={{
                                width: "6px", height: "6px", borderRadius: "50%",
                                background: f.impact === "positive" ? "#30d158" : f.impact === "negative" ? "#ff453a" : "#636366",
                            }} />
                            <span style={{ fontWeight: 500, color: "rgba(235,235,245,0.8)" }}>{f.label}</span>
                            <span style={{ color: "rgba(235,235,245,0.4)", marginLeft: "auto" }}>{f.detail}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Suggested Action */}
            <div style={{
                background: "rgba(10, 132, 255, 0.08)",
                border: "0.5px solid rgba(10, 132, 255, 0.2)",
                borderRadius: "8px", padding: "10px 12px",
            }}>
                <p style={{ fontSize: "0.65rem", color: "#0a84ff", fontWeight: 600, margin: "0 0 4px" }}>
                    💡 Suggested Next Action
                </p>
                <p style={{ fontSize: "0.8rem", color: "rgba(235,235,245,0.8)", margin: 0 }}>
                    {insights.suggestedAction}
                </p>
            </div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            textAlign: "center", padding: "6px",
            background: "rgba(255,255,255,0.03)", borderRadius: "8px",
        }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{value}</div>
            <div style={{ fontSize: "0.6rem", color: "rgba(235,235,245,0.4)", marginTop: "2px" }}>{label}</div>
        </div>
    );
}

