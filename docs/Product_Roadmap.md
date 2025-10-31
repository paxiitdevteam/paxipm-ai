# PaxiPM AI – SaaS Platform Roadmap (Updated with ITIL & Service Management)

## 1. Project Overview

PaxiPM AI is an AI-driven Project Management SaaS platform specialized in IT Infrastructure and Software Development projects.  

It combines PMP, ITIL, Scrum, and SAFe practices with AI automation.

## 2. Objective

Deliver an enterprise-grade AI Project and Service Management platform hosted on Synology NAS (MariaDB backend) with:

- AI automation for project setup, risk, and reporting.
- PMP + ITIL + Agile methodology alignment.
- Full ITIL4 service delivery: ITAM, ISAM, SLA tracking, and incident management.
- Multi-tenant SaaS architecture.

---

## 3. CURRENT STATUS

### ✅ Completed

| Area | Status | Details |
|------|---------|----------|
| GitHub Repo | ✅ | `paxiitdevteam/paxipm-ai` created |
| Project Architecture | ✅ | Folder and workflow structure defined |
| Documentation | ✅ | MVP specs and AI model design completed |
| Starter Code | ✅ | Backend, AI engine, and frontend implemented |
| Database | ✅ | MariaDB integration with SQLite fallback |
| Phase 1 MVP | ✅ | **100% Complete** - All deliverables done |
| Docker Deployment | ✅ | Complete Docker setup for all services |
| API Documentation | ✅ | Swagger/OpenAPI documentation at `/api-docs` |
| OpenAI Integration | ✅ | AI Engine integrated with OpenAI API |
| Landing Page | ✅ | Professional SaaS landing page with AI demo |
| IT Project Types | ✅ | 7 project types including ITIL section |

---

## 4. FUNCTIONALITIES OVERVIEW

### 4.1 Core Project Management
- Project and task lifecycle (create, plan, close)
- AI charter and WBS generation
- Risk prediction and reporting
- Gantt and Kanban visualization
- Resource management and workload tracking
- **Budget Management & Multi-Currency Support**
  - Budgeted amount, spent amount, and remaining budget tracking
  - Universal currency support (USD, EUR, GBP, JPY, CNY, INR, AUD, CAD, and 100+ currencies)
  - Currency selection per project or organization
  - Budget health indicators (On Budget, Over Budget, Under Budget)
  - Budget utilization percentage and trend analysis
  - Multi-currency reports and financial dashboards

### 4.2 IT Infrastructure Projects
- Hardware refresh cycles (PCs, laptops, tablets, phones, iPads)
- PC refresh and hardware rollout
- LAN/WAN and Wi-Fi upgrades
- Server, NAS, and virtualization
- Cloud migration and hybrid setups (Azure, AWS)
- Cybersecurity and endpoint protection
- Stadium and event IT systems

### 4.3 Software Delivery
- SaaS and web application delivery
- API integration and workflow automation
- CI/CD and DevOps pipelines
- Data analytics and AI-driven dashboards
- Full-stack software development (Agile, Scrum)

### 4.4 AI-Driven Features
- AI assistant for PM queries
- Predictive risk and delay detection
- Automated progress and SLA reporting
- AI lessons-learned generator
- AI scheduling and estimation engine
- Interactive AI charter generation (live demo on landing page)

### 4.5 ITIL & Service Management

**To be implemented in Phase 6**

- **IT Asset Management (ITAM)**  
  Asset inventory, lifecycle, warranty, and cost tracking.  
  Links assets to projects and incidents.

- **Information Security Asset Management (ISAM)**  
  Security classification, compliance mapping, and AI risk scoring.

- **Service Level Management (SLM / SLA)**  
  SLA definition, monitoring, and AI breach prediction dashboards.

- **Incident, Problem, and Change Management**  
  Automated triage, root cause detection, and change approval workflows.

- **Configuration Management (CMDB)**  
  Auto-discovery and relationship mapping between assets, services, and projects.

- **Continuous Service Improvement (CSI)**  
  AI-based trend analysis and performance recommendations.

---

## 5. DEVELOPMENT ROADMAP

### **Phase 1 – MVP (Baseline Platform)**
**Goal:** Working base platform with AI charter generator and risk reports.  
**Duration:** 3 sprints × 2 weeks.

**Deliverables:**
- Working local stack (Frontend ↔ Backend ↔ AI Engine ↔ MariaDB)
- User registration/login (JWT)
- Project CRUD (create, view, delete)
- AI charter generation endpoint
- Risk prediction endpoint
- Dashboard page
- REST API documentation
- Docker compose deployment

**Status:** ✅ **100% COMPLETE** - All deliverables implemented and tested

---

### **Phase 2 – Core Project Management**
**Goal:** Expand project control with tasks, milestones, resources, and budget management.  
**Duration:** 4 sprints.

**Deliverables:**
- Task management (create, assign, track)
- Milestone and Gantt view
- Risk and issue registers
- Resource management page
- **Budget Management & Multi-Currency Support**
  - Budget tracking (budgeted, spent, remaining)
  - Universal currency selection (USD, EUR, GBP, JPY, CNY, INR, AUD, CAD, and 100+ currencies)
  - Currency per project or organization setting
  - Budget health indicators and alerts
  - Budget utilization tracking and reports
  - Multi-currency financial dashboards
- File uploads per project
- Email/in-app notifications
- Frontend state management (Context API)
- Database migration scripts
- Initial Docker containerization for NAS testing

---

### **Phase 3 – AI Enhancement**
**Goal:** Add advanced AI features.  
**Duration:** 4 sprints.

**Deliverables:**
- AI assistant (chat-based interface)
- AI risk prediction model integration
- AI report generator with OpenAI API
- Prompt library in `/ai_engine/prompts/`
- Validation and sanity check layer
- Multi-language AI responses
- AI usage logging and monitoring

---

### **Phase 4 – Team & Organization Management**
**Goal:** Multi-tenant SaaS structure and RBAC.  
**Duration:** 3 sprints.

**Deliverables:**
- RBAC (User, PM, Admin)
- Organization accounts and branding
- Workspace creation per tenant
- Audit logs and activity tracking
- Dashboard metrics by organization
- Integration with Slack / Teams webhooks

---

### **Phase 5 – Agile & SAFe Module**
**Goal:** Agile and sprint management.  
**Duration:** 3 sprints.

**Deliverables:**
- Sprint board (Kanban + Scrum)
- Sprint planning and retrospective pages
- Velocity chart and burndown reports
- SAFe Program Increment overview
- Backlog automation with AI prioritization

---

### **Phase 6 – ITIL & Service Management**
**Goal:** Integrate ITIL4 modules (ITAM, ISAM, SLA, Incident, Change).  
**Duration:** 4 sprints.

**Deliverables:**
- Asset management dashboard (ITAM)
- Information Security Asset Management (ISAM)
- SLA monitor and reporting engine
- Incident & change ticketing with AI assistant
- Problem management workflows
- CMDB and auto-mapping
- AI-driven CSI recommendations
- Link ITIL tickets to projects

---

### **Phase 7 – Portfolio & Analytics**
**Goal:** Enterprise-wide PMO and service dashboards.  
**Duration:** 4 sprints.

**Deliverables:**
- Portfolio dashboard (overview of all projects)
- Predictive AI insights ("what-if" simulation)
- KPI heatmaps and trend analysis
- Financial tracking module
- Exportable PDF/Excel reports

---

### **Phase 8 – Enterprise SaaS Deployment**
**Goal:** Launch public multi-tenant SaaS version.  
**Duration:** 5 sprints.

**Deliverables:**
- User subscription system (Stripe/PayPal)
- Tenant isolation and billing
- Multi-language UI (EN/FR/ES/DE/NL)
- Public signup portal
- Docker production containers for Synology NAS
- HTTPS certificates (Let's Encrypt)
- Logging & monitoring dashboard

---

### **Phase 9 – Marketplace & Ecosystem**
**Goal:** Extend platform with add-ons and integrations.  
**Duration:** Continuous post-launch.

**Deliverables:**
- Plugin API for external AI models
- Template marketplace (WBS, Risk, Report packs)
- Integration SDK for third-party developers
- Analytics API for Power BI/Tableau

---

## 6. RELEASE TIMELINE (Estimated)

| Phase | Deliverables Focus | Target Date |
|--------|--------------------|-------------|
| 1 – MVP Baseline | AI Charter + Risk | ✅ **Dec 2025 (COMPLETE)** |
| 2 – Core PM | Tasks + Milestones | Feb 2026 |
| 3 – AI Enhancement | Chat + Reports | Apr 2026 |
| 4 – Team Mgmt | Multi-Tenant + RBAC | Jun 2026 |
| 5 – Agile Module | Scrum / SAFe | Aug 2026 |
| 6 – ITIL & Service Mgmt | ITAM + ISAM + SLA | Oct 2026 |
| 7 – Analytics | Portfolio Insights | Dec 2026 |
| 8 – Enterprise Release | Public SaaS | Mar 2027 |
| 9 – Marketplace | Add-ons / API | Continuous |

---

## 7. TECH FOUNDATION SUMMARY

| Component | Stack |
|------------|--------|
| Frontend | React + Tailwind + Vite |
| Backend | Node.js (Express) |
| AI Engine | Python FastAPI + LangChain + OpenAI GPT-4 |
| Database | MariaDB (Synology NAS) with SQLite fallback |
| Auth | JWT + RBAC |
| Hosting | Docker on Synology NAS |
| Monitoring | AI usage logs + Grafana optional |
| Frameworks | PMP, ITIL 4, Agile, SAFe |

---

## 8. IMMEDIATE NEXT ACTIONS

1. ✅ Phase 1 MVP complete - All deliverables done
2. ✅ Docker deployment ready
3. ✅ API documentation complete
4. ✅ OpenAI integration functional
5. **Next:** Begin Phase 2 - Core Project Management (Tasks, Milestones)
6. Prepare Phase 6 ITIL schema design (assets, SLAs, incidents)

---

## 9. FINAL VISION

PaxiPM AI unites **Project Management** and **Service Management** into a single AI-driven platform.  

It delivers predictive insights, automated compliance, and real-time project intelligence for IT infrastructure and software delivery projects, including hardware refresh cycles (PCs, tablets, phones, iPads), network transformations, and enterprise deployments.
