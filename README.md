# AIVOA — AI-Powered Customer Complaint Management System

> **Pharmaceutical API & FDF Quality Assurance Module**  
> Powered by Groq LLMs · LangGraph · FastAPI · React · Redux · PostgreSQL (Supabase)

---

## Overview

AIVOA is a production-quality intelligent QMS complaint module for pharmaceutical manufacturers. Users interact through a conversational AI Copilot that automatically extracts, structures, and maintains complaint records — no manual form filling required.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      React Frontend                     │
│  ┌────────────────────┐  ┌──────────────────────────┐   │
│  │   Complaint Form   │  │   AI Complaint Assistant │   │
│  │  (auto-populated)  │  │  (ChatGPT-style chat UI) │   │
│  └────────────────────┘  └──────────────────────────┘   │
│         Redux Store (complaintSlice + chatSlice)        │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP POST (JSON)
┌─────────────────────▼───────────────────────────────────┐
│                   FastAPI Backend                       │
│  POST /api/chat/message  POST /api/documents/extract    │
│  GET/POST/PUT/DELETE /api/complaints/                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│               LangGraph Agent Graph                     │
│                                                         │
│  router ──┬──► intake_node  ──┐                         │
│           ├──► edit_node    ──┤                         │
│           ├──► document_node ─┤──► risk_assessment      │
│           └──► question_node ─────────────────► END     │
│                                    │                    │
│                               completeness              │
│                                    │                    │
│                             duplicate_check             │
│                                    │                    │
│                           root_cause_capa ──► END       │
└─────────────────────┬───────────────────────────────────┘
          ┌───────────┴──────────┐
    ┌─────▼─────┐         ┌──────▼──────┐
    │   Groq    │         │  Supabase   │
    │ gemma2-9b │         │ PostgreSQL  │
    │ llama-70b │         └─────────────┘
    └───────────┘
```

### LLM Strategy

| Task | Model |
|---|---|
| Intent routing | `gemma2-9b-it` (fast, simple) |
| Complaint intake | `llama-3.3-70b-versatile` (accurate JSON extraction) |
| Field editing | `llama-3.3-70b-versatile` |
| Document extraction | `llama-3.3-70b-versatile` (128K context) |
| Risk assessment | `llama-3.3-70b-versatile` (deep reasoning) |
| CAPA & Root Cause | `llama-3.3-70b-versatile` |
| Q&A explanations | `llama-3.3-70b-versatile` |

---

## Project Structure

```
AIVOA Task/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI entry point
│   │   ├── config.py            ← Settings (reads .env)
│   │   ├── database.py          ← SQLAlchemy engine
│   │   ├── models/complaint.py  ← ORM model
│   │   ├── schemas/complaint.py ← Pydantic schemas
│   │   ├── api/
│   │   │   ├── chat.py          ← POST /api/chat/message
│   │   │   ├── complaints.py    ← CRUD endpoints
│   │   │   └── documents.py     ← POST /api/documents/extract
│   │   └── agents/
│   │       ├── graph.py         ← LangGraph StateGraph
│   │       ├── state.py         ← AgentState TypedDict
│   │       ├── prompts.py       ← All LLM prompts
│   │       └── nodes/           ← Node implementations
│   ├── seed_data.py             ← Sample complaints seeder
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/store.js
│   │   ├── features/
│   │   │   ├── complaint/complaintSlice.js
│   │   │   └── chat/chatSlice.js
│   │   ├── services/api.js
│   │   ├── components/
│   │   │   ├── layout/          ← Header, SplitLayout
│   │   │   ├── form/            ← ComplaintForm + fields
│   │   │   ├── assistant/       ← AIPanel, Chat, Upload
│   │   │   └── panels/          ← Completeness, Risk, etc.
│   │   ├── pages/Dashboard.jsx
│   │   └── styles/index.css
│   └── vite.config.js           ← Proxies /api → :8000
│
└── README.md
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **Supabase account** (free tier works)
- **Groq API key** ([console.groq.com](https://console.groq.com))

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sidhanth-Mandal/Pharma-AI-Complaint-Management.git
cd Pharma-AI-Complaint-Management
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy the Connection String (URI format)
3. The URL format is: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
```

Edit `.env` and fill in your credentials:

```env
GROQ_API_KEY=gsk_your_actual_groq_key_here
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Initialize Database & Seed Data

```bash
# Tables are auto-created on first startup via SQLAlchemy
# But run seed data to populate sample complaints for duplicate detection demo:
python seed_data.py
```

### 5. Start Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Backend API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 6. Frontend Setup

```bash
cd ../frontend

npm install
npm run dev
```

Frontend available at: [http://localhost:5173](http://localhost:5173)

---

## Usage Guide

### Basic Complaint Intake

Simply type a description in the AI chat:

> *"Apollo Pharmacy reported discolored capsules in Amoxicillin 500mg, batch number BMX240602, approximately 48 capsules affected."*

The AI will:
- Extract all identifiable fields
- Populate the form automatically (with flash animation)
- Generate a risk assessment
- Suggest root causes and CAPA actions
- Check for similar historical complaints

### Editing a Field

> *"Actually the batch number is AMX240602, not BMX240602"*
> *"Change the customer name to City Hospital Pharmacy"*
> *"The quantity affected was 72 capsules, not 48"*

Only the mentioned field changes. All others are preserved.

### Document Upload

1. Drag & drop a PDF, DOCX, TXT, or EML file into the upload zone
2. Watch the extraction progress bar
3. The AI extracts all complaint information and populates the form
4. Continue chatting to refine or correct details

### Paste Complaint Email

1. Click "Paste Complaint Text / Email"
2. Paste the email content
3. Click Send — the AI processes it as a document

### Asking Questions

> *"Why is the severity classified as Major?"*
> *"What regulations apply to this type of complaint?"*
> *"Summarize this complaint for me"*

### Saving

Click **Save Complaint** to persist the complaint to Supabase. The badge in the header changes to "Saved" and shows the complaint ID.

---

## API Reference

### `POST /api/chat/message`

**Request:**
```json
{
  "thread_id": "uuid-string",
  "message": "Apollo Pharmacy reported discolored capsules...",
  "current_fields": {},
  "existing_complaints": []
}
```

**Response:**
```json
{
  "message": "I've extracted the following complaint details...",
  "form_update": {
    "customer_name": "Apollo Pharmacy",
    "product_name": "Amoxicillin Capsules",
    "product_strength": "500 mg",
    "complaint_type": "Physical",
    "description": "Discolored capsules reported",
    "severity": "Major",
    "priority": "High"
  },
  "assessment": {
    "severity": "Major",
    "priority": "High",
    "confidence": 0.87,
    "patient_impact": "Potential quality concern",
    "suggested_action": "Route to QA Investigation"
  },
  "completeness": { "score": 38, "missing": ["Batch/Lot Number", "..."] },
  "duplicates": [],
  "root_causes": [{"cause": "Manufacturing deviation", "confidence": 0.75, "explanation": "..."}],
  "capa_actions": ["Inspect retained samples", "Review batch records"],
  "timeline_event": "AI extracted complaint: Amoxicillin 500mg discoloration"
}
```

### `POST /api/documents/extract`

Multipart form: `file`, `thread_id`, `current_fields` (JSON string), `existing_complaints` (JSON string)

### `GET /api/complaints/`
### `POST /api/complaints/`
### `GET /api/complaints/{id}`
### `PUT /api/complaints/{id}`
### `DELETE /api/complaints/{id}`

---

## Features Implemented

| Feature | Status |
|---|---|
| Conversational complaint intake | ✅ |
| Auto-populating form | ✅ |
| Conversational field editing | ✅ |
| PDF / DOCX / TXT / EML upload | ✅ |
| Risk assessment (Severity, Priority) | ✅ |
| Complaint completeness tracker | ✅ (Bonus) |
| Duplicate complaint detection | ✅ (Bonus) |
| Root cause recommendations | ✅ (Bonus) |
| CAPA recommendations | ✅ (Bonus) |
| AI reasoning explanations | ✅ |
| Complaint timeline audit log | ✅ |
| Save to PostgreSQL (Supabase) | ✅ |
| 5 sample complaints seeded | ✅ |
| Smart follow-up questions | ✅ |
| Severity color coding | ✅ |
| Confidence indicators | ✅ |

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend UI | React 18 + Vite |
| State Management | Redux Toolkit |
| HTTP Client | Axios |
| File Upload | react-dropzone |
| Backend | Python 3.11 + FastAPI |
| AI Agent | LangGraph (StateGraph + MemorySaver) |
| LLM Provider | Groq Cloud |
| Primary LLM | `llama-3.3-70b-versatile` |
| Routing LLM | `gemma2-9b-it` |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL via Supabase |
| PDF Parsing | pypdf |
| DOCX Parsing | python-docx |
| Font | Google Inter |
