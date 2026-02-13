"use client";

import { useState } from "react";
import { Deal, DealStage, STAGE_CONFIG } from "@/lib/types";

/* Shared inline styles for the widget container */
const widgetContainer: React.CSSProperties = {
    background: "#1c1c1e",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "16px",
    color: "#fff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
};

const loadingRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "rgba(235,235,245,0.6)",
    fontSize: "0.8rem",
    padding: "12px",
};

const badge: React.CSSProperties = {
    display: "inline-block",
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "3px 8px",
    background: "rgba(10,132,255,0.15)",
    color: "#0a84ff",
    borderRadius: "100px",
    marginBottom: "8px",
};

const detailRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    padding: "2px 0",
};

const detailLabel: React.CSSProperties = {
    color: "rgba(235,235,245,0.3)",
};

const detailValue: React.CSSProperties = {
    color: "#fff",
    fontWeight: 500,
};

/* ================================================================
   DealPreview — shown inline in chat when a deal is created
   ================================================================ */
interface DealPreviewProps {
    deal: Partial<Deal>;
    status: string; // "inProgress" | "executing" | "complete"
}

export function DealPreview({ deal, status }: DealPreviewProps) {
    const stage = deal.stage ? STAGE_CONFIG[deal.stage as DealStage] : STAGE_CONFIG.lead;

    // Show content as soon as we have any args (inProgress streams args in real-time)
    const hasData = deal.name || deal.company || deal.value;

    return (
        <div style={widgetContainer}>
            {!hasData ? (
                <div style={loadingRow}>
                    <span style={{
                        display: "inline-block", width: "14px", height: "14px",
                        border: "2px solid rgba(255,255,255,0.2)",
                        borderTopColor: "#0a84ff", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}></span>
                    <span>Creating deal...</span>
                </div>
            ) : (
                <>
                    <div>
                        <span style={badge}>
                            {status === "complete" ? "✨ New Deal Created" : "✨ Creating Deal..."}
                        </span>
                    </div>
                    <div>
                        <h4 style={{
                            fontSize: "0.9rem", fontWeight: 600,
                            marginBottom: "8px", color: "#fff", margin: "0 0 8px 0",
                        }}>{deal.name || "Untitled Deal"}</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {deal.company && (
                                <div style={detailRow}>
                                    <span style={detailLabel}>Company</span>
                                    <span style={detailValue}>{deal.company}</span>
                                </div>
                            )}
                            {deal.value != null && (
                                <div style={detailRow}>
                                    <span style={detailLabel}>Value</span>
                                    <span style={{ ...detailValue, color: "#30d158" }}>
                                        ${(deal.value || 0).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div style={detailRow}>
                                <span style={detailLabel}>Stage</span>
                                <span style={{ ...detailValue, color: stage.color }}>
                                    {stage.emoji} {stage.label}
                                </span>
                            </div>
                            {deal.contactName && (
                                <div style={detailRow}>
                                    <span style={detailLabel}>Contact</span>
                                    <span style={detailValue}>{deal.contactName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {status === "executing" && (
                        <div style={{ ...loadingRow, marginTop: "8px" }}>
                            <span style={{
                                display: "inline-block", width: "14px", height: "14px",
                                border: "2px solid rgba(255,255,255,0.2)",
                                borderTopColor: "#0a84ff", borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                            }}></span>
                            <span>Saving to pipeline...</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* ================================================================
   MovePreview — shown inline in chat when a deal is moved
   ================================================================ */
interface MovePreviewProps {
    dealName: string;
    newStage: string;
    status: string;
}

export function MovePreview({ dealName, newStage, status }: MovePreviewProps) {
    const stage = STAGE_CONFIG[newStage as keyof typeof STAGE_CONFIG];

    if (!dealName) {
        return (
            <div style={widgetContainer}>
                <div style={loadingRow}>
                    <span style={{
                        display: "inline-block", width: "14px", height: "14px",
                        border: "2px solid rgba(255,255,255,0.2)",
                        borderTopColor: "#0a84ff", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}></span>
                    <span>Moving deal...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={widgetContainer}>
            <div>
                <span style={{
                    ...badge,
                    background: `${stage?.color}22`,
                    color: stage?.color,
                }}>
                    {status === "complete" ? "🔄 Deal Moved" : "🔄 Moving Deal..."}
                </span>
                <p style={{
                    fontSize: "0.85rem", color: "#fff",
                    margin: "8px 0 0 0",
                }}>
                    <strong>{dealName}</strong> → {stage?.emoji} {stage?.label}
                </p>
            </div>
        </div>
    );
}

/* ================================================================
   CloseDealConfirm — HITL widget for closing deals
   Key fix: buttons show during "executing" state (= waiting for user)
   ================================================================ */
interface CloseDealConfirmProps {
    dealName: string;
    outcome: string;
    isExecuting: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export function CloseDealConfirm({
    dealName,
    outcome,
    isExecuting,
    onConfirm,
    onCancel,
}: CloseDealConfirmProps) {
    const isWon = outcome === "closed_won";
    const [responseType, setResponseType] = useState<"none" | "confirmed" | "cancelled">("none");

    return (
        <div style={{
            ...widgetContainer,
            background: "rgba(28, 28, 30, 0.95)",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                marginBottom: "12px", paddingBottom: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
                <span style={{ fontSize: "1.2rem" }}>{isWon ? "🏆" : "❌"}</span>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, margin: 0 }}>
                    {responseType === "none"
                        ? `Confirm: Close Deal as ${isWon ? "Won" : "Lost"}?`
                        : responseType === "confirmed"
                            ? `Deal Closed as ${isWon ? "Won" : "Lost"}`
                            : "Action Cancelled"}
                </h4>
            </div>
            <p style={{ fontSize: "0.85rem", color: "rgba(235,235,245,0.6)", margin: "0 0 12px 0" }}>{dealName}</p>

            {/* Show buttons when waiting for user */}
            {responseType === "none" && (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        style={{
                            flex: 1, padding: "8px", borderRadius: "6px",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                            border: "none", background: "rgba(255,255,255,0.1)", color: "#fff",
                        }}
                        onClick={() => {
                            setResponseType("cancelled");
                            onCancel?.();
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        style={{
                            flex: 1, padding: "8px", borderRadius: "6px",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                            border: "none",
                            background: isWon ? "rgba(48,209,88,0.2)" : "rgba(255,69,58,0.2)",
                            color: isWon ? "#30d158" : "#ff453a",
                        }}
                        onClick={() => {
                            setResponseType("confirmed");
                            onConfirm?.();
                        }}
                    >
                        {isWon ? "✅ Confirm Won" : "❌ Confirm Lost"}
                    </button>
                </div>
            )}

            {/* Static result messages */}
            {responseType === "confirmed" && (
                <p style={{ color: isWon ? "#30d158" : "#ff453a", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                    {isWon ? "✅ Confirmed — deal closed as won! 🎉" : "❌ Confirmed — deal closed as lost."}
                </p>
            )}
            {responseType === "cancelled" && (
                <p style={{ color: "rgba(235,235,245,0.3)", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                    🚫 Action cancelled — deal remains open.
                </p>
            )}
        </div>
    );
}
