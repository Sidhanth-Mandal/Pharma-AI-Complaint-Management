from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.complaint import Complaint
from ..schemas.complaint import ChatRequest, AIResponse
from ..agents.graph import complaint_graph
from ..agents.state import AgentState

router = APIRouter()

@router.post("/message", response_model=AIResponse)
def chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    # Load existing complaints for duplicate detection if not provided
    existing_complaints = request.existing_complaints
    if not existing_complaints:
        db_complaints = db.query(Complaint).all()
        existing_complaints = [
            {
                "id": c.id,
                "customer_name": c.customer_name,
                "product_name": c.product_name,
                "batch_number": c.batch_number,
                "complaint_type": c.complaint_type
            }
            for c in db_complaints
        ]
    
    initial_state = {
        "messages": [],
        "complaint_fields": request.current_fields or {},
        "intent": "",
        "user_message": request.message,
        "document_text": "",
        "form_update": {},
        "assessment": {},
        "completeness": {"score": 0, "missing": []},
        "duplicates": [],
        "root_causes": [],
        "capa_actions": [],
        "timeline_event": "",
        "existing_complaints": existing_complaints,
        "ai_response_message": ""
    }
    
    result = complaint_graph.invoke(
        initial_state,
        config={"configurable": {"thread_id": request.thread_id}}
    )
    
    return AIResponse(
        message=result.get("ai_response_message", ""),
        form_update=result.get("form_update", {}),
        assessment=result.get("assessment", {}) or None,
        completeness=result.get("completeness", {"score": 0, "missing": []}),
        duplicates=result.get("duplicates", []),
        root_causes=result.get("root_causes", []),
        capa_actions=result.get("capa_actions", []),
        timeline_event=result.get("timeline_event", "")
    )
