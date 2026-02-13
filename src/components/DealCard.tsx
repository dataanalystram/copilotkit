"use client";

import { Deal, STAGE_CONFIG } from "@/lib/types";

interface DealCardProps {
    deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
    const stage = STAGE_CONFIG[deal.stage];

    return (
        <div className="deal-card">
            <div className="deal-card-header">
                <span className="deal-company">{deal.company}</span>
                <span className="deal-value">
                    ${deal.value.toLocaleString()}
                </span>
            </div>
            <h4 className="deal-name">{deal.name}</h4>
            {deal.contactName && (
                <div className="deal-contact">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{deal.contactName}</span>
                </div>
            )}
            <div className="deal-footer">
                <span
                    className="deal-stage-badge"
                    style={{
                        // Override specific color just for the text/background tint if needed, 
                        // but try to keep it subtle.
                        color: stage.color,
                        background: `${stage.color}15`,
                    }}
                >
                    {stage.label}
                </span>
                <span className="deal-date">
                    {new Date(deal.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })}
                </span>
            </div>
        </div>
    );
}
