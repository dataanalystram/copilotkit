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

A **canvas-pattern** sales pipeline (not just a chat overlay) where an AI copilot **directly manipulates the application state** through **9 AI-callable tools**. The copilot can:

1. **Create deals** — Adds deal cards with validation (duplicate name guard, stage validation)
2. **Move deals** — Transitions deals between stages with LLM-hallucination protection
3. **Pipeline summary** — Renders a rich summary widget inline in chat (Generative UI)
4. **Close deals** — **HITL confirmation** before marking Won/Lost + 🎉 confetti celebration
5. **Delete deals** — **HITL confirmation** with destructive-action dialog
6. **Analyze pipeline** — Rich analytics dashboard with KPIs, stage distribution chart, win rate, weighted forecast
7. **Get deal insights** — Per-deal AI scoring (0-100) with risk factors and suggested next actions
8. **Score all deals** — Ranked list of all deals by AI-computed health score
9. **Show activity log** — Full mutation timeline tracking all actions (user vs. AI attribution)

### CopilotKit Features Demonstrated

| Feature | Implementation | Where |
|---------|---------------|-------|
| **Generative UI (×8)** | `useCopilotAction` with `render` — 8 distinct React components rendered inline in chat: deal previews, move confirmations, analytics dashboards, scoring cards, insights, and activity timelines | `PipelineBoard.tsx`, `GenerativeUI.tsx`, `DealAnalytics.tsx`, `DealInsights.tsx`, `DealScoreCard.tsx`, `ActivityTimeline.tsx` |
| **Human-in-the-Loop (×2)** | `renderAndWaitForResponse` — confirmation dialogs for both **closing** and **deleting** deals; agent pauses until user responds | `PipelineBoard.tsx`, `GenerativeUI.tsx` |
| **Shared State (Rich)** | `useCopilotReadable` — full pipeline state + analytics + activity count + available tools list shared as AI context | `PipelineBoard.tsx` |
| **Frontend Tools (×9)** | 9 tools defined via `useCopilotAction` with handlers, Generative UI renders, and HITL flows | `PipelineBoard.tsx` |
| **Chat Suggestions** | `useCopilotChatSuggestions` — dynamic suggestion chips that highlight advanced capabilities (scoring, insights, analytics) | `PipelineBoard.tsx` |
| **AG-UI Compatible** | LangGraph JS agent defined with `createReactAgent` + Zod schemas — ready for extraction to a separate agent backend via `@ag-ui/client` | `agent.ts` |

### Advanced Agentic Features (master branch)

| Feature | Detail |
|---------|--------|
| **AI Deal Scoring** | Multi-factor algorithm scores each deal 0-100 based on value, stage progression, pipeline age, and contact completeness. Color-coded risk levels: 🟢 Low, 🟡 Medium, 🔴 High |
| **Pipeline Analytics Dashboard** | KPI grid (total pipeline, win rate, forecast), horizontal bar chart for stage distribution with animated fills, and summary stats — all rendered as Generative UI in chat |
| **Weighted Forecast** | Calculates expected revenue using stage probability weights: Lead 10%, Qualified 25%, Proposal 50%, Negotiation 75% |
| **Activity Timeline** | Tracks all deal mutations with timestamps, type-colored dots, and AI vs. User attribution. Persists to localStorage |
| **Suggested Next Actions** | AI-generated per-deal suggestions based on current stage: discovery calls, proposal follow-ups, negotiation tactics |

### Production-Level Features

| Feature | Detail |
|---------|--------|
| **Error Boundary** | React error boundary catches rendering crashes and shows a styled reload screen instead of a white page |
| **Data Persistence** | Deals + activities persist to `localStorage` via `usePersistedState` hook — survives page reload, syncs across browser tabs |
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
│  │  9 useCopilotAction │←→│  8 Rich UI Components     │  │
│  │  useCopilotReadable │  │  2× HITL Confirm Dialogs  │  │
│  │  useCopilotChat     │  │  AI Deal Scoring (0-100)  │  │
│  │  Suggestions        │  │  Analytics + Forecasting  │  │
│  │                     │  │  Activity Timeline        │  │
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
6. **🆕 Analyze pipeline (Advanced):**
   > "Analyze the pipeline" or "How is my pipeline doing?"
   - 📊 Rich analytics dashboard renders in chat: KPI grid, stage distribution chart, weighted forecast
7. **🆕 Score all deals:**
   > "Score my deals" or "Which deals need attention?"
   - 🏅 Ranked list of all deals with AI scores (0–100), risk badges, and weighted values
8. **🆕 Get deal insights:**
   > "Give me insights on the Annual SaaS License deal"
   - 🔍 Per-deal card with score breakdown, risk factors, and a suggested next action
9. **🆕 Show activity log:**
   > "Show me the activity log"
   - 📋 Full timeline of all deal mutations with AI vs. User attribution

---

## Product & Engineering Decisions

1. **Canvas over chat-only** — Chose a Kanban board because agent-native apps should go beyond chat overlays. The copilot *changes visible state* in the workspace, demonstrating the core CopilotKit value proposition.

2. **Frontend tools pattern** — Defined tools via `useCopilotAction` on the frontend rather than routing through a separate LangGraph agent process. This keeps the demo single-process (one `npm run dev`) while the full LangGraph agent is defined in `agent.ts` ready for extraction. In production, I'd move to a dedicated agent backend connected via `HttpAgent` from `@ag-ui/client`.

3. **Two HITL confirmations** — Both "close deal" and "delete deal" require confirmation — creating/moving deals feel safe to auto-execute. This mirrors real-world UX where you gate irreversible/destructive actions.

4. **Generative UI for every tool** — All 9 tools render meaningful React components in chat — deal previews, analytics dashboards, scoring cards, insights, activity timelines. Agents communicate through rich UI, not just text.

5. **Apple-inspired dark mode design** — Custom CSS with glassmorphism, SF Pro typography, system colors, and subtle backdrop-filter effects for a premium native-app feel. No generic Bootstrap/Material — everything hand-crafted.

6. **Data persistence** — `usePersistedState` hook syncs deals + activities to localStorage with cross-tab support via `storage` event. SSR-safe with `typeof window` check.

7. **Stale closure prevention** — All `findIndex` lookups run inside `setDeals` updater functions, preventing bugs when multiple deal mutations happen in quick succession.

8. **AI deal scoring algorithm** — Multi-factor scoring (0–100) based on deal value vs. average, stage progression, pipeline age, and contact completeness. Color-coded risk levels drive suggested next actions.

9. **Dual LLM support** — Auto-detects OpenAI or Google Gemini keys at runtime. Demonstrates adapter flexibility and makes the demo accessible without paid API keys (Gemini has a free tier).

10. **Seeded sample data** — Pre-populated with 4 deals across different stages so the demo is immediately interactive without any setup.

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
│   │   ├── ActivityTimeline.tsx      # 🆕 Mutation timeline with timestamps and AI/User attribution
│   │   ├── DealAnalytics.tsx         # 🆕 Pipeline analytics dashboard (KPIs, chart, forecast)
│   │   ├── DealCard.tsx              # Individual deal card (glassmorphism)
│   │   ├── DealInsights.tsx          # 🆕 Per-deal AI scoring with risk factors + suggestions
│   │   ├── DealScoreCard.tsx         # 🆕 Ranked deal list with AI health scores
│   │   ├── ErrorBoundary.tsx         # React error boundary with styled fallback UI
│   │   ├── GenerativeUI.tsx          # Generative UI widgets (DealPreview, MovePreview, CloseDealConfirm)
│   │   ├── PipelineBoard.tsx         # Kanban board + all 9 CopilotKit tools + activity tracking
│   │   ├── PipelineSummary.tsx       # Pipeline summary widget (stats + stage breakdown)
│   │   └── Toast.tsx                 # Toast notification system (glassmorphism, auto-dismiss)
│   └── lib/
│       ├── agent.ts                  # LangGraph agent definition (createReactAgent + Zod tools)
│       ├── hooks.ts                  # Custom hooks (usePersistedState, usePipelineAnalytics)
│       └── types.ts                  # TypeScript types, Activity, STAGE_PROBABILITY, sample data
├── DEMO_TALKTHROUGH.md               # Presentation script for demo walkthrough
├── .env.example                      # API key configuration template
└── README.md
```

