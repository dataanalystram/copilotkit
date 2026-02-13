# 🎙️ DealFlow — Demo Talk-Through Script

> Use this as a guide when presenting DealFlow to the CopilotKit team. Each section below is a "beat" you can walk through. Timing: ~3-4 minutes total.

---

## 🎬 Opening (15 seconds)

> "This is **DealFlow** — an AI-powered sales pipeline copilot I built with CopilotKit and LangGraph JS. It's a canvas-pattern app, meaning the AI copilot doesn't just chat — it **directly manipulates the application state** through the Kanban board."

**Point out:**
- The 6-stage Kanban board (Lead → Qualified → Proposal → Negotiation → Closed Won/Lost)
- The 4 sample deals pre-loaded so the demo is immediately interactive
- The CopilotKit sidebar open with a guided welcome message
- The header stats showing total deals, pipeline value, active deals, and won revenue

---

## 🔧 Feature 1: Create a Deal — Generative UI (45 seconds)

**Say:**
> "Let me show you Generative UI. I'll ask the copilot to create a new deal."

**Type in chat:**
```
Create a $50,000 deal called "Enterprise License" for Acme Corp, contact is John Smith
```

**What happens:**
- A **rich deal preview card** renders inline in the chat (Generative UI via `useCopilotAction` with `render`)
- The card shows deal name, value, company, stage, and contact info
- The args **stream in real-time** during the `inProgress` state — you see the card build up progressively
- A new deal card simultaneously appears in the **Lead** column of the Kanban board

**Explain:**
> "Notice two things: the generative UI card streamed in real-time as the LLM generated the tool call arguments. And the Kanban board updated instantly — because the tool handler directly mutates React state via `useCopilotAction`."

---

## 🔄 Feature 2: Move a Deal — State Mutation (30 seconds)

**Say:**
> "Now I'll advance a deal through the pipeline."

**Type in chat:**
```
Move Cloud Migration to Proposal stage
```

**What happens:**
- A **move confirmation widget** renders inline in chat (Generative UI)
- The deal card physically moves from the Qualified column to Proposal on the board
- The header stats update in real-time

**Explain:**
> "The copilot knows which deals exist because I use `useCopilotReadable` to share the entire pipeline state — including deal names, values, stages, and analytics — as context. The AI uses this shared state to match deal names and validate the target stage."

---

## 📊 Feature 3: Pipeline Analytics — Rich Widget (30 seconds)

**Say:**
> "Let me ask for analytics."

**Type in chat:**
```
Show me a pipeline summary
```

**What happens:**
- A **pipeline summary widget** renders inline in the chat with:
  - Stats grid: Total Deals, Pipeline Value, Active, Won Revenue
  - Stage-by-stage breakdown with color-coded dots, deal counts, and values

**Explain:**
> "This is a full React component — `PipelineSummary` — rendered as Generative UI. It's not just text; it's an interactive widget that gives the user a visual analytics dashboard right inside the chat."

---

## 🏆 Feature 4: Close a Deal — Human-in-the-Loop (45 seconds)

**Say:**
> "Now the most important feature — Human-in-the-Loop. Closing a deal is irreversible, so the copilot asks for confirmation."

**Type in chat:**
```
Close the Security Audit deal as won
```

**What happens:**
- A **HITL confirmation widget** appears in the chat with:
  - "🏆 Confirm: Close Deal as Won?"
  - Two buttons: **Cancel** and **✅ Confirm Won**
- The agent **pauses and waits** for the user to respond (via `renderAndWaitForResponse`)

**Click "✅ Confirm Won":**
- 🎉 **Confetti celebration** fires across the screen
- The deal card moves to the **Closed Won** column
- The header stats update (Won revenue increases)
- The widget updates to show "✅ Confirmed — deal closed as won! 🎉"

**Explain:**
> "This uses CopilotKit's `renderAndWaitForResponse` — the most advanced form of Generative UI. The agent literally pauses execution until the user clicks a button. This is Human-in-the-Loop: gating destructive actions behind user approval. I only use HITL for closing deals — creating and moving deals feel safe to auto-execute, which matches real-world UX patterns."

---

## 🏗️ Architecture Wrap-Up (30 seconds)

**Say:**
> "Quick architecture overview:"

**Key points:**
1. **Canvas pattern** — Kanban board + sidebar chat, not just a chat overlay
2. **4 CopilotKit features in one app:**
   - **Generative UI** (`render` on every tool) — rich cards, analytics widgets
   - **Human-in-the-Loop** (`renderAndWaitForResponse`) — confirmation for closing deals
   - **Shared State** (`useCopilotReadable`) — full pipeline context shared with AI
   - **Frontend Tools** (`useCopilotAction`) — 4 tools that mutate React state
3. **Dual LLM support** — auto-detects OpenAI or Google Gemini API keys
4. **One command** — `npm run dev` starts everything, no separate agent server needed
5. **LangGraph JS agent defined** in `agent.ts` — shows production architecture readiness; in production, I'd extract tools into a separate LangGraph StateGraph agent connected via `HttpAgent` from `@ag-ui/client`

---

## 💡 What I'd Do With More Time (15 seconds)

> "With more time, I'd add:
> - A LangGraph agent backend as a separate service
> - Thread persistence with SQLite
> - Drag-and-drop for manual deal management
> - A Research Agent (multi-agent) that uses Tavily to look up company info
> - Full `useCoAgent` bidirectional state sync
> - Tests and an accessibility audit"

---

## 🎯 Closing (10 seconds)

> "This project demonstrates my understanding of CopilotKit's core architecture and the AG-UI protocol. I chose to build something that goes beyond a chat overlay — the AI and the user share the same workspace, and the copilot is a true collaborator in the sales process."
