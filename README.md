# 🏥 QuantumShield IDWAS
## Inter-Department Workflow Automation System for Hospitals

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-cyan?style=for-the-badge)
![Status](https://img.shields.io/badge/status-live-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/hackathon-ready-gold?style=for-the-badge)

**An AI-powered, real-time hospital workflow automation platform that routes patient requests across departments, predicts bottlenecks, and ensures zero delays in critical care.**

[Live Demo](#-demo-flow) · [System Architecture](#-system-architecture) · [Setup Guide](#-installation--setup) · [API Docs](#-api-reference)

</div>

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Solution](#-solution)
4. [Key Features](#-key-features)
5. [Advanced Features](#-advanced-features)
6. [System Architecture](#-system-architecture)
7. [Tech Stack](#-tech-stack)
8. [Database Design](#-database-design)
9. [API Reference](#-api-reference)
10. [Installation & Setup](#-installation--setup)
11. [Demo Flow](#-demo-flow)
12. [AI / LLM Integration](#-ai--llm-integration)
13. [Folder Structure](#-folder-structure)
14. [Team](#-team)

---

## 🏥 Project Overview

**QuantumShield IDWAS** is a full-stack, AI-augmented hospital management platform that eliminates the chaos of manual inter-department coordination. Built with a microservices-inspired React frontend and a Node.js/Express backend, it provides:

- **Automated routing** of patient tasks to the correct department
- **Real-time Kanban** tracking across 8 hospital departments
- **AI-powered workload prediction** using an integrated LLM
- **Blockchain-inspired audit trails** for every action
- **Priority escalation** with SLA enforcement
- **Role-based access** for Doctors, Nurses, and Admins

---

## 🚨 Problem Statement

Hospitals process thousands of patient service requests daily. Without automation:

| Problem | Impact |
|---|---|
| Manual handoffs between departments | 30–45 min delays per patient |
| No real-time status visibility | Staff must call/walk to check status |
| No priority enforcement | Critical patients wait alongside routine cases |
| No audit trail | Compliance failures, liability exposure |
| No bottleneck detection | Departments silently overload |
| No workload prediction | Understaffing during peak hours |

> Studies show manual coordination errors contribute to **~250,000 preventable deaths per year** in the US alone (Johns Hopkins, 2016).

---

## ✅ Solution

QuantumShield IDWAS provides a **single unified platform** that:

1. **Ingests** patient requests at Reception
2. **Routes** them automatically based on request type + priority
3. **Tracks** progress in real time across all departments
4. **Escalates** overdue or critical cases automatically
5. **Notifies** staff instantly via in-app alerts
6. **Logs** every action immutably for compliance
7. **Predicts** future workloads using AI to pre-assign resources

---

## ⚡ Key Features

### 1. 🔀 Automated Request Routing Engine
- Rule-based routing: `Request Type → Department → Sub-queue`
- 5 built-in workflow templates: Emergency Trauma, Diagnostic Workup, Elective Surgery, Medication Review, Fast Track
- Custom workflow builder for hospital-specific pathways
- Department path: `ER → Triage → Lab → Radiology → ICU → Surgery → Pharmacy → Discharge`

### 2. 📋 Real-Time Kanban Pipeline Board
- 8 department columns, live-updating
- Patient cards with priority color coding
- Drag-and-drop transfer between departments
- SLA countdown timers per card

### 3. ⚠️ Priority-Based Task Management
| Priority | SLA Time | Color |
|---|---|---|
| 🔴 Critical | 15 minutes | Red pulsing |
| 🟠 High | 60 minutes | Orange |
| 🟡 Medium | 240 minutes | Yellow |
| 🟢 Low | 480 minutes | Green |

### 4. 🔔 Notification & Escalation System
- Auto-escalates requests that breach SLA thresholds
- In-app banner alerts for Critical escalations
- Department-specific notification feeds
- Email/SMS hooks (configurable)

### 5. 📊 Analytics Dashboard
- Department workload bar charts
- Workflow type breakdown pie chart
- Bottleneck detection algorithm
- Average processing time per department
- Completion rate and throughput metrics

### 6. 🕒 Full Audit Timeline
- Every transfer, note, escalation is immutably logged
- Actor + timestamp + action on every entry
- Blockchain-hash chaining for tamper detection
- Export to CSV/PDF for compliance

---

## 🚀 Advanced Features

### 🤖 AI-Powered Workload Prediction (LLM Integration)
- Trained on historical request volume data
- Predicts peak hours per department
- Suggests pre-routing and resource allocation
- Natural language query interface: *"Which department will be overloaded tomorrow at 2 PM?"*
- Powered by `Claude claude-sonnet-4-20250514` via Anthropic API

### 🔐 Role-Based Access Control (RBAC)
| Role | Permissions |
|---|---|
| Admin | Full access: create, transfer, escalate, cancel, view analytics |
| Doctor | View assigned workflows, transfer, add notes |
| Nurse | View assigned, update status, add notes |
| Patient | View own request status via Patient Portal |

### 🔗 Blockchain Audit Trail
- Each audit entry is SHA-256 hashed
- Previous hash is included in next entry (chain)
- Any tampering breaks the chain and is detected
- Satisfies HIPAA audit log requirements

### 🧬 Patient Portal
- Patients receive a secure token at registration
- Real-time status updates on their own request
- Estimated wait time display
- Notification when department changes

### 📄 Automated Report Generation
- Daily/weekly department performance reports
- Auto-exported as PDF or Excel
- Scheduled via cron jobs
- Admin-configurable report templates

### 🛡️ Data Security
- JWT authentication on all API endpoints
- AES-256 encryption for patient data at rest
- HTTPS enforced (TLS 1.3)
- Input sanitization on all forms
- Rate limiting: 100 req/min per IP

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  React SPA (Vite) │ LandingPage │ AuthPage │ Dashboard   │
│  WorkflowDash │ Analytics │ PatientPortal               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  API GATEWAY (Express.js)                │
│  Auth Middleware │ Rate Limiter │ Request Logger          │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
   │      │      │      │      │      │      │
┌──▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──────────┐
│Auth │ │Work│ │Dept│ │Noti│ │Anal│ │Audi│ │ AI/LLM     │
│Svc  │ │flow│ │Svc │ │fy  │ │ytic│ │t   │ │ Service    │
│     │ │Svc │ │    │ │Svc │ │Svc │ │Svc │ │(Anthropic) │
└──┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─────┬──────┘
   └───────┴──────┴──────┴──────┴──────┴──────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              DATA LAYER                                  │
│  MongoDB Atlas (Primary) │ Redis Cache │ localStorage    │
└─────────────────────────────────────────────────────────┘
```

### Microservices Breakdown

| Service | Port | Responsibility |
|---|---|---|
| Auth Service | 4001 | JWT login, registration, RBAC |
| Workflow Service | 4002 | Create, route, transfer, escalate workflows |
| Department Service | 4003 | Department state, capacity, staff |
| Notification Service | 4004 | In-app alerts, email/SMS triggers |
| Analytics Service | 4005 | Metrics aggregation, reporting |
| Audit Service | 4006 | Immutable log chaining |
| AI Service | 4007 | LLM queries, workload prediction |
| API Gateway | 5000 | Central routing, auth middleware |

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | SPA framework and build tool |
| Tailwind CSS | Utility-first styling |
| Recharts | Analytics charts |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Socket.IO Client | Real-time updates |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20 | Runtime |
| Express.js | REST API framework |
| Socket.IO | WebSocket real-time communication |
| Mongoose | MongoDB ODM |
| JWT | Stateless authentication |
| bcrypt | Password hashing |
| node-cron | Scheduled report generation |
| Winston | Logging |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Primary data store |
| Redis | Session cache, real-time counters |
| localStorage | Client-side workflow state (demo mode) |

### AI / LLM
| Technology | Purpose |
|---|---|
| Anthropic Claude API | Workload prediction, natural language queries |
| Custom prompt templates | Structured JSON responses for UI |
| In-context learning | Hospital-specific domain adaptation |

---

## 🗃 Database Design

### `workflows` Collection
```json
{
  "_id": "ObjectId",
  "workflowId": "WF-2024-0001",
  "patientName": "James Carter",
  "patientAge": 45,
  "chiefComplaint": "Chest pain, shortness of breath",
  "template": "emergency_trauma",
  "priority": "critical",
  "status": "active",
  "currentDepartment": "radiology",
  "departmentPath": ["er", "triage", "lab", "radiology", "icu", "surgery"],
  "currentStep": 3,
  "assignedTo": "Dr. Sarah Chen",
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-15T09:15:00Z",
  "slaDeadline": "2024-01-15T08:45:00Z",
  "escalated": true,
  "escalationReason": "Suspected STEMI",
  "auditTrail": [ ... ],
  "notes": [ ... ]
}
```

### `departments` Collection
```json
{
  "_id": "ObjectId",
  "departmentId": "dept_lab",
  "name": "Laboratory",
  "code": "lab",
  "capacity": 20,
  "currentLoad": 12,
  "staff": ["user_001", "user_002"],
  "avgProcessingTime": 45,
  "isOverloaded": false
}
```

### `users` Collection
```json
{
  "_id": "ObjectId",
  "userId": "user_001",
  "name": "Dr. Sarah Chen",
  "email": "doctor@qs.com",
  "passwordHash": "$2b$10$...",
  "role": "doctor",
  "department": "dept_lab",
  "permissions": ["view_workflow", "transfer", "add_note", "escalate"],
  "isActive": true,
  "lastLogin": "2024-01-15T08:00:00Z"
}
```

### `audit_logs` Collection
```json
{
  "_id": "ObjectId",
  "workflowId": "WF-2024-0001",
  "action": "TRANSFER",
  "fromDept": "lab",
  "toDept": "radiology",
  "actor": "Dr. Sarah Chen",
  "actorId": "user_001",
  "note": "CT scan ordered for chest",
  "timestamp": "2024-01-15T09:10:00Z",
  "hash": "sha256:a3f4b8c2...",
  "prevHash": "sha256:1e2d3c4b..."
}
```

---

## 🔌 API Reference

### Authentication
```
POST   /api/auth/login          → { token, user }
POST   /api/auth/register       → { token, user }
POST   /api/auth/logout         → { success }
GET    /api/auth/me             → { user }
```

### Workflows
```
GET    /api/workflows           → [ ...workflows ]
GET    /api/workflows/:id       → { workflow }
POST   /api/workflows           → { workflow }         Create new
PUT    /api/workflows/:id/transfer → { workflow }      Move to next dept
PUT    /api/workflows/:id/escalate → { workflow }      Escalate priority
PUT    /api/workflows/:id/cancel   → { workflow }      Cancel workflow
POST   /api/workflows/:id/notes    → { workflow }      Add note
```

### Departments
```
GET    /api/departments         → [ ...departments ]
GET    /api/departments/:id/load → { load, capacity }
```

### Analytics
```
GET    /api/analytics/overview  → { stats }
GET    /api/analytics/bottlenecks → [ ...depts ]
GET    /api/analytics/throughput  → { hourly, daily }
```

### AI Assistant
```
POST   /api/ai/predict          → { prediction }
POST   /api/ai/query            → { response }         Natural language
GET    /api/ai/recommendations  → [ ...actions ]
```

---

## 🛠 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Anthropic API Key (for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/your-team/quantumshield-idwas.git
cd quantumshield-idwas
```

### 2. Install All Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Configure Environment Variables

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/idwas
JWT_SECRET=your-super-secret-jwt-key-change-this
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Seed Demo Data
```bash
cd backend
npm run seed
```

### 5. Start the Application
```bash
# From project root — starts both frontend and backend
npm run dev
```

Or separately:
```bash
# Terminal 1 — Backend
cd backend && npm run dev       # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev      # Runs on http://localhost:5173
```

### 6. Login Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@qs.com | Admin@123 |
| Doctor | doctor@qs.com | Doctor@123 |
| Nurse | nurse@qs.com | Nurse@123 |

---

## 🎬 Demo Flow

### For Hackathon Judges — 2 Minute Demo Script

**Step 1 — Landing Page** (15 sec)
> Open the app. Show the animated hero section with live workflow card for *James Carter*. Point out the stats bar: 10,000 daily requests, 95% SLA compliance.

**Step 2 — Login as Admin** (10 sec)
> Click LOGIN → use admin@qs.com / Admin@123

**Step 3 — Pipeline Board** (30 sec)
> Navigate to 🔀 Workflow Router. Show all 8 department columns. Point to *James Carter* (Critical, pulsing red) in Radiology. Click his card to open the detail modal. Show the full audit trail.

**Step 4 — Transfer a Patient** (20 sec)
> Add a note: *"CT confirmed STEMI, escalating to ICU"*. Click TRANSFER. Watch the card move to ICU column in real time.

**Step 5 — Create a New Workflow** (20 sec)
> Click ⊕ NEW WORKFLOW. Fill in patient: *"Maria Santos, 67, Cardiac Arrest"*. Select Emergency Trauma template. Set Critical priority. Click INITIATE — card appears instantly on the board.

**Step 6 — Analytics** (15 sec)
> Switch to 📈 Analytics. Show bottleneck detection flagging Lab as overloaded. Show completion rate and average time charts.

**Step 7 — AI Assistant** (10 sec)
> Ask the AI: *"Which department will be overwhelmed in 2 hours?"* — AI responds with prediction and suggests pre-routing.

---

## 🤖 AI / LLM Integration

The AI service is powered by **Anthropic's Claude claude-sonnet-4-20250514** model and provides three capabilities:

### 1. Workload Prediction
```javascript
// Example API call to AI service
const prediction = await fetch('/api/ai/predict', {
  method: 'POST',
  body: JSON.stringify({
    historicalData: deptLoadHistory,
    currentLoad: currentDeptLoads,
    timeHorizon: '2h'
  })
});
// Returns: { department: 'lab', predictedLoad: 95, confidence: 0.87, recommendation: 'Pre-route routine tests to afternoon' }
```

### 2. Natural Language Workflow Queries
Staff can type plain-English questions:
- *"Show me all critical patients waiting more than 30 minutes"*
- *"Which nurse has the highest workload right now?"*
- *"Summarize today's ER performance"*

### 3. Smart Routing Suggestions
When a new workflow is created, the AI analyzes current department loads and suggests the optimal pathway, potentially bypassing overloaded departments.

### Prompt Architecture
```
System: You are a hospital workflow optimization AI. You have access to real-time 
        department load data, historical patterns, and current active workflows. 
        Always respond in structured JSON. Be concise. Patient safety is priority 1.

User:   {current_department_loads} {historical_patterns} {query}
