# ⚡ DealFlow — AI Sales Pipeline Copilot

An AI-powered sales pipeline management tool built with **CopilotKit** + **LangGraph JS**. Features a Kanban board UI with an intelligent copilot sidebar that creates deals, moves them through pipeline stages, provides analytics, and requests confirmation for high-stakes actions.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![CopilotKit](https://img.shields.io/badge/CopilotKit_v1.51-0a84ff?style=flat-square)
![LangGraph](https://img.shields.io/badge/LangGraph_JS-1a1a2e?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61dafb?style=flat-square&logo=react&logoColor=black)

---

## What I Built

A **canvas-pattern** sales pipeline (not just a chat overlay) where an AI copilot **directly manipulates the application state** through tool calls. The copilot can:

1. **Create deals** — Adds deal cards to the Kanban board with name, value, company, and contact info
2. **Move deals** — Transitions deals between pipeline stages (Lead → Qualified → Proposal → Negotiation → Closed)
3. **Pipeline analytics** — Renders a rich, interactive summary widget inline in the chat (Generative UI)
4. **Close deals** — Uses **Human-in-the-Loop (HITL)** confirmation before marking deals as Won/Lost, with a 🎉 confetti celebration on wins

### CopilotKit Features Demonstrated

| Feature | Implementation | Where |
|---------|---------------|-------|
| **Generative UI** | `useCopilotAction` with `render` — rich deal preview cards, move confirmations, and pipeline analytics widgets rendered inline in chat | `PipelineBoard.tsx`, `GenerativeUI.tsx` |
| **Human-in-the-Loop** | `renderAndWaitForResponse` — confirmation dialog with Confirm/Cancel buttons before closing deals; agent pauses until user responds | `PipelineBoard.tsx`, `GenerativeUI.tsx` |
| **Shared State** | `useCopilotReadable` — full pipeline state + analytics (deal count, total value, won revenue, stage breakdown) shared as AI context | `PipelineBoard.tsx` |
| **Frontend Tools** | 4 tools defined via `useCopilotAction` with handlers that directly mutate React state | `PipelineBoard.tsx` |
| **Chat Suggestions** | `useCopilotChatSuggestions` — dynamic suggestion chips based on current pipeline state for guided UX | `PipelineBoard.tsx` |
| **AG-UI Compatible** | LangGraph JS agent defined with `createReactAgent` + Zod schemas — ready for extraction to a separate agent backend via `@ag-ui/client` | `agent.ts` |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16 + React 19)                       │
│  ┌────────────────────┐  ┌───────────────────────────┐  │
│  │  Pipeline Board     │  │  CopilotSidebar           │  │
│  │  (6-stage Kanban)   │  │  (Chat + Generative UI)   │  │
│  │                     │  │                           │  │
│  │  useCopilotAction   │←→│  Rich Cards & Widgets     │  │
│  │  useCopilotReadable │  │  HITL Confirm Dialogs     │  │
│  │  useCopilotChat     │  │  Chat Suggestion Chips    │  │
│  │  Suggestions        │  │                           │  │
│  └────────────────────┘  └───────────────────────────┘  │
│                      ↕                                   │
│  CopilotKit Runtime (/api/copilotkit)                   │
│  Auto-detects: OpenAI GPT-4o-mini │ Google Gemini 2.0   │
└─────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Prerequisites
- **Node.js 18+**
- **One of:** OpenAI API key (`OPENAI_API_KEY`) or Google Gemini API key (`GOOGLE_API_KEY`)

### Install & Run

```bash
# 1. Clone the repo
git clone https://github.com/dataanalystram/copilotkit.git
cd copilotkit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add ONE of these API keys:
#   OPENAI_API_KEY=sk-...       (recommended, GPT-4o-mini)
#   GOOGLE_API_KEY=AIza...      (free tier available, Gemini 2.0 Flash)

# 4. Start the dev server
npm run dev
```

Then open **http://localhost:3000**

> **Note:** The runtime auto-detects which API key is present. If both are set, OpenAI takes priority.

---

## Demo Script (What to Try)

1. **Open the app** — you'll see a 6-stage Kanban pipeline board with 4 sample deals and the AI copilot sidebar
2. **Create a deal:**
   > "Create a deal called 'Enterprise License' worth $50,000 for Acme Corp"
   - ✨ A rich deal preview card streams in real-time in chat (Generative UI)
   - A new deal card appears in the Lead column
3. **Move a deal:**
   > "Move Cloud Migration to Proposal stage"
   - 🔄 A move confirmation widget renders inline in chat
   - The deal card moves to the Proposal column
4. **Get analytics:**
   > "Show me a pipeline summary"
   - 📊 A pipeline summary widget renders with stats and stage breakdown
5. **Close a deal (HITL):**
   > "Close the Security Audit deal as won"
   - 🏆 A confirmation dialog appears — click **"✅ Confirm Won"** to approve
   - 🎉 Confetti celebration fires!
   - The header stats update with the new won revenue

---

## Product & Engineering Decisions

1. **Canvas over chat-only** — Chose a Kanban board because agent-native apps should go beyond chat overlays. The copilot *changes visible state* in the workspace, demonstrating the core CopilotKit value proposition.

2. **Frontend tools pattern** — Defined tools via `useCopilotAction` on the frontend rather than routing through a separate LangGraph agent process. This keeps the demo single-process (one `npm run dev`) while the full LangGraph agent is defined in `agent.ts` ready for extraction. In production, I'd move to a dedicated agent backend connected via `HttpAgent` from `@ag-ui/client`.

3. **HITL for destructive actions only** — Only "close deal" requires confirmation — creating/moving deals feel safe to auto-execute. This mirrors real-world UX where you gate irreversible actions.

4. **Generative UI for every tool** — Each tool renders a meaningful React component in chat — deal preview cards, move confirmations, and analytics widgets. Agents communicate through rich UI, not just text.

5. **Apple-inspired dark mode design** — Custom CSS with glassmorphism, SF Pro typography, system colors, and subtle backdrop-filter effects for a premium native-app feel. No generic Bootstrap/Material — everything hand-crafted.

6. **Dual LLM support** — Auto-detects OpenAI or Google Gemini keys at runtime. Demonstrates adapter flexibility and makes the demo accessible without paid API keys (Gemini has a free tier).

7. **Seeded sample data** — Pre-populated with 4 deals across different stages so the demo is immediately interactive without any setup.

---

## What I'd Improve With More Time

- **Agent backend** — Extract tools into a LangGraph JS `StateGraph` agent running as a separate service, connected via `HttpAgent` from `@ag-ui/client` for true AG-UI protocol communication
- **Thread persistence** — Add SQLite storage for conversation history and deal state
- **Drag-and-drop** — Let users manually drag deals between columns (complementing AI actions)
- **Multi-agent** — Add a "Research Agent" that can look up company info (via Tavily) when creating deals
- **`useCoAgent`** — Migrate to bidirectional state sync with `useCoAgent` for fully shared typed state between agent and UI
- **Tests** — Add React Testing Library tests for tool interactions and HITL flows
- **Accessibility** — Full keyboard navigation audit, ARIA labels, focus management

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router, Turbopack) | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **AI Framework** | CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`) | 1.51.3 |
| **Agent Framework** | LangGraph JS (`@langchain/langgraph`, `@langchain/core`, `@langchain/openai`) | 1.1.4 |
| **LLM** | OpenAI GPT-4o-mini **or** Google Gemini 2.0 Flash (auto-detected) | — |
| **Styling** | Tailwind CSS 4 + custom Apple-inspired dark mode CSS | 4.x |
| **Validation** | Zod (agent tool schemas) | 3.25.x |
| **Animations** | canvas-confetti (deal won celebration) | 1.9.4 |
| **Design** | Apple HIG-inspired: SF Pro, System Colors, glassmorphism, backdrop-filter | — |

---

## AI Tools Used

- **Gemini (Antigravity agent)**: Used for project scaffolding, component generation, and CSS styling. All output was reviewed, understood, and edited by me.
- **CopilotKit docs + Context7**: Used for API reference and integration patterns.

All code represents my understanding of the CopilotKit architecture and product vision.

---

## Security

- No secrets or API keys committed to the repository
- `.env.example` provided with instructions
- `.env` is in `.gitignore`
- Runtime adapter is initialized per-request, not at module level

---

## Project Structure

```
dealflow/
├── src/
│   ├── app/
│   │   ├── api/copilotkit/route.ts   # CopilotKit Runtime (auto-detects OpenAI/Gemini)
│   │   ├── globals.css               # Apple-inspired dark mode design system
│   │   ├── layout.tsx                # Root layout with Inter font + metadata
│   │   └── page.tsx                  # Main page (CopilotKit provider + Sidebar)
│   ├── components/
│   │   ├── DealCard.tsx              # Individual deal card (glassmorphism)
│   │   ├── GenerativeUI.tsx          # Generative UI widgets (DealPreview, MovePreview, CloseDealConfirm)
│   │   ├── PipelineBoard.tsx         # Kanban board + all CopilotKit hooks (tools, HITL, suggestions)
│   │   └── PipelineSummary.tsx       # Pipeline analytics widget (stats + stage breakdown)
│   └── lib/
│       ├── agent.ts                  # LangGraph agent definition (createReactAgent + Zod tools)
│       └── types.ts                  # TypeScript types, stage config, sample data
├── DEMO_TALKTHROUGH.md               # Presentation script for demo walkthrough
├── .env.example                      # API key configuration template
└── README.md
```
