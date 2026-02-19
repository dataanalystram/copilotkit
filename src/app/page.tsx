"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { PipelineBoard } from "@/components/PipelineBoard";
import { CopilotPlayground } from "@/components/CopilotPlayground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/Toast";

type TabId = "pipeline" | "playground";

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "pipeline", label: "Pipeline", icon: "⚡" },
  { id: "playground", label: "AI Playground", icon: "🧪" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");

  return (
    <ErrorBoundary>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        showDevConsole={false}
        onError={(event) => {
          console.error("[DealFlow] CopilotKit error:", event);
        }}
      >
        <CopilotSidebar
          defaultOpen={true}
          clickOutsideToClose={false}
          labels={{
            title: "DealFlow AI",
            initial:
              "Hey! 👋 I'm your AI sales copilot with **10 tools**:\n\n🔧 **Core:** Create, Move, Close, Delete deals\n📊 **Analytics:** Pipeline summary, Deep analysis\n🏅 **AI Scoring:** Deal insights, Score all deals\n🧠 **Strategy:** AI Strategy Advisor\n📋 **Activity:** Show activity timeline\n\nTry: **\"What should I focus on?\"** or explore the AI Playground tab →",
          }}
        >
          {/* Tab Navigation */}
          <div style={{
            display: "flex",
            gap: "2px",
            padding: "6px",
            margin: "0 0 0px",
            background: "rgba(28,28,30,0.8)",
            borderRadius: "12px",
            border: "0.5px solid rgba(255,255,255,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "9px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  transition: "all 0.2s ease",
                  background: activeTab === tab.id
                    ? "linear-gradient(135deg, rgba(191,90,242,0.15) 0%, rgba(10,132,255,0.1) 100%)"
                    : "transparent",
                  color: activeTab === tab.id ? "#fff" : "rgba(235,235,245,0.5)",
                  boxShadow: activeTab === tab.id
                    ? "0 1px 3px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.06)"
                    : "none",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>{tab.icon}</span>
                {tab.label}
                {tab.id === "playground" && (
                  <span style={{
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    color: "#bf5af2",
                    background: "rgba(191,90,242,0.15)",
                    borderRadius: "4px",
                    padding: "1px 5px",
                    letterSpacing: "0.04em",
                  }}>NEW</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{
            opacity: 1,
            transition: "opacity 0.2s ease",
          }}>
            {activeTab === "pipeline" && <PipelineBoard />}
            {activeTab === "playground" && <CopilotPlayground />}
          </div>
        </CopilotSidebar>
      </CopilotKit>
      <ToastContainer />
    </ErrorBoundary>
  );
}
