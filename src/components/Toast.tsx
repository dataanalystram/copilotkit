"use client";

import { useState, useCallback, useEffect } from "react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
    emoji?: string;
}

let toastListener: ((toast: Toast) => void) | null = null;

// External function to trigger toasts from anywhere
export function showToast(message: string, type: Toast["type"] = "success", emoji?: string) {
    const toast: Toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        message,
        type,
        emoji,
    };
    toastListener?.(toast);
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        toastListener = (toast) => {
            setToasts((prev) => [...prev, toast]);
            // Auto-dismiss after 4 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, 4000);
        };
        return () => {
            toastListener = null;
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 9999,
            pointerEvents: "none",
        }}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        background: toast.type === "error"
                            ? "rgba(255, 69, 58, 0.15)"
                            : toast.type === "info"
                                ? "rgba(10, 132, 255, 0.15)"
                                : "rgba(48, 209, 88, 0.15)",
                        border: `1px solid ${toast.type === "error"
                                ? "rgba(255, 69, 58, 0.3)"
                                : toast.type === "info"
                                    ? "rgba(10, 132, 255, 0.3)"
                                    : "rgba(48, 209, 88, 0.3)"
                            }`,
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
                        animation: "toastSlideIn 0.3s ease-out",
                        pointerEvents: "auto",
                        maxWidth: "360px",
                    }}
                >
                    {toast.emoji && <span style={{ marginRight: "8px" }}>{toast.emoji}</span>}
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
