"use client";

import { Deal, STAGE_CONFIG, DealStage } from "@/lib/types";

interface PipelineSummaryProps {
    deals: Deal[];
}

export function PipelineSummary({ deals }: PipelineSummaryProps) {
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const activeDeals = deals.filter(
        (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
    );
    const wonDeals = deals.filter((d) => d.stage === "closed_won");
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);

    const stageBreakdown = Object.entries(STAGE_CONFIG).map(([stage, config]) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
        return {
            stage: stage as DealStage,
            ...config,
            count: stageDeals.length,
            value: stageValue,
        };
    });

    return (
        <div style={{
            background: "#1c1c1e",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "16px",
            color: "#fff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
            fontSize: "14px",
        }}>
            <h3 style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                marginBottom: "12px",
                color: "#fff",
                margin: "0 0 12px 0",
            }}>📊 Pipeline Summary</h3>

            {/* Stats Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "16px",
            }}>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 8px", background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)",
                }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{deals.length}</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "rgba(235,235,245,0.6)", textTransform: "uppercase", marginTop: "2px" }}>Total Deals</span>
                </div>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 8px", background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)",
                }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>${(totalValue / 1000).toFixed(0)}k</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "rgba(235,235,245,0.6)", textTransform: "uppercase", marginTop: "2px" }}>Pipeline Value</span>
                </div>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 8px", background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)",
                }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{activeDeals.length}</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "rgba(235,235,245,0.6)", textTransform: "uppercase", marginTop: "2px" }}>Active</span>
                </div>
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "10px 8px", background: "rgba(10,132,255,0.1)",
                    borderRadius: "8px", border: "1px solid rgba(10,132,255,0.2)",
                }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0a84ff" }}>${(wonValue / 1000).toFixed(0)}k</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "rgba(235,235,245,0.6)", textTransform: "uppercase", marginTop: "2px" }}>Won Revenue</span>
                </div>
            </div>

            {/* Stage Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {stageBreakdown.map((s) => (
                    <div key={s.stage} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "6px 8px", borderRadius: "4px",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{
                                width: "6px", height: "6px", borderRadius: "50%",
                                background: s.color, display: "inline-block",
                            }}></span>
                            <span style={{ fontSize: "0.75rem", color: "#fff" }}>
                                {s.emoji} {s.label}
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "0.7rem", color: "rgba(235,235,245,0.3)" }}>{s.count} deals</span>
                            <span style={{
                                fontSize: "0.75rem", fontWeight: 500,
                                color: "rgba(235,235,245,0.6)", width: "70px", textAlign: "right",
                            }}>
                                ${s.value.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
