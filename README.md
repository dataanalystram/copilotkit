# ⚡ DealFlow — AI Sales Pipeline Copilot

An AI-powered sales pipeline management tool built with **CopilotKit** + **LangGraph JS** + **Gemini 2.5 Flash**. Features a Kanban board UI with an intelligent copilot sidebar, a **live AI Playground** for real-time widget generation, **10 AI-callable tools**, Human-in-the-Loop confirmation gates, AI deal scoring, a Strategy Advisor, and a full LangGraph ReAct agent backend — all with production-grade error handling, data persistence, and toast notifications.

> **📌 Branch Strategy:** The `main` branch contains the initial submission. The `master` branch is the **production-ready version** with major upgrades: LangGraph agent backend, AI Playground tab, Strategy Advisor, real weather API, dynamic suggestions, Gemini 2.5 Flash, SSR hydration fix, and comprehensive bug fixes. Both branches work independently.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![CopilotKit](https://img.shields.io/badge/CopilotKit_v1.51-0a84ff?style=flat-square)
![LangGraph](https://img.shields.io/badge/LangGraph_JS-1a1a2e?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61dafb?style=flat-square&logo=react&logoColor=black)

---

## What I Built

A **canvas-pattern** sales pipeline (not just a chat overlay) where an AI copilot **directly manipulates the application state** through **10 AI-callable tools** across two tabs:

### ⚡ Pipeline Tab — 10 Frontend Tools

| # | Tool | Type | Description |
|---|------|------|-------------|
| 1 | **create_deal** | Generative UI | Creates deals with validation + rich preview card |
| 2 | **move_deal** | Generative UI | Moves deals between stages with move confirmation widget |
| 3 | **close_deal** | HITL | Closes deals as Won/Lost — requires user confirmation + 🎉 confetti |
| 4 | **delete_deal** | HITL | Deletes deals — destructive action confirmation dialog |
| 5 | **get_pipeline_summary** | Generative UI | Rich summary widget with stats and stage breakdown |
| 6 | **analyze_pipeline** | Generative UI | Full analytics dashboard: KPI grid, stage chart, weighted forecast |
| 7 | **get_deal_insights** | Generative UI | Per-deal AI scoring (0-100) with risk factors + next actions |
| 8 | **score_deals** | Generative UI | Ranked deal list by AI health score with color-coded risk |
| 9 | **show_activity** | Generative UI | Mutation timeline with AI vs. User attribution |
| 10 | **strategy_advisor** | Generative UI | 🧠 AI Strategy Advisor — pipeline health score + prioritized action plan |

### 🧪 AI Playground Tab — 8 Live Widget Tools

A real-time interactive sandbox where the AI generates UI widgets on a canvas through chat:

| # | Tool | Description |
|---|------|-------------|
| 1 | **show_weather** | 🌤️ Real-time weather cards (live data from wttr.in API) |
| 2 | **create_chart** | 📊 Animated bar charts with custom data and color themes |
| 3 | **create_stat_card** | 📈 KPI stat cards with trend arrows and change percentages |
| 4 | **show_quote** | 💭 Inspirational quote cards with author attribution |
| 5 | **generate_palette** | 🎨 Color palettes with click-to-copy hex codes |
| 6 | **create_timer** | ⏱️ Live countdown timers with progress bar |
| 7 | **create_progress** | 📊 Animated progress bars with custom colors |
| 8 | **clear_playground** | 🧹 Clear all widgets from the canvas |

### CopilotKit Features Demonstrated

| Feature | Implementation | Where |
|---------|---------------|-------|
| **Generative UI (×16)** | `useCopilotAction` with `render` — 16 distinct React components rendered inline in chat across both tabs | `PipelineBoard.tsx`, `CopilotPlayground.tsx`, `GenerativeUI.tsx`, `DealAnalytics.tsx`, `DealInsights.tsx`, `DealScoreCard.tsx`, `ActivityTimeline.tsx`, `StrategyAdvisor.tsx` |
| **Human-in-the-Loop (×2)** | `renderAndWaitForResponse` — confirmation dialogs for both **closing** and **deleting** deals; agent pauses until user responds | `PipelineBoard.tsx`, `GenerativeUI.tsx` |
| **Shared State (Rich)** | `useCopilotReadable` — full pipeline state + playground state + analytics + activity count + available tools list shared as AI context | `PipelineBoard.tsx`, `CopilotPlayground.tsx` |
| **Frontend Tools (×18)** | 10 pipeline tools + 8 playground tools defined via `useCopilotAction` with handlers, Generative UI renders, and HITL flows | `PipelineBoard.tsx`, `CopilotPlayground.tsx` |
| **Dynamic Chat Suggestions** | `useCopilotChatSuggestions` — context-aware suggestions that change based on canvas state, untried widget types, and interaction history | `PipelineBoard.tsx`, `CopilotPlayground.tsx` |
| **LangGraph Agent Backend** | Full ReAct agent with 7 backend tools, dual LLM support, structured system prompt — exposed at `/api/agent` | `agent.ts`, `api/agent/route.ts` |

### Advanced Agentic Features

| Feature | Detail |
|---------|--------|
| **🧠 AI Strategy Advisor** | Multi-step agentic flow: analyzes pipeline → scores all deals → identifies risks → generates 3-5 prioritized strategic actions with impact levels (🔴 High, 🟠 Medium, 🟢 Low) |
| **LangGraph ReAct Agent** | Full `createReactAgent` backend with 7 tools (deal_analysis, get_deal_details, pipeline_summary, scoring, forecasting, search_deals, activity_summary), dual LLM support (OpenAI/Gemini 2.5 Flash), and enriched system prompt |
| **AI Deal Scoring** | Multi-factor algorithm scores each deal 0-100 based on value, stage progression, pipeline age, and contact completeness. Color-coded risk levels: 🟢 Low, 🟡 Medium, 🔴 High |
| **Real-Time Weather** | Live weather data from wttr.in API (free, no key needed) with 5s timeout and graceful fallback |
| **Pipeline Analytics Dashboard** | KPI grid (total pipeline, win rate, forecast), horizontal bar chart with animated fills, and summary stats — all as Generative UI |
| **Weighted Forecast** | Expected revenue using stage probability weights: Lead 10%, Qualified 25%, Proposal 50%, Negotiation 75% |
| **Activity Timeline** | Tracks all deal mutations with timestamps, type-colored dots, and AI vs. User attribution. Persists to localStorage |

### Production-Level Features

| Feature | Detail |
|---------|--------|
| **Error Boundary** | React error boundary catches rendering crashes with styled reload screen |
| **SSR Hydration Fix** | `usePersistedState` delays localStorage read to avoid hydration mismatches |
| **Data Persistence** | Deals + activities persist to `localStorage` via `usePersistedState` — survives reload, syncs across tabs |
| **Toast Notifications** | Glassmorphism toasts on every action: create (✨), move (🔄), close (🏆), delete (🗑️), error (❌) |
| **Runtime Hardening** | CopilotKit runtime wrapped in try/catch with JSON error responses |
| **Input Validation** | Duplicate deal name guard, stage validation, stale closure prevention |
| **Responsive Design** | CSS media queries for 1200px, 768px, 480px — Kanban adapts 6-col → 2-col → 1-col |

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16 + React 19)                                │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │  ⚡ Pipeline Tab      │  │  🧪 AI Playground Tab            │  │
│  │  (6-stage Kanban)     │  │  (Live Widget Canvas)            │  │
│  │  10 useCopilotAction  │  │  8 Widget Generation Tools       │  │
│  │  2× HITL Confirm      │  │  Real-time Weather (wttr.in)     │  │
│  │  AI Strategy Advisor  │  │  Charts, Stats, Palettes, Timers │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
│           ↕                         ↕                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CopilotSidebar (Chat + Generative UI + Dynamic Hints)     │ │
│  │  18 Tools • 16 GenUI Components • 2 HITL Gates             │ │
│  │  useCopilotReadable • useCopilotChatSuggestions            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│           ↕                         ↕                            │
│  usePersistedState ←→ localStorage (SSR-safe, cross-tab sync)   │
│  ErrorBoundary (crash recovery)                                  │
│                      ↕                                           │
│  CopilotKit Runtime (/api/copilotkit)                           │
│  Google Gemini 2.5 Flash │ OpenAI GPT-4o-mini (auto-detect)     │
│                      ↕                                           │
│  LangGraph Agent (/api/agent)                                   │
│  createReactAgent │ 7 Backend Tools │ ReAct Architecture        │
└──────────────────────────────────────────────────────────────────┘
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

# 2. Switch to master branch
git checkout master

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add ONE of these API keys:
#   OPENAI_API_KEY=sk-...       (recommended, GPT-4o-mini)
#   GOOGLE_API_KEY=AIza...      (free tier available, Gemini 2.5 Flash)

# 5. Start the dev server
npm run dev
```

Then open **http://localhost:3000**

> **Note:** The runtime auto-detects which API key is present. If both are set, OpenAI takes priority.

---

## Demo Script (What to Try)

### ⚡ Pipeline Tab

1. **Create a deal:**
   > "Create a deal called 'Enterprise License' worth $50,000 for Acme Corp"
   - ✨ Rich deal preview card + toast notification
2. **Move a deal:**
   > "Move Cloud Migration to Proposal stage"
   - 🔄 Move confirmation widget + deal moves in Kanban
3. **Pipeline summary:**
   > "Show me a pipeline summary"
   - 📊 Summary widget with stats and stage breakdown
4. **Close a deal (HITL):**
   > "Close the Security Audit deal as won"
   - 🏆 Confirmation dialog → Confetti celebration 🎉
5. **Analyze pipeline:**
   > "Analyze the pipeline"
   - 📊 Rich analytics dashboard: KPIs, stage chart, weighted forecast
6. **Score all deals:**
   > "Score my deals"
   - 🏅 Ranked deal list with AI scores (0–100) and risk badges
7. **Deal insights:**
   > "Give me insights on the Annual SaaS License deal"
   - 🔍 Per-deal score breakdown + risk factors + next action
8. **Activity log:**
   > "Show me the activity log"
   - 📋 Full mutation timeline with AI/User attribution
9. **🧠 Strategy Advisor:**
   > "What should I focus on?"
   - Pipeline health score + 3-5 prioritized actions with impact levels

### 🧪 AI Playground Tab

10. **Real weather:**
    > "Show weather for Tokyo"
    - 🌤️ Live weather card with actual temperature, humidity, wind
11. **Bar chart:**
    > "Create a bar chart of top 5 programming languages by popularity"
    - 📊 Animated bar chart with custom colors
12. **Color palette:**
    > "Generate a sunset color palette"
    - 🎨 Interactive swatches (click to copy hex)
13. **Stat card:**
    > "Create a revenue stat card showing $2.4M up 18%"
    - 📈 KPI card with trend arrow
14. **Countdown timer:**
    > "Create a 30-second countdown timer"
    - ⏱️ Live ticking timer with progress bar
15. **Quote card:**
    > "Show me an inspirational quote"
    - 💭 Beautiful quote card with author
16. **Clear canvas:**
    > "Clear the playground"
    - 🧹 Resets the widget canvas

---

## Product & Engineering Decisions

1. **Canvas over chat-only** — Chose a Kanban board because agent-native apps should go beyond chat overlays. The copilot *changes visible state* in the workspace, demonstrating the core CopilotKit value proposition.

2. **Two-tab architecture** — Pipeline tab for real sales workflow, Playground tab for showcasing CopilotKit's generative UI engine in a creative sandbox. Both tabs share the same copilot sidebar.

3. **Frontend tools + backend agent** — 18 frontend tools via `useCopilotAction` + a full LangGraph ReAct agent at `/api/agent`. Frontend tools directly manipulate React state, backend agent provides agentic reasoning.

4. **Two HITL confirmations** — Close-deal and delete-deal require user approval; create/move feel safe to auto-execute. This mirrors real-world UX where you gate irreversible/destructive actions.

5. **Real-time data** — Weather widget fetches live data from wttr.in API (free, no key) instead of mock data. Demonstrates real-world API integration in Generative UI.

6. **Dynamic suggestions** — Chat suggestions change based on canvas state: they suggest untried widget types, add variety after 3+ types, and show "clear" only when widgets exist.

7. **Apple-inspired dark mode** — Custom CSS with glassmorphism, SF Pro typography, system colors, and backdrop-filter effects for premium native-app feel. No generic Bootstrap/Material.

8. **SSR-safe persistence** — `usePersistedState` hook delays localStorage reads to avoid React hydration mismatches in Next.js SSR.

9. **Dual LLM support** — Auto-detects OpenAI or Gemini 2.5 Flash keys at runtime. Makes the demo accessible without paid API keys (Gemini has free tier).

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------| 
| **Framework** | Next.js (App Router, Turbopack) | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **AI Framework** | CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`) | 1.51.3 |
| **Agent Framework** | LangGraph JS (`@langchain/langgraph`, `@langchain/core`, `@langchain/openai`, `@langchain/google-genai`) | 1.1.4 |
| **LLM** | Google Gemini 2.5 Flash **or** OpenAI GPT-4o-mini (auto-detected) | — |
| **Styling** | Tailwind CSS 4 + custom Apple-inspired dark mode CSS | 4.x |
| **Weather API** | wttr.in (free, no API key) | — |
| **Validation** | Zod (agent tool schemas) | 3.25.x |
| **Animations** | canvas-confetti (deal won celebration) | 1.9.4 |
| **State Persistence** | localStorage (via custom `usePersistedState` hook, SSR-safe) | — |
| **Design** | Apple HIG-inspired: SF Pro, System Colors, glassmorphism, backdrop-filter | — |

---

## 📋 Branch Strategy

| Branch | Purpose | What's Included |
|--------|---------|----------------|
| **`main`** | **Initial submission** | Core CopilotKit integration: 4 tools, Generative UI, HITL, Kanban board, Apple design |
| **`master`** | **Production-ready** | Everything in `main` + LangGraph agent backend, AI Playground tab (8 widget tools), Strategy Advisor, real weather API, dynamic suggestions, Gemini 2.5 Flash, SSR hydration fix, move_deal bug fix, delete_deal HITL, analytics, activity timeline, error boundary, toast system, responsive CSS |

---

## Security

- No secrets or API keys committed to the repository
- `.env.example` provided with instructions
- `.env` is in `.gitignore`
- Runtime adapter initialized per-request with try/catch error handling
- Error boundary prevents full app crashes

---

## Project Structure

```
dealflow/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/route.ts          # LangGraph agent HTTP endpoint (ReAct agent)
│   │   │   └── copilotkit/route.ts     # CopilotKit Runtime (auto-detects Gemini/OpenAI)
│   │   ├── globals.css                 # Apple-inspired dark mode design system
│   │   ├── layout.tsx                  # Root layout with Inter font + metadata
│   │   └── page.tsx                    # Tab navigation (Pipeline | AI Playground)
│   ├── components/
│   │   ├── ActivityTimeline.tsx        # Mutation timeline with AI/User attribution
│   │   ├── CopilotPlayground.tsx       # 🆕 AI Playground — 8 widget tools + live canvas
│   │   ├── DealAnalytics.tsx           # Pipeline analytics dashboard (KPIs, chart, forecast)
│   │   ├── DealCard.tsx                # Individual deal card (glassmorphism)
│   │   ├── DealInsights.tsx            # Per-deal AI scoring with risk factors
│   │   ├── DealScoreCard.tsx           # Ranked deal list with AI health scores
│   │   ├── ErrorBoundary.tsx           # React error boundary with styled fallback
│   │   ├── GenerativeUI.tsx            # GenUI widgets (DealPreview, MovePreview, CloseDealConfirm)
│   │   ├── PipelineBoard.tsx           # Kanban board + 10 CopilotKit tools + activity tracking
│   │   ├── PipelineSummary.tsx         # Pipeline summary widget
│   │   ├── StrategyAdvisor.tsx         # 🆕 AI Strategy Advisor with health score + action plan
│   │   └── Toast.tsx                   # Toast notification system (glassmorphism)
│   ├── lib/
│   │   ├── agent.ts                    # LangGraph ReAct agent (7 tools, Gemini 2.5 Flash)
│   │   ├── hooks.ts                    # Custom hooks (usePersistedState, usePipelineAnalytics)
│   │   └── types.ts                    # TypeScript types, STAGE_PROBABILITY, sample data
│   └── types/
│       └── copilotkit-sdk.d.ts         # Type declarations for @copilotkit/sdk-js
├── DEMO_TALKTHROUGH.md                 # Presentation script for demo walkthrough
├── .env.example                        # API key configuration template
└── README.md
```
