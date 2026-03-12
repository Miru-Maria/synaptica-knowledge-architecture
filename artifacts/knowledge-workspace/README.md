# Synaptica Knowledge Architecture

> An AI-powered knowledge systems workspace — built as a portfolio demonstration of AI Knowledge Systems Design & Architecture capabilities.

![Synaptica](https://img.shields.io/badge/Synaptica-Knowledge%20Architecture-10b981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0zIDlsOS05IDkgOUgzeiIvPjwvc3ZnPg==)
![Built with](https://img.shields.io/badge/Built%20with-React%20%2B%20OpenAI-10b981?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)

---

## Overview

**Synaptica Knowledge Architecture** is a suite of five AI-powered tools designed for documentation professionals, knowledge engineers, and technical writers who want to demonstrate or apply AI-driven thinking to knowledge management. Each tool reflects a core competency expected of an AI Knowledge Systems Designer/Architect.

Built as a portfolio project under the **Synaptica Knowledge Systems** brand, this workspace showcases practical, working implementations of AI applied to the full knowledge lifecycle — from creation and structuring to gap analysis, retrieval, and onboarding.

---

## Live Tools

### 1. 🔍 Semantic Knowledge Search

Intelligently searches across a pasted knowledge base using AI-ranked relevance scoring — no indexing or vector database required.

**What it does:**
- Accepts raw documentation or knowledge base content (Confluence exports, wikis, SOPs, policies)
- Accepts a natural language search query
- Returns ranked results with relevance scores, excerpts, and explanations of why each result matches
- Provides an AI-generated summary answering the query from the documents

**Ideal for:** Demonstrating AI-augmented knowledge retrieval, semantic understanding over keyword search, and explainable AI results.

---

### 2. 📄 Documentation Gap Analyzer

Analyses existing documentation against real-world context (support tickets, user stories, or product descriptions) to identify what's missing — before users notice.

**What it does:**
- Accepts existing documentation and supplementary context (e.g. support ticket themes, user journey notes)
- Accepts an optional target audience specification
- Returns a **coverage score** (0–100%), a prioritised list of gaps (High / Medium / Low), suggested content for each gap, an overall summary, and strategic recommendations
- Helps prioritise documentation work by impact rather than guesswork

**Ideal for:** Demonstrating proactive knowledge strategy, AI-assisted content planning, and audit-grade thinking about documentation systems.

---

### 3. 💬 Smart FAQ Builder

Transforms flat, dense documentation into structured, intent-based FAQ content — organised by topic and written the way users actually ask questions.

**What it does:**
- Accepts raw source documentation (manuals, specs, policies, guides)
- Accepts an optional audience specification and item count limit
- Returns categorised FAQ items with natural-language questions, concise answers, and keyword tags
- Presents results as an interactive, collapsible accordion by category

**Ideal for:** Demonstrating knowledge architecture thinking — structuring information around user intent rather than document structure.

---

### 4. 🤖 Onboarding Assistant

A RAG-style (Retrieval-Augmented Generation) conversational AI that onboards new team members based on injected company documentation — your own knowledge base becomes the AI's only source of truth.

**What it does:**
- Creates persistent onboarding sessions with a trainee name, role, and a custom knowledge base (paste any wiki, policy set, or process document)
- Maintains a streaming chat interface with full conversation history
- The AI assistant answers questions using only the injected documentation, citing relevant sections where applicable
- Multiple sessions can be created and revisited
- Welcomes the trainee by name and role at session start

**Ideal for:** Demonstrating practical RAG implementation, conversational AI design, and the application of knowledge systems to real enterprise onboarding challenges.

---

### 5. 🧪 Prompt Engineering Toolkit

A curated library of professional AI prompts built specifically for knowledge systems work, with a live sandbox to test, iterate, and save custom prompts.

**What it does:**

**Library tab:**
- Displays 8 built-in professional prompt templates across categories: Drafting, Summarization, Analysis, Quality, Onboarding, FAQ, Architecture
- Each prompt shows its template, description, category badge, and variables
- Any prompt can be loaded directly into the sandbox with one click

**Sandbox / Test tab:**
- Accepts any prompt template using `{{variable}}` placeholder syntax
- Auto-detects variables from the template and renders individual input fields
- Streams AI responses live as the model generates them
- Allows saving any tested prompt to your personal library

**Built-in prompt categories:**
| Prompt | Category | Purpose |
|---|---|---|
| Technical Procedure Writer | Drafting | Step-by-step procedures from raw notes |
| Audience-Specific Summarizer | Summarization | Technical content rewritten for specific audiences |
| Documentation Gap Prompter | Analysis | Identifies missing information in documents |
| Style Guide Checker | Quality | Flags content inconsistencies against style rules |
| Onboarding Script Generator | Onboarding | Onboarding guides for new team members |
| FAQ Question Generator | FAQ | Top questions and answers from documentation |
| Release Notes Writer | Drafting | User-friendly release notes from technical changes |
| Knowledge Base Structurer | Architecture | Taxonomy and article structure from raw content |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4, Framer Motion |
| UI Components | shadcn/ui (Radix UI) |
| Routing | Wouter |
| State Management | TanStack React Query |
| Backend | Express 5, Node.js |
| Database | PostgreSQL + Drizzle ORM |
| AI / LLM | OpenAI GPT-5.2 (chat completions + streaming SSE) |
| API Contract | OpenAPI 3.1 + Orval codegen |
| Validation | Zod |
| Monorepo | pnpm workspaces |

---

## Architecture

Synaptica follows a contract-first full-stack architecture:

```
synaptica-knowledge-architecture/
├── artifacts/
│   ├── api-server/          # Express 5 REST API
│   │   └── src/routes/
│   │       └── knowledge/   # All 5 AI tool endpoints
│   └── knowledge-workspace/ # React + Vite frontend
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 specification
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod validation schemas
│   ├── db/                  # Drizzle ORM schema + DB connection
│   └── integrations-openai-ai-server/  # OpenAI integration layer
```

All API contracts are defined first in OpenAPI, then generated into type-safe React Query hooks and Zod schemas — ensuring the frontend and backend never drift apart.

---

## API Endpoints

All endpoints are under `/api/knowledge/`:

| Method | Endpoint | Tool |
|---|---|---|
| `POST` | `/knowledge/search` | Knowledge Search |
| `POST` | `/knowledge/analyze-gaps` | Gap Analyzer |
| `POST` | `/knowledge/build-faq` | Smart FAQ Builder |
| `GET` | `/knowledge/onboarding/sessions` | List Onboarding Sessions |
| `POST` | `/knowledge/onboarding/sessions` | Create Onboarding Session |
| `GET` | `/knowledge/onboarding/sessions/:id/messages` | Get Chat History |
| `POST` | `/knowledge/onboarding/sessions/:id/messages` | Send Message (SSE) |
| `GET` | `/knowledge/prompts` | List Prompt Templates |
| `POST` | `/knowledge/prompts` | Save Custom Prompt |
| `DELETE` | `/knowledge/prompts/:id` | Delete Prompt |
| `POST` | `/knowledge/prompts/test` | Test Prompt (SSE) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (or Replit's built-in DB)
- OpenAI API key (or Replit AI Integrations access)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/synaptica-knowledge-architecture.git
cd synaptica-knowledge-architecture

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Add DATABASE_URL, AI_INTEGRATIONS_OPENAI_BASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in another terminal)
pnpm --filter @workspace/knowledge-workspace run dev
```

---

## About

This project was built as part of the **Synaptica Knowledge Systems** portfolio — a personal brand and freelance offering focused on the intersection of AI, technical writing, and knowledge architecture.

It demonstrates practical, deployable AI systems built around the core competencies of an **AI Knowledge Systems Designer/Architect**:

- Structuring and retrieving knowledge semantically
- Identifying and filling documentation gaps strategically
- Designing AI-augmented onboarding experiences
- Engineering reusable prompt systems for knowledge work
- Building full-stack AI tools with production-quality architecture

---

## License

MIT — feel free to explore, fork, and build on this.

---

*Synaptica Knowledge Systems — Designing the intelligence layer of the modern organisation.*
