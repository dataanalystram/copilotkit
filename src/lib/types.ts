export type DealStage =
    | "lead"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost";

export interface Activity {
    id: string;
    type: "created" | "moved" | "closed" | "deleted" | "scored";
    description: string;
    timestamp: string;
    triggeredBy: "user" | "ai";
}

export interface Deal {
    id: string;
    name: string;
    value: number;
    company: string;
    contactName: string;
    contactEmail: string;
    stage: DealStage;
    createdAt: string;
    activityLog?: Activity[];
}

// Stage win probability for forecasting
export const STAGE_PROBABILITY: Record<DealStage, number> = {
    lead: 0.1,
    qualified: 0.25,
    proposal: 0.5,
    negotiation: 0.75,
    closed_won: 1.0,
    closed_lost: 0.0,
};

export const STAGE_CONFIG: Record<
    DealStage,
    { label: string; color: string; emoji: string }
> = {
    lead: { label: "Lead", color: "#6366f1", emoji: "🎯" },
    qualified: { label: "Qualified", color: "#8b5cf6", emoji: "✅" },
    proposal: { label: "Proposal", color: "#a855f7", emoji: "📄" },
    negotiation: { label: "Negotiation", color: "#f59e0b", emoji: "🤝" },
    closed_won: { label: "Closed Won", color: "#22c55e", emoji: "🏆" },
    closed_lost: { label: "Closed Lost", color: "#ef4444", emoji: "❌" },
};

export const PIPELINE_STAGES: DealStage[] = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "closed_won",
    "closed_lost",
];

export const SAMPLE_DEALS: Deal[] = [
    {
        id: "deal_1",
        name: "Cloud Migration",
        value: 75000,
        company: "TechStart Inc",
        contactName: "Sarah Chen",
        contactEmail: "sarah@techstart.com",
        stage: "qualified",
        createdAt: new Date().toISOString(),
    },
    {
        id: "deal_2",
        name: "Annual SaaS License",
        value: 120000,
        company: "GlobalCorp",
        contactName: "James Wilson",
        contactEmail: "jwilson@globalcorp.com",
        stage: "proposal",
        createdAt: new Date().toISOString(),
    },
    {
        id: "deal_3",
        name: "Security Audit",
        value: 35000,
        company: "FinSecure",
        contactName: "Priya Patel",
        contactEmail: "priya@finsecure.io",
        stage: "lead",
        createdAt: new Date().toISOString(),
    },
    {
        id: "deal_4",
        name: "Data Analytics Platform",
        value: 95000,
        company: "DataDriven Co",
        contactName: "Alex Kim",
        contactEmail: "alex@datadriven.co",
        stage: "negotiation",
        createdAt: new Date().toISOString(),
    },
];
