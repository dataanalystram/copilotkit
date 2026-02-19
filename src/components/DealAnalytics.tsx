"use client";

import { Deal, DealStage, STAGE_CONFIG, STAGE_PROBABILITY, PIPELINE_STAGES } from "@/lib/types";

interface DealAnalyticsProps {
    deals: Deal[];
    status: "inProgress" | "executing" | "complete";
}

export function DealAnalytics({ deals, status }: DealAnalyticsProps) {
    const totalValue = deals.reduce((s, d) => s + d.value, 0);
    const activeDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost");
    const wonDeals = deals.filter((d) => d.stage === "closed_won");
    const lostDeals = deals.filter((d) => d.stage === "closed_lost");
    const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);
    const closedCount = wonDeals.length + lostDeals.length;
    const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;
    const forecastValue = activeDeals.reduce(
        (s, d) => s + d.value * (STAGE_PROBABILITY[d.stage] || 0), 0
    );

    // Stage distribution
    const stageData = PIPELINE_STAGES.filter(s => s !== "closed_lost").map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
        return { stage, count: stageDeals.length, value: stageValue };
    });

    const maxValue = Math.max(...stageData.map((s) => s.value), 1);

    const isLoading = status === "inProgress" || status === "executing";

    return (
        <div style={{
            background: "rgba(28, 28, 30, 0.95)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "20px",
            color: "#fff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: "14px",
            minWidth: "320px",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "16px", paddingBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
                <span style={{ fontSize: "1.3rem" }}>📊</span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Pipeline Analytics</h3>
                {isLoading && (
                    <span style={{
                        marginLeft: "auto", fontSize: "0.75rem",
                        color: "#0a84ff", animation: "pulse 1.5s ease-in-out infinite",
                    }}>Analyzing...</span>
                )}
            </div>

            {/* KPI Grid */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px", marginBottom: "16px",
            }}>
                <KPICard label="Total Pipeline" value={`$${(totalValue / 1000).toFixed(0)}k`} color="#0a84ff" loading={isLoading} />
                <KPICard label="Win Rate" value={`${winRate}%`} color="#30d158" loading={isLoading} />
                <KPICard label="Forecast" value={`$${(forecastValue / 1000).toFixed(0)}k`} color="#bf5af2" loading={isLoading} />
            </div>

            {/* Pipeline Velocity Chart */}
            <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "0.75rem", color: "rgba(235,235,245,0.6)", marginBottom: "8px", fontWeight: 500 }}>
                    Stage Distribution
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {stageData.map((s) => (
                        <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "0.7rem", color: "rgba(235,235,245,0.5)", width: "70px", textAlign: "right" }}>
                                {STAGE_CONFIG[s.stage].emoji} {STAGE_CONFIG[s.stage].label}
                            </span>
                            <div style={{
                                flex: 1, height: "18px", borderRadius: "4px",
                                background: "rgba(255,255,255,0.04)", overflow: "hidden",
                            }}>
                                <div style={{
                                    height: "100%", borderRadius: "4px",
                                    background: `linear-gradient(90deg, ${STAGE_CONFIG[s.stage].color}, ${STAGE_CONFIG[s.stage].color}88)`,
                                    width: isLoading ? "0%" : `${(s.value / maxValue) * 100}%`,
                                    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                                    paddingRight: "6px",
                                }}>
                                    {!isLoading && s.value > 0 && (
                                        <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#fff" }}>
                                            ${(s.value / 1000).toFixed(0)}k
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span style={{ fontSize: "0.65rem", color: "rgba(235,235,245,0.4)", width: "20px" }}>
                                {s.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "8px", fontSize: "0.75rem",
            }}>
                <StatRow label="Active Deals" value={String(activeDeals.length)} />
                <StatRow label="Won Revenue" value={`$${(wonValue / 1000).toFixed(0)}k`} />
                <StatRow label="Deals Won" value={String(wonDeals.length)} />
                <StatRow label="Deals Lost" value={String(lostDeals.length)} />
            </div>
        </div>
    );
}

function KPICard({ label, value, color, loading }: { label: string; value: string; color: string; loading: boolean }) {
    return (
        <div style={{
            background: `${color}10`, border: `0.5px solid ${color}25`,
            borderRadius: "10px", padding: "10px", textAlign: "center",
        }}>
            <div style={{
                fontSize: "1.2rem", fontWeight: 700, color,
                opacity: loading ? 0.3 : 1, transition: "opacity 0.5s",
            }}>
                {loading ? "—" : value}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(235,235,245,0.5)", marginTop: "2px" }}>
                {label}
            </div>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "6px 10px", background: "rgba(255,255,255,0.03)",
            borderRadius: "6px",
        }}>
            <span style={{ color: "rgba(235,235,245,0.5)" }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
        </div>
    );
}
