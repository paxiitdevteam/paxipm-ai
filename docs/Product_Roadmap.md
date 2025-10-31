# PaxiPM AI – SaaS Platform Roadmap

## 1. Project Overview

PaxiPM AI is an AI-driven Project Management SaaS platform specialized in IT Infrastructure and Software Development projects.  

It combines PMP, ITIL, Scrum, and SAFe practices with AI automation.

## 2. Objective

Deliver an enterprise-grade AI Project Management platform hosted on Synology NAS (MariaDB backend) with:

- AI automation for project setup, risk, and reporting.

- PMP + ITIL + Agile methodology alignment.

- Multi-tenant SaaS structure.

---

## 3. CURRENT STATUS (as of October 2025)

### ✅ Completed

| Area | Status | Details |
|------|---------|----------|
| GitHub Repo | ✅ | `paxiitdevteam/paxipm-ai` created |
| Project Architecture | ✅ | Folder and workflow structure defined |
| Documentation | ✅ | `MVP_Phase1_Spec.md` and `AI_Model_Design.md` created |
| Starter Code | ✅ | Backend Express, AI Engine FastAPI, Frontend React ready |
| Local Environment | ✅ | `.env` and environment setup complete |
| Database | ✅ | Switched to MariaDB; connection and sync tested |
| Testing | ⚙️ | Local API functional test with AI Engine integration |

---

## 4. DEVELOPMENT ROADMAP (PHASED RELEASE)

### **Phase 1 – MVP (Baseline Platform)**

**Goal:** Deliver minimal working SaaS with AI-generated project charter and risk reports.  

**Duration:** 3 sprints × 2 weeks.

**Deliverables**

- Working local stack (Frontend ↔ Backend ↔ AI Engine ↔ MariaDB).

- User registration/login (JWT).

- Project CRUD (create, view, delete).

- AI charter generation endpoint.

- Risk prediction endpoint (stub model).

- Dashboard page (Home.jsx).

- REST API documentation.

- Docker compose deployment.

**Status:** 70 % done (AI engine link + frontend integration remaining).

---

### **Phase 2 – Core Project Management**

**Goal:** Expand PM capabilities and persistence.  

**Duration:** 4 sprints.

**Deliverables**

- Task management (create, assign, track).  

- Milestone and Gantt view.  

- Risk and issue registers.  

- Resource management page.  

- File uploads per project.  

- Email/in-app notifications.  

- Frontend state management (Context API).  

- Database migration scripts.  

- Initial Docker containerization for NAS testing.

---

### **Phase 3 – AI Enhancement**

**Goal:** Embed real AI capabilities beyond static prompts.  

**Duration:** 4 sprints.

**Deliverables**

- AI assistant (chat-based interface).  

- AI risk prediction model integration.  

- AI report generator with OpenAI API.  

- Prompt library in `/ai_engine/prompts/`.  

- Validation and sanity check layer.  

- Multi-language AI responses.  

- AI usage logging and monitoring.

---

### **Phase 4 – Team & Organization Management**

**Goal:** Enable multi-user, multi-tenant operation.  

**Duration:** 3 sprints.

**Deliverables**

- RBAC (User, PM, Admin).  

- Organization accounts and branding.  

- Workspace creation per tenant.  

- Audit logs and activity tracking.  

- Dashboard metrics by organization.  

- Integration with Slack / Teams webhooks.

---

### **Phase 5 – Agile & SAFe Module**

**Goal:** Deliver Agile boards and iterative workflow support.  

**Duration:** 3 sprints.

**Deliverables**

- Sprint board (Kanban + Scrum).  

- Sprint planning and retrospective pages.  

- Velocity chart and burndown reports.  

- SAFe Program Increment overview.  

- Backlog automation with AI prioritization.

---

### **Phase 6 – ITIL Service Management**

**Goal:** Integrate operations and service delivery modules.  

**Duration:** 4 sprints.

**Deliverables**

- Incident, Problem, Change modules.  

- SLA tracking and escalation rules.  

- AI service insight reports.  

- Link ITIL tickets to projects.

---

### **Phase 7 – Portfolio & Analytics**

**Goal:** Provide PMO and executive-level analytics.  

**Duration:** 4 sprints.

**Deliverables**

- Portfolio dashboard (overview of all projects).  

- Predictive AI insights ("what-if" simulation).  

- KPI heatmaps and trend analysis.  

- Financial tracking module.  

- Exportable PDF/Excel reports.

---

### **Phase 8 – Enterprise SaaS Deployment**

**Goal:** Launch public multi-tenant SaaS version.  

**Duration:** 5 sprints.

**Deliverables**

- User subscription system (Stripe/PayPal).  

- Tenant isolation and billing.  

- Multi-language UI (EN/FR/ES/DE/NL).  

- Public signup portal.  

- Docker production containers for Synology NAS.  

- HTTPS certificates (Let's Encrypt).  

- Logging & monitoring dashboard.

---

### **Phase 9 – Marketplace & Ecosystem**

**Goal:** Extend platform with add-ons and integrations.  

**Duration:** Continuous post-launch.

**Deliverables**

- Plugin API for external AI models.  

- Template marketplace (WBS, Risk, Report packs).  

- Integration SDK for third-party developers.  

- Analytics API for Power BI/Tableau.

---

## 5. RELEASE TIMELINE (Estimated)

| Phase | Deliverables Focus | Target Date |
|--------|--------------------|-------------|
| 1 – MVP Baseline | AI Charter + Risk | Dec 2025 |
| 2 – Core PM | Tasks + Milestones | Feb 2026 |
| 3 – AI Enhancement | Chat Assistant + Reports | Apr 2026 |
| 4 – Team Mgmt | Multi-Tenant + RBAC | Jun 2026 |
| 5 – Agile Module | Scrum / SAFe | Aug 2026 |
| 6 – ITIL | Ops Integration | Oct 2026 |
| 7 – Analytics | Portfolio Insights | Dec 2026 |
| 8 – Enterprise Release | Public SaaS | Mar 2027 |
| 9 – Marketplace | Add-ons / API | Continuous |

---

## 6. TECH FOUNDATION SUMMARY

| Component | Stack |
|------------|--------|
| Frontend | React + Tailwind + Vite |
| Backend | Node.js (Express) |
| AI Engine | Python FastAPI + LangChain + OpenAI GPT-5 |
| Database | MariaDB (Synology NAS) |
| Auth | JWT + RBAC |
| Hosting | Docker on Synology NAS |
| Monitoring | AI usage logs + Grafana optional |

---

## 7. IMMEDIATE NEXT ACTIONS

1. Validate local AI Engine ↔ Backend connection (working).  

2. Create User model and Auth routes (JWT).  

3. Add Project CRUD API with MariaDB models.  

4. Connect Frontend Dashboard to Project API.  

5. Dockerize backend and AI engine for NAS testing.  

6. Prepare Phase 1 demo video or screen record.

---

## 8. FINAL VISION

PaxiPM AI becomes the **AI Project Management Intelligence Hub** for IT and software projects.  

It will deliver predictive analytics, automated reporting, and compliance-aligned governance using AI to assist real project managers worldwide.

