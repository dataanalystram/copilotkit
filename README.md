# ⚡ DealFlow — AI Sales Pipeline Copilot

An AI-powered sales pipeline management tool built with **CopilotKit** + **LangGraph JS** in under **60 minutes**. Features a Kanban board UI with an intelligent copilot sidebar that creates, moves, closes, and deletes deals through pipeline stages, provides analytics, and requests confirmation for high-stakes actions — all with production-grade error handling, data persistence, and toast notifications.

> **📌 Branch Strategy:** The `main` branch contains the **60-minute submission** — everything built within the challenge timeframe. The `master` branch is the **"what if I had more time"** version with production-level upgrades: error boundaries, localStorage persistence, toast notifications, delete tool with HITL, responsive design, and hardened runtime. Both branches are fully working and deployable.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![CopilotKit](https://img.shields.io/badge/CopilotKit_v1.51-0a84ff?style=flat-square)
![LangGraph](https://img.shields.io/badge/LangGraph_JS-1a1a2e?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61dafb?style=flat-square&logo=react&logoColor=black)

---

## What I Built

A **canvas-pattern** sales pipeline (not just a chat overlay) where an AI copilot **directly manipulates the application state** through tool calls. The copilot can:

1. **Create deals** — Adds deal cards to the Kanban board with validation (duplicate name guard, stage validation)
2. **Move deals** — Transitions deals between pipeline stages with LLM-hallucination protection
3. **Pipeline analytics** — Renders a rich, interactive summary widget inline in the chat (Generative UI)
4. **Close deals** — Uses **Human-in-the-Loop (HITL)** confirmation before marking deals as Won/Lost, with 🎉 confetti celebration
5. **Delete deals** — Uses **HITL confirmation** with a destructive-action dialog before removing deals from the pipeline

### CopilotKit Features Demonstrated

| Feature | Implementation | Where |
|---------|---------------|-------|
| **Generative UI** | `useCopilotAction` with `render` — rich deal preview cards, move confirmations, and analytics widgets rendered inline in chat | `PipelineBoard.tsx`, `GenerativeUI.tsx` |
| **Human-in-the-Loop (×2)** | `renderAndWaitForResponse` — confirmation dialogs for both **closing** and **deleting** deals; agent pauses until user responds | `PipelineBoard.tsx`, `GenerativeUI.tsx` |
| **Shared State** | `useCopilotReadable` — full pipeline state + analytics (deal count, total value, won revenue, stage breakdown) shared as AI context | `PipelineBoard.tsx` |
| **Frontend Tools** | **5 tools** defined via `useCopilotAction` with handlers that directly mutate React state | `PipelineBoard.tsx` |
| **Chat Suggestions** | `useCopilotChatSuggestions` — dynamic suggestion chips based on current pipeline state for guided UX | `PipelineBoard.tsx` |
| **AG-UI Compatible** | LangGraph JS agent defined with `createReactAgent` + Zod schemas — ready for extraction to a separate agent backend via `@ag-ui/client` | `agent.ts` |

### Production-Level Features

| Feature | Detail |
|---------|--------|
| **Error Boundary** | React error boundary catches rendering crashes (e.g., from generative UI) and shows a styled reload screen instead of a white page |
| **Data Persistence** | Deals persist to `localStorage` via `usePersistedState` hook — survives page reload, syncs across browser tabs |
| **Toast Notifications** | Glassmorphism toasts appear on every action: create (✨), move (🔄), close (🏆), delete (🗑️), and errors (❌) |
| **Runtime Hardening** | CopilotKit runtime route wrapped in try/catch with proper JSON error responses (500) instead of unhandled throws |
| **Input Validation** | Duplicate deal name guard, stage validation (rejects hallucinated stages), all inside `setDeals` updaters to prevent stale closures |
| **Production CopilotKit** | `showDevConsole={false}`, `onError` handler for error logging |
| **Responsive Design** | CSS media queries for 1200px, 768px, 480px — Kanban adapts from 6-col to 2-col to 1-col |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16 + React 19)                       │
│  ┌────────────────────┐  ┌───────────────────────────┐  │
│  │  Pipeline Board     │  │  CopilotSidebar           │  │
│  │  (6-stage Kanban)   │  │  (Chat + Generative UI)   │  │
│  │                     │  │                           │  │
│  │  5 useCopilotAction │←→│  Rich Cards & Widgets     │  │
│  │  useCopilotReadable │  │  2× HITL Confirm Dialogs  │  │
│  │  useCopilotChat     │  │  Chat Suggestion Chips    │  │
│  │  Suggestions        │  │  Toast Notifications      │  │
│  └────────────────────┘  └───────────────────────────┘  │
│           ↕                        ↕                     │
│  usePersistedState ←→ localStorage (cross-tab sync)     │
│  ErrorBoundary (crash recovery)                         │
│                      ↕                                   │
│  CopilotKit Runtime (/api/copilotkit)                   │
│  Auto-detects: OpenAI GPT-4o-mini │ Google Gemini 2.0   │
│  Try/catch hardened │ JSON error responses               │
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

1. **Open the app** — 6-stage Kanban pipeline with 4 sample deals + AI copilot sidebar
2. **Create a deal:**
   > "Create a deal called 'Enterprise License' worth $50,000 for Acme Corp"
   - ✨ Rich deal preview card streams in chat (Generative UI) + toast notification
   - New deal card appears in the Lead column
   - Deals **persist across page reload** (localStorage)
3. **Move a deal:**
   > "Move Cloud Migration to Proposal stage"
   - 🔄 Move confirmation widget + toast notification
   - Deal card moves to the Proposal column
   - Invalid stages are **rejected** with helpful error messages
4. **Get analytics:**
   > "Show me a pipeline summary"
   - 📊 Pipeline summary widget with stats and stage breakdown
5. **Close a deal (HITL):**
   > "Close the Security Audit deal as won"
   - 🏆 Confirmation dialog — click **"✅ Confirm Won"** to approve
   - 🎉 Confetti celebration + toast notification
6. **Delete a deal (HITL):**
   > "Delete the old Cloud Migration deal"
   - 🗑️ Red-themed destructive confirmation dialog
   - Click **"🗑️ Delete Deal"** or **Cancel** — toast confirms the action

---

## Product & Engineering Decisions

1. **Canvas over chat-only** — Chose a Kanban board because agent-native apps should go beyond chat overlays. The copilot *changes visible state* in the workspace, demonstrating the core CopilotKit value proposition.

2. **Frontend tools pattern** — Defined tools via `useCopilotAction` on the frontend rather than routing through a separate LangGraph agent process. This keeps the demo single-process (one `npm run dev`) while the full LangGraph agent is defined in `agent.ts` ready for extraction. In production, I'd move to a dedicated agent backend connected via `HttpAgent` from `@ag-ui/client`.

3. **Two HITL confirmations** — Both "close deal" and "delete deal" require confirmation — creating/moving deals feel safe to auto-execute. This mirrors real-world UX where you gate irreversible/destructive actions.

4. **Generative UI for every tool** — Each tool renders a meaningful React component in chat — deal preview cards, move confirmations, analytics widgets, and delete confirmations. Agents communicate through rich UI, not just text.

5. **Apple-inspired dark mode design** — Custom CSS with glassmorphism, SF Pro typography, system colors, and subtle backdrop-filter effects for a premium native-app feel. No generic Bootstrap/Material — everything hand-crafted.

6. **Data persistence** — `usePersistedState` hook syncs deals to localStorage with cross-tab support via `storage` event. SSR-safe with `typeof window` check.

7. **Stale closure prevention** — All `findIndex` lookups run inside `setDeals` updater functions, preventing bugs when multiple deal mutations happen in quick succession.

8. **Dual LLM support** — Auto-detects OpenAI or Google Gemini keys at runtime. Demonstrates adapter flexibility and makes the demo accessible without paid API keys (Gemini has a free tier).

9. **Seeded sample data** — Pre-populated with 4 deals across different stages so the demo is immediately interactive without any setup.

---

## What I'd Improve With More Time

- **Supabase backend** — Migrate from localStorage to **Supabase** for persistent deal storage, user authentication, and real-time sync across devices. Supabase's Row Level Security (RLS) for multi-tenant pipelines
- **Agent backend with Supabase Edge Functions** — Extract tools into a LangGraph JS `StateGraph` agent running on Supabase Edge Functions, connected via `HttpAgent` from `@ag-ui/client` for true AG-UI protocol communication
- **Supabase Realtime** — Live collaboration on the pipeline with other team members via Supabase Realtime subscriptions
- **Drag-and-drop** — Let users manually drag deals between columns (complementing AI actions) using `@hello-pangea/dnd`
- **Multi-agent** — Add a "Research Agent" that can look up company info (via Tavily/Perplexity API) when creating deals
- **`useCoAgent`** — Migrate to bidirectional state sync with `useCoAgent` for fully shared typed state between agent and UI
- **Tests** — Add React Testing Library + Playwright tests for tool interactions and HITL flows
- **Deal detail modal** — Click a deal card to view/edit full details, notes, AI-generated insights, and activity log
- **Analytics dashboard** — Full reporting page with charts (Recharts) for pipeline velocity, conversion rates, and forecast

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
| **State Persistence** | localStorage (via custom `usePersistedState` hook) | — |
| **Design** | Apple HIG-inspired: SF Pro, System Colors, glassmorphism, backdrop-filter | — |

---

## AI Tools & Research Workflow

Building this project within 60 minutes required a deliberate multi-tool strategy. Here's exactly how each AI tool contributed:

### 🔬 Research Phase (Pre-Build)
- **Perplexity AI** — Deep-searched CopilotKit architecture, AG-UI protocol, and LangGraph JS integration patterns to understand how the pieces fit together
- **Google Deep Research** — Extended research on CopilotKit's `useCopilotAction`, `renderAndWaitForResponse`, and generative UI patterns
- **Claude Deep Research** — Created a comprehensive reference document (`claude.md`) distilling CopilotKit's core concepts, hooks, and best practices into a structured format that LLMs can consume as context. This "research-first" approach meant no time wasted figuring out APIs during the build

### 🏗️ Build Phase (60 Minutes)
- **Claude Opus 4.6** — Primary model for **all application logic**: CopilotKit tool definitions, state management, HITL flows, handler logic, stale closure fixes, and custom hooks (`usePersistedState`, `usePipelineAnalytics`). Opus was chosen for its strong reasoning on complex async state patterns
- **Gemini 3.0** — Used for **UI design and CSS**: the Apple-inspired dark mode design system, glassmorphism effects, responsive breakpoints, toast animations, and visual polish. Gemini excels at visual/creative work
- **Claude** — Used for **documentation**: README, DEMO_TALKTHROUGH.md, code comments, and architecture diagrams. Clean, structured technical writing

### 📚 Reference Tools
- **CopilotKit docs + Context7** — Live API reference queries during build for exact hook signatures and adapter configuration
- **GitHub Copilot** — Inline code completions for boilerplate TypeScript

> All output from every AI tool was reviewed, understood, tested, and edited by me. The code represents my understanding of the CopilotKit architecture and product vision.

---

## 🧠 Skills Demonstrated

This project showcases more than just code — it demonstrates an **efficient multi-tool engineering workflow** that delivered a production-quality app in 60 minutes:

| Skill | Evidence |
|-------|----------|
| **Research-first engineering** | Deep research with Perplexity, Google, and Claude *before* writing any code. Created `claude.md` as a reusable LLM context document |
| **Multi-model orchestration** | Opus 4.6 for logic, Gemini 3.0 for design, Claude for docs — each model used for its strengths |
| **CopilotKit mastery** | 5 tools, 2 HITL flows, Generative UI, shared state, chat suggestions — comprehensive feature coverage |
| **Production thinking** | Error boundaries, localStorage persistence, input validation, runtime hardening — not just a demo, but production-ready code |
| **Time management** | `main` branch = 60-min challenge. `master` branch = extended improvements. Clear branch strategy shows prioritization skills |
| **UX design** | Apple HIG-inspired glassmorphism, toast notifications, confetti celebrations, responsive design — premium feel |
| **TypeScript proficiency** | Strict typing, generic hooks, proper React patterns, no `any` hacks |

---

## 📋 Branch Strategy

| Branch | Purpose | What's Included |
|--------|---------|----------------|
| **`main`** | **60-minute submission** | Core CopilotKit integration: 4 tools, Generative UI, HITL, Kanban board, Apple design |
| **`master`** | **Extended / production** | Everything in `main` +: ErrorBoundary, localStorage persistence, Toast system, delete_deal HITL, analytics hook, responsive CSS, runtime hardening, stale closure fixes, input validation |

> The `master` branch represents what I would ship if this were a real production app. The `main` branch proves I can deliver a polished, working demo under time pressure.

---

## Security

- No secrets or API keys committed to the repository
- `.env.example` provided with instructions
- `.env` is in `.gitignore`
- Runtime adapter is initialized per-request with try/catch error handling
- Error boundary prevents full app crashes from reaching users

---

## Project Structure

```
dealflow/
├── src/
│   ├── app/
│   │   ├── api/copilotkit/route.ts   # CopilotKit Runtime (auto-detects OpenAI/Gemini, try/catch hardened)
│   │   ├── globals.css               # Apple-inspired dark mode design system + responsive breakpoints
│   │   ├── layout.tsx                # Root layout with Inter font + metadata
│   │   └── page.tsx                  # Main page (ErrorBoundary + CopilotKit + ToastContainer)
│   ├── components/
│   │   ├── DealCard.tsx              # Individual deal card (glassmorphism)
│   │   ├── ErrorBoundary.tsx         # React error boundary with styled fallback UI
│   │   ├── GenerativeUI.tsx          # Generative UI widgets (DealPreview, MovePreview, CloseDealConfirm)
│   │   ├── PipelineBoard.tsx         # Kanban board + all 5 CopilotKit tools (create, move, summary, close, delete)
│   │   ├── PipelineSummary.tsx       # Pipeline analytics widget (stats + stage breakdown)
│   │   └── Toast.tsx                 # Toast notification system (glassmorphism, auto-dismiss)
│   └── lib/
│       ├── agent.ts                  # LangGraph agent definition (createReactAgent + Zod tools)
│       ├── hooks.ts                  # Custom hooks (usePersistedState, usePipelineAnalytics)
│       └── types.ts                  # TypeScript types, stage config, sample data
├── DEMO_TALKTHROUGH.md               # Presentation script for demo walkthrough
├── .env.example                      # API key configuration template
└── README.md
```
