"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { PipelineBoard } from "@/components/PipelineBoard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/Toast";

export default function Home() {
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
              "Hey! 👋 I'm your sales pipeline copilot. I can help you:\n\n• **Create deals** — \"Add a $50k deal for Acme Corp\"\n• **Move deals** — \"Move Cloud Migration to Proposal\"\n• **Pipeline analytics** — \"Show me a pipeline summary\"\n• **Close deals** — \"Close the TechStart deal as won\"\n• **Delete deals** — \"Delete the old Security Audit deal\"\n\nWhat would you like to do?",
          }}
        >
          <PipelineBoard />
        </CopilotSidebar>
      </CopilotKit>
      <ToastContainer />
    </ErrorBoundary>
  );
}
