# Phase 2 Implementation Plan & Tracking

## Overview
**Goal:** Expand project control with tasks, milestones, resources, and budget management.  
**Duration:** 4 sprints  
**Status:** 🟡 In Progress

---

## Phase 2 Deliverables Checklist

### ✅ **Completed**
- [x] Project UPDATE endpoint (PATCH `/api/projects/:id`)
- [x] Project DELETE endpoint (DELETE `/api/projects/:id`)
- [x] Task Management Backend (CRUD routes)

### 🔄 **In Progress**
- [ ] Task Management Frontend (UI components)
- [ ] Budget UI Components

### ⏳ **Pending**
- [ ] Milestone Management (Backend + Frontend)
- [ ] Gantt View Component
- [ ] Risk and Issue Registers
- [ ] Resource Management Page
- [ ] File Uploads per Project
- [ ] Email/In-App Notifications
- [ ] Currency Selector UI Component
- [ ] Frontend State Management (Context API)
- [ ] Database Migration Scripts
- [ ] Initial Docker Containerization for NAS Testing

---

## Recommended Implementation Order

### **Phase 2.1: Foundation (Week 1)**
**Priority:** Core functionality that other features depend on

1. ✅ **Task Management Backend** - COMPLETE
   - ✅ Task CRUD routes
   - ✅ Database schema ready
   - ✅ API endpoints documented

2. **Task Management Frontend** - IN PROGRESS
   - Task list component
   - Task create/edit forms
   - Task progress tracking UI
   - Task filtering and sorting

3. **Frontend State Management (Context API)**
   - Create ProjectContext for project state
   - Create TaskContext for task state
   - Create AuthContext (if not exists)
   - State management for budget, currency

---

### **Phase 2.2: Budget & Currency (Week 2)**
**Priority:** High-value feature already in database

4. **Budget UI Components**
   - Budget display cards
   - Budget input forms
   - Budget health indicators
   - Budget utilization charts
   - Budget vs. Actual comparison

5. **Currency Selector UI Component**
   - Currency dropdown component
   - Currency conversion display (if needed)
   - Multi-currency project list
   - Currency formatting utilities

---

### **Phase 2.3: Project Visualization (Week 3)**
**Priority:** Visual management tools

6. **Gantt View Component**
   - Install Gantt chart library (e.g., gantt-task-react, dhtmlx-gantt)
   - Gantt view page/component
   - Timeline visualization
   - Task dependencies display
   - Drag-and-drop task scheduling

7. **Milestone Management**
   - Milestone database schema
   - Milestone backend routes
   - Milestone UI components
   - Milestone timeline view
   - Milestone tracking and alerts

8. **Risk and Issue Registers**
   - Risk register database schema
   - Risk register routes
   - Issue register database schema
   - Issue register routes
   - Risk/Issue UI components
   - Risk/Issue dashboard views

---

### **Phase 2.4: File Management & Notifications (Week 4)**
**Priority:** Additional project management features

9. **File Uploads per Project**
   - File upload backend route
   - File storage setup (local or cloud)
   - File upload UI component
   - File list and download
   - File management (rename, delete)
   - File type validation and size limits

10. **Email/In-App Notifications**
    - Notification database schema
    - Notification backend routes
    - Email service integration (SendGrid/Nodemailer)
    - In-app notification component
    - Notification preferences
    - Notification triggers (task due, milestone reached, etc.)

11. **Resource Management Page**
    - Resource database schema
    - Resource routes
    - Resource allocation UI
    - Resource workload tracking
    - Resource availability calendar

---

### **Phase 2.5: Infrastructure & Testing (Week 4)**
**Priority:** DevOps and quality assurance

12. **Database Migration Scripts**
    - Migration for milestones table
    - Migration for risks/issues tables
    - Migration for files table
    - Migration for notifications table
    - Migration for resources table
    - Migration runner script

13. **Initial Docker Containerization for NAS Testing**
    - Update docker-compose.yml with new services
    - File storage volume setup
    - Environment variable configuration
    - Health checks for all services
    - Docker networking verification

---

## Detailed Feature Specifications

### **1. Task Management Frontend**

#### Components Needed:
- `TaskList.jsx` - Display tasks for a project
- `TaskCard.jsx` - Individual task display
- `TaskForm.jsx` - Create/edit task form
- `TaskProgressBar.jsx` - Progress visualization
- `TaskFilter.jsx` - Filter by owner, status, due date

#### API Integration:
- `GET /api/tasks/project/:projectId` - Fetch tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Features:
- Task status indicators (Not Started, In Progress, Completed)
- Due date warnings (overdue, due soon)
- Progress percentage display
- Owner assignment
- Task sorting and filtering

---

### **2. Budget UI Components**

#### Components Needed:
- `BudgetCard.jsx` - Budget overview card
- `BudgetForm.jsx` - Set/update budget
- `BudgetHealthIndicator.jsx` - On/Over/Under budget indicator
- `BudgetChart.jsx` - Budget utilization chart
- `BudgetComparison.jsx` - Budgeted vs. Actual

#### Features:
- Budget amount input with currency selection
- Spent amount tracking
- Remaining budget calculation
- Budget utilization percentage
- Budget health alerts (over budget warnings)
- Budget trend visualization

---

### **3. Currency Selector UI Component**

#### Components Needed:
- `CurrencySelector.jsx` - Currency dropdown
- `CurrencyFormatter.jsx` - Format amounts by currency
- `CurrencyConverter.jsx` - Multi-currency display (optional)

#### Features:
- 100+ currency support
- Currency symbols (€, $, £, ¥, etc.)
- Currency code display (USD, EUR, GBP, etc.)
- Project-level currency selection
- Currency formatting utilities
- Multi-currency project list view

---

### **4. Gantt View Component**

#### Libraries to Consider:
- `gantt-task-react` - React Gantt chart library
- `dhtmlx-gantt` - Full-featured Gantt library
- `react-gantt-chart` - Simple React Gantt component
- Custom implementation with D3.js

#### Components Needed:
- `GanttView.jsx` - Main Gantt view component
- `GanttTask.jsx` - Individual task bar
- `GanttTimeline.jsx` - Timeline header

#### Features:
- Timeline visualization (weeks, months, quarters)
- Task bars with duration
- Task dependencies (if implemented)
- Drag-and-drop rescheduling
- Milestone markers
- Zoom in/out functionality
- Export Gantt chart (PNG, PDF)

---

### **5. Milestone Management**

#### Database Schema:
```sql
CREATE TABLE milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### Components Needed:
- `MilestoneList.jsx` - Milestone list view
- `MilestoneCard.jsx` - Individual milestone card
- `MilestoneForm.jsx` - Create/edit milestone
- `MilestoneTimeline.jsx` - Milestone timeline view

#### API Routes:
- `GET /api/milestones/project/:projectId` - List milestones
- `POST /api/milestones` - Create milestone
- `PATCH /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone

#### Features:
- Milestone status tracking (Pending, In Progress, Completed, Missed)
- Milestone due date alerts
- Milestone completion tracking
- Milestone timeline view
- Milestone dependencies (optional)

---

### **6. Risk and Issue Registers**

#### Database Schema:
```sql
CREATE TABLE risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    probability VARCHAR(50),
    impact VARCHAR(50),
    risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
    status VARCHAR(50) DEFAULT 'Open',
    mitigation_plan TEXT,
    owner VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Open',
    resolution TEXT,
    owner VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### Components Needed:
- `RiskRegister.jsx` - Risk list view
- `RiskCard.jsx` - Individual risk card
- `RiskForm.jsx` - Create/edit risk
- `IssueRegister.jsx` - Issue list view
- `IssueCard.jsx` - Individual issue card
- `IssueForm.jsx` - Create/edit issue

---

### **7. File Uploads**

#### Backend Setup:
- Install `multer` for file uploads
- Create `uploads/` directory structure
- File storage configuration (local or cloud)

#### Database Schema:
```sql
CREATE TABLE project_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

#### Components Needed:
- `FileUpload.jsx` - File upload component
- `FileList.jsx` - File list display
- `FileCard.jsx` - Individual file card
- `FilePreview.jsx` - File preview modal

#### Features:
- Drag-and-drop file upload
- File type validation
- File size limits
- File download
- File deletion
- File preview (images, PDFs)

---

### **8. Email/In-App Notifications**

#### Database Schema:
```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    project_id INT,
    type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### Backend Setup:
- Install `nodemailer` or integrate SendGrid
- Email service configuration
- Notification triggers (task due, milestone reached, etc.)

#### Components Needed:
- `NotificationBell.jsx` - Notification icon with badge
- `NotificationDropdown.jsx` - Notification list dropdown
- `NotificationItem.jsx` - Individual notification
- `NotificationSettings.jsx` - User notification preferences

#### Features:
- In-app notification center
- Email notifications (optional)
- Notification types: Task due, Milestone reached, Risk alert, Issue reported
- Notification preferences (on/off per type)
- Mark as read functionality
- Notification history

---

### **9. Resource Management**

#### Database Schema:
```sql
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    allocation_percent INT CHECK (allocation_percent >= 0 AND allocation_percent <= 100),
    start_date DATE,
    end_date DATE,
    hourly_rate DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

#### Components Needed:
- `ResourceList.jsx` - Resource list view
- `ResourceCard.jsx` - Individual resource card
- `ResourceForm.jsx` - Add/edit resource
- `ResourceAllocation.jsx` - Allocation visualization
- `ResourceWorkload.jsx` - Workload calendar

---

## Implementation Tracking

### Week 1 Progress:
- [x] Task Management Backend ✅
- [ ] Task Management Frontend
- [ ] Frontend State Management

### Week 2 Progress:
- [ ] Budget UI Components
- [ ] Currency Selector UI

### Week 3 Progress:
- [ ] Gantt View Component
- [ ] Milestone Management
- [ ] Risk and Issue Registers

### Week 4 Progress:
- [ ] File Uploads
- [ ] Email/In-App Notifications
- [ ] Resource Management
- [ ] Database Migrations
- [ ] Docker Containerization

---

## Testing Checklist

### Backend Testing:
- [ ] Task CRUD endpoints
- [ ] Milestone CRUD endpoints
- [ ] Risk/Issue CRUD endpoints
- [ ] File upload endpoints
- [ ] Notification endpoints
- [ ] Resource endpoints

### Frontend Testing:
- [ ] Task management UI
- [ ] Budget UI
- [ ] Currency selector
- [ ] Gantt view
- [ ] Milestone management
- [ ] Risk/Issue registers
- [ ] File upload UI
- [ ] Notifications UI

### Integration Testing:
- [ ] Task creation updates project progress
- [ ] Milestone completion triggers notifications
- [ ] Budget alerts on over-budget
- [ ] File upload associates with project
- [ ] Gantt view reflects task dates

---

## Success Criteria

Phase 2 is complete when:
1. ✅ All backend routes implemented and documented
2. ✅ All frontend components created and integrated
3. ✅ Database migrations tested and applied
4. ✅ All features tested (unit + integration)
5. ✅ Docker setup working for NAS deployment
6. ✅ Documentation updated (API docs, user guides)

---

## Notes & Considerations

- **State Management**: Consider Redux or Zustand if Context API becomes too complex
- **File Storage**: Decide on local storage vs. cloud (S3, Azure Blob) early
- **Gantt Library**: Choose lightweight option to keep bundle size small
- **Notifications**: Start with in-app only, add email as Phase 2.5 enhancement
- **Currency**: Real-time exchange rates can be Phase 3 feature
- **Dependencies**: Task dependencies can be simplified for Phase 2, full CPM in Phase 3

