# PaxiPM AI – MVP Phase 1 Specification

## 1. Objective

Build an AI-driven Project Management SaaS focused on IT infrastructure and software project delivery.  

The MVP must automate:

- Project setup (charter, scope, WBS)

- Risk prediction

- Reporting and insights

## 2. Core Modules

### 2.1 Authentication

- User registration, login, JWT-based session.

- Roles: Admin, Project Manager, Viewer.

### 2.2 Project Management

- Create and list projects.

- Each project has: title, description, client, start/end dates, status.

- AI auto-generates project charter and WBS from short input.

### 2.3 Risk Prediction

- AI analyses project data to assign a Risk Score (0–100).

- Uses task delays, resource load, and AI heuristics.

### 2.4 Reporting

- Auto-generated summary reports.

- Daily or weekly snapshots with charts and project KPIs.

### 2.5 Dashboard

- Overview cards for active projects, overdue tasks, and AI alerts.

- Quick AI chat for on-demand updates.

---

## 3. System Design

### 3.1 Architecture

Frontend (React) → Backend (Express API) → PostgreSQL → AI Engine (FastAPI)

AI Engine connects with OpenAI GPT-5 API or local LLM for:

- Text generation (charter, reports)

- Risk scoring and pattern analysis.

### 3.2 Data Entities

- User: id, name, email, role, passwordHash

- Project: id, title, description, client, startDate, endDate, status

- Task: id, projectId, title, owner, progress, dueDate

- Report: id, projectId, summary, createdAt

### 3.3 APIs

| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | User login |
| `/api/projects` | GET | List projects |
| `/api/projects` | POST | Create new project |
| `/api/ai/charter` | POST | Generate project charter |
| `/api/ai/risk` | POST | Generate risk score |
| `/api/reports` | GET | Fetch reports |

---

## 4. AI Integration

- Prompt templates in `/ai_engine/prompts`

- Python service (`ai_manager.py`) connects to OpenAI.

- Node backend calls FastAPI endpoints for AI results.

---

## 5. Tech Stack

| Layer | Tool |
|--------|------|
| Frontend | React, Tailwind, Axios |
| Backend | Node.js, Express |
| AI Engine | Python, FastAPI, LangChain |
| Database | PostgreSQL |
| Auth | JWT |
| Deployment | Docker + Synology NAS |
| Version Control | GitHub (paxiitdevteam/paxipm-ai) |

---

## 6. MVP Deliverables

- AI-generated charter + risk analysis

- Dashboard UI

- REST API

- Connected AI engine

- Documentation & deployable Docker container

---

## 7. Phase 2 Preview

- Full Agile board

- Multi-language UI

- ITIL module

- Predictive analytics dashboard

- AI voice/chatbot for project updates
