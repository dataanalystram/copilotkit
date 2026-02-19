"use client";

import { Activity } from "@/lib/types";

interface ActivityTimelineProps {
    activities: Activity[];
    status?: "inProgress" | "executing" | "complete";
}

const typeConfig: Record<Activity["type"], { emoji: string; color: string }> = {
    created: { emoji: "✨", color: "#30d158" },
    moved: { emoji: "🔄", color: "#0a84ff" },
    closed: { emoji: "🏆", color: "#ff9f0a" },
    deleted: { emoji: "🗑️", color: "#ff453a" },
    scored: { emoji: "🏅", color: "#bf5af2" },
};

export function ActivityTimeline({ activities, status }: ActivityTimelineProps) {
    const isLoading = status === "inProgress" || status === "executing";

    // Show most recent first, limit to 10
    const recent = [...activities].reverse().slice(0, 10);

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
                <span style={{ fontSize: "1.2rem" }}>📋</span>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Activity Log</h3>
                <span style={{
                    marginLeft: "auto", fontSize: "0.65rem",
                    color: "rgba(235,235,245,0.4)", background: "rgba(255,255,255,0.05)",
                    padding: "2px 8px", borderRadius: "10px",
                }}>
                    {activities.length} events
                </span>
            </div>

            {/* Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {recent.map((activity, i) => {
                    const config = typeConfig[activity.type];
                    const time = new Date(activity.timestamp);
                    const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                    return (
                        <div key={activity.id} style={{
                            display: "flex", gap: "10px", padding: "8px 0",
                            opacity: isLoading ? 0.3 : 1,
                            transition: `opacity 0.4s ease ${i * 0.05}s`,
                        }}>
                            {/* Timeline dot + line */}
                            <div style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                width: "24px", flexShrink: 0,
                            }}>
                                <div style={{
                                    width: "8px", height: "8px", borderRadius: "50%",
                                    background: config.color, flexShrink: 0,
                                    boxShadow: `0 0 6px ${config.color}40`,
                                }} />
                                {i < recent.length - 1 && (
                                    <div style={{
                                        width: "1px", flex: 1, minHeight: "16px",
                                        background: "rgba(255,255,255,0.06)",
                                    }} />
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, paddingBottom: "4px" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    marginBottom: "2px",
                                }}>
                                    <span style={{ fontSize: "0.75rem" }}>{config.emoji}</span>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                                        {activity.description}
                                    </span>
                                </div>
                                <div style={{
                                    display: "flex", gap: "8px",
                                    fontSize: "0.65rem", color: "rgba(235,235,245,0.35)",
                                }}>
                                    <span>{timeStr}</span>
                                    <span>•</span>
                                    <span style={{
                                        color: activity.triggeredBy === "ai" ? "#0a84ff" : "#30d158",
                                    }}>
                                        {activity.triggeredBy === "ai" ? "🤖 AI" : "👤 User"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {recent.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "20px",
                        color: "rgba(235,235,245,0.4)", fontSize: "0.85rem",
                    }}>
                        No activity yet — start creating deals!
                    </div>
                )}
            </div>
        </div>
    );
}
