"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { PipelineBoard } from "@/components/PipelineBoard";

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        defaultOpen={true}
        clickOutsideToClose={false}
        labels={{
          title: "DealFlow AI",
          initial:
            "Hey! 👋 I'm your sales pipeline copilot. I can help you:\n\n• **Create deals** — \"Add a $50k deal for Acme Corp\"\n• **Move deals** — \"Move Cloud Migration to Proposal\"\n• **Pipeline analytics** — \"Show me a pipeline summary\"\n• **Close deals** — \"Close the TechStart deal as won\"\n\nWhat would you like to do?",
        }}
      >
        <PipelineBoard />
      </CopilotSidebar>
    </CopilotKit>
  );
}
