# AIVOA Backend Architecture & Implementation Guide

> **Pharmaceutical API & FDF Quality Assurance Module — Backend Subsystem**  
> Built with **FastAPI**, **LangGraph**, **Groq LLMs (`llama-3.3-70b-versatile`)**, **SQLAlchemy 2.0**, and **PostgreSQL (Supabase)**.

---

## 1. Executive Summary

The **AIVOA Backend** is an intelligent, agent-driven REST API server designed to power the automated intake, enrichment, risk assessment, and persistence of pharmaceutical customer complaints. Instead of traditional static form endpoints, AIVOA uses a **LangGraph StateGraph** to dynamically process natural language conversation, extract structured QMS fields, perform regulatory risk assessments, detect historical duplicates, and generate Corrective and Preventive Actions (CAPA) in real time.

![Backend System Architecture](images/backend_system_architecture.png)

---

## 2. LangGraph Agent Workflow & State Machine

The core intelligence of AIVOA resides in `app/agents/graph.py`. The agent is modeled as a directed state graph using **LangGraph**, where state flows through specialized nodes that mutate an immutable or merged conversation state.

### 2.1 The `AgentState` Schema

All nodes receive and return modifications to the shared `AgentState` (`app/agents/state.py`):

```python
class AgentState(TypedDict):
    messages: List[Dict[str, str]]        # Conversation transcript
    complaint_fields: dict                # Currently populated QMS fields
    intent: str                           # "intake" | "edit" | "document" | "question"
    user_message: str                     # Latest user utterance
    document_text: Optional[str]          # Extracted raw text from uploaded files
    form_update: dict                     # Delta field updates for the UI
    assessment: dict                      # Risk assessment output (severity, priority, confidence)
    completeness: dict                    # Completeness score and missing field checklist
    duplicates: list                      # Similar historical complaints found in DB
    root_causes: list                     # AI-suggested root cause hypotheses
    capa_actions: list                    # Suggested CAPA action items
    timeline_event: str                   # Human-readable audit log summary
    existing_complaints: list             # Historical complaints loaded for duplicate matching
    ai_response_message: str              # Conversational response returned to user
```

---

## 3. Node-by-Node Implementation & LLM Strategy

Each graph node executes a targeted prompt against **Groq Cloud API** models. Using specialized models optimizes latency, cost, and JSON schema compliance.

### 3.1 LLM Strategy Matrix

| Node / Responsibility | Groq Model | Mode | Rationale |
| :--- | :--- | :--- | :--- |
| **Intent Router (`router_node`)** | `llama-3.1-8b-instant` | Text / Fast | High-speed classification into `intake`, `edit`, `document`, or `question` with minimal token cost. |
| **Intake Engine (`intake_node`)** | `llama-3.3-70b-versatile` | `json_object` | Precise named entity recognition and pharmaceutical field extraction from natural language. |
| **Field Editor (`edit_node`)** | `llama-3.3-70b-versatile` | `json_object` | Surgical field modification while ensuring unchanged fields remain intact. |
| **Document Extractor (`document_node`)** | `llama-3.3-70b-versatile` | `json_object` | Long-context comprehension of QA reports, lab results, and customer emails. |
| **Risk Assessor (`risk_assessment_node`)**| `llama-3.3-70b-versatile` | `json_object` | Deep regulatory reasoning (FDA / EMA / ICH guidelines) to assign severity and priority. |
| **Completeness Checker (`completeness_node`)**| Pure Python / Algorithmic | Deterministic | Evaluates 13 standard QMS fields to calculate exact percentage scores and missing field lists. |
| **Duplicate Detector (`duplicate_check_node`)**| `llama-3.3-70b-versatile` | `json_object` | Semantic comparison between current batch/product details and historical database records. |
| **CAPA Generator (`root_cause_capa_node`)**| `llama-3.3-70b-versatile` | `json_object` | Generates structured root cause hypotheses and CAPA action items tailored to pharma deviations. |

> [!TIP]
> **Enforcing JSON Compliance**: For all 70B analytical nodes, `response_format={"type": "json_object"}` is enabled alongside markdown code fence stripping (`safe_json_parse()`) to guarantee zero JSON parse failures in production.

---

## 4. API Layer & REST Endpoints

The FastAPI application (`app/main.py`) organizes endpoints into three routers: **Chat**, **Documents**, and **Complaints**.

![Backend API Sequence Diagram](images/backend_api_sequence_diagram.png)

### 4.1 Chat API (`app/api/chat.py`)
* `POST /api/chat/message`
  * **Payload**: `thread_id`, `message`, `current_fields`, `existing_complaints`.
  * **Behavior**: Runs the LangGraph workflow, merges `form_update` into existing fields, calculates completeness, and returns the unified state response.

### 4.2 Document API (`app/api/documents.py`)
* `POST /api/documents/extract`
  * **Payload**: `file` (Multipart Upload), `thread_id`, `current_fields`, `existing_complaints`.
  * **Supported Formats**: `.pdf` (`pypdf`), `.docx` (`python-docx`), `.txt`, `.eml`.
  * **Behavior**: Extracts raw ASCII/UTF-8 text from binaries, seeds `state["document_text"]`, and routes directly to `document_node` -> QA Analysis Pipeline.

### 4.3 Complaints CRUD API (`app/api/complaints.py`)
* `GET /api/complaints/`: Lists all stored complaints with optional pagination.
* `POST /api/complaints/`: Persists a finalized complaint record to Supabase PostgreSQL.
* `GET /api/complaints/{id}`: Retrieves a single complaint by its UUID or integer primary key.
* `PUT /api/complaints/{id}`: Updates an existing complaint record.
* `DELETE /api/complaints/{id}`: Removes a complaint record from storage.

---

## 5. Database Schema & ORM Model

AIVOA uses **SQLAlchemy 2.0** with declarative mappings (`app/models/complaint.py`) and validates data transfer objects using **Pydantic v2** (`app/schemas/complaint.py`).

![Backend Database ER Diagram](images/backend_database_er_diagram.png)

> [!IMPORTANT]
> **PostgreSQL JSONB Support**: Complex multi-item lists such as `root_causes`, `capa_actions`, and `risk_assessment` are stored as native JSON/JSONB columns in PostgreSQL, allowing schema evolution without database migrations.

---

## 6. Document Processing Pipeline

When a user uploads a quality report or email, `app/api/documents.py` executes format-specific parsers before invoking the LLM:

![Backend Document Processing Pipeline](images/backend_document_pipeline.png)

---

## 7. Security, Configuration & Deployment

* **Configuration Management (`app/config.py`)**: All sensitive tokens and server parameters are loaded via `pydantic-settings` from environment variables (`.env`).
  * `GROQ_API_KEY`: Authentication for Groq LLM API.
  * `DATABASE_URL`: SQLAlchemy connection string (`postgresql://postgres:...@db.project.supabase.co:5432/postgres`).
  * `ALLOWED_ORIGINS`: Comma-separated CORS origins (defaults to `http://localhost:5173`).
* **CORS & Middleware**: `CORSMiddleware` is configured in `app/main.py` to allow cross-origin requests from frontend dev servers and production hostings.
* **Database Auto-Seeding (`seed_data.py`)**: Includes a seeder script that populates realistic sample complaints (e.g., Amoxicillin discoloration, Paracetamol foil seal defects) to demonstrate the semantic duplicate detection algorithm out-of-the-box.
