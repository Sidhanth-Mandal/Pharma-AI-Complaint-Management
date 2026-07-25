from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
import io
import json
import pypdf
import docx

from ..database import get_db
from ..models.complaint import Complaint
from ..schemas.complaint import AIResponse
from ..agents.graph import complaint_graph
from ..agents.state import AgentState

router = APIRouter()

@router.post("/extract", response_model=AIResponse)
async def extract_document(
    file: UploadFile = File(...),
    thread_id: str = Form(...),
    current_fields: str = Form(default="{}"),
    existing_complaints: str = Form(default="[]"),
    db: Session = Depends(get_db)
):
    # Read file bytes
    file_bytes = await file.read()
    
    # Extract text based on extension
    filename = file.filename.lower()
    extracted_text = ""
    
    try:
        if filename.endswith(".pdf"):
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
        elif filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
        else:
            # Try to decode as UTF-8 for txt, eml, etc.
            extracted_text = file_bytes.decode("utf-8")
    except Exception as e:
        extracted_text = f"Error extracting text: {str(e)}"
    
    # Parse inputs
    try:
        fields = json.loads(current_fields)
    except:
        fields = {}
        
    try:
        existing = json.loads(existing_complaints)
    except:
        existing = []
        
    if not existing:
        db_complaints = db.query(Complaint).all()
        existing = [
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
        "complaint_fields": fields,
        "intent": "",
        "user_message": "Extract complaint information from this document.",
        "document_text": extracted_text,
        "form_update": {},
        "assessment": {},
        "completeness": {"score": 0, "missing": []},
        "duplicates": [],
        "root_causes": [],
        "capa_actions": [],
        "timeline_event": "",
        "existing_complaints": existing,
        "ai_response_message": ""
    }
    
    result = complaint_graph.invoke(
        initial_state,
        config={"configurable": {"thread_id": thread_id}}
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
