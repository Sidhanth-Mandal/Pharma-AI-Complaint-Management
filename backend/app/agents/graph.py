import json
from typing import Literal
from groq import Groq
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from .state import AgentState
from .prompts import (
    ROUTER_SYSTEM_PROMPT, INTAKE_SYSTEM_PROMPT, EDIT_SYSTEM_PROMPT,
    DOCUMENT_SYSTEM_PROMPT, QUESTION_SYSTEM_PROMPT,
    RISK_SYSTEM_PROMPT, ROOT_CAUSE_CAPA_PROMPT
)
from ..config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

GEMMA_MODEL = "llama-3.1-8b-instant"
LLAMA_MODEL = "llama-3.3-70b-versatile"

COMPLETENESS_FIELDS = [
    "complaint_source", "customer_name", "product_name", "product_strength",
    "batch_number", "manufacturing_date", "expiry_date", "quantity_affected",
    "complaint_type", "complaint_date", "description", "severity", "priority"
]

FIELD_LABELS = {
    "complaint_source": "Complaint Source",
    "customer_name": "Customer Name",
    "product_name": "Product Name",
    "product_strength": "Product Strength/Grade",
    "batch_number": "Batch/Lot Number",
    "manufacturing_date": "Manufacturing Date",
    "expiry_date": "Expiry Date",
    "quantity_affected": "Quantity Affected",
    "complaint_type": "Complaint Type",
    "complaint_date": "Complaint Date",
    "description": "Detailed Description",
    "severity": "Initial Severity",
    "priority": "Priority"
}

def safe_json_parse(text: str, fallback: dict) -> dict:
    """Parse JSON from LLM response, handling markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    try:
        return json.loads(text)
    except Exception:
        # Try to find JSON in the text
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass
        return fallback

def call_llm(model: str, system: str, user: str, json_mode: bool = True) -> str:
    """Call Groq LLM with optional JSON mode."""
    kwargs = {"model": model, "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}], "temperature": 0.3, "max_tokens": 2048}
    if json_mode and model == LLAMA_MODEL:
        kwargs["response_format"] = {"type": "json_object"}
    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content

def router_node(state: AgentState) -> AgentState:
    """Determine user intent."""
    user_msg = state["user_message"]
    doc_text = state.get("document_text", "")
    
    if doc_text:
        return {**state, "intent": "document"}
    
    result = call_llm(GEMMA_MODEL, ROUTER_SYSTEM_PROMPT, user_msg, json_mode=False)
    parsed = safe_json_parse(result, {"intent": "intake"})
    intent = parsed.get("intent", "intake")
    if intent not in ["intake", "edit", "document", "question"]:
        intent = "intake"
    return {**state, "intent": intent}

def intake_node(state: AgentState) -> AgentState:
    """Extract complaint fields from natural language."""
    current = state.get("complaint_fields", {})
    user_context = f"""
Current complaint fields: {json.dumps(current, indent=2)}

User message: {state['user_message']}
"""
    result = call_llm(LLAMA_MODEL, INTAKE_SYSTEM_PROMPT, user_context)
    parsed = safe_json_parse(result, {"form_update": {}, "message": "I've processed your complaint.", "timeline_event": "Complaint information received"})
    
    form_update = parsed.get("form_update", {})
    # Merge: keep existing, only overwrite if new value is not null
    merged = {**current}
    for k, v in form_update.items():
        if v is not None:
            merged[k] = v
    
    return {
        **state,
        "complaint_fields": merged,
        "form_update": {k: v for k, v in form_update.items() if v is not None},
        "ai_response_message": parsed.get("message", ""),
        "timeline_event": parsed.get("timeline_event", "Complaint information updated")
    }

def edit_node(state: AgentState) -> AgentState:
    """Handle field corrections."""
    current = state.get("complaint_fields", {})
    user_context = f"""
Existing complaint fields: {json.dumps(current, indent=2)}

User correction request: {state['user_message']}
"""
    result = call_llm(LLAMA_MODEL, EDIT_SYSTEM_PROMPT, user_context)
    parsed = safe_json_parse(result, {"form_update": {}, "message": "I've updated the requested field.", "timeline_event": "Field corrected"})
    
    form_update = parsed.get("form_update", {})
    merged = {**current}
    for k, v in form_update.items():
        if v is not None:
            merged[k] = v
    
    return {
        **state,
        "complaint_fields": merged,
        "form_update": {k: v for k, v in form_update.items() if v is not None},
        "ai_response_message": parsed.get("message", ""),
        "timeline_event": parsed.get("timeline_event", "Field corrected by user")
    }

def document_node(state: AgentState) -> AgentState:
    """Extract complaint from document text."""
    current = state.get("complaint_fields", {})
    doc_text = state.get("document_text", "")
    user_context = f"""
Existing complaint fields: {json.dumps(current, indent=2)}

Document content to extract from:
---
{doc_text[:8000]}
---
"""
    result = call_llm(LLAMA_MODEL, DOCUMENT_SYSTEM_PROMPT, user_context)
    parsed = safe_json_parse(result, {"form_update": {}, "message": "Document processed.", "timeline_event": "Document extracted"})
    
    form_update = parsed.get("form_update", {})
    merged = {**current}
    for k, v in form_update.items():
        if v is not None:
            merged[k] = v
    
    return {
        **state,
        "complaint_fields": merged,
        "form_update": {k: v for k, v in form_update.items() if v is not None},
        "ai_response_message": parsed.get("message", ""),
        "timeline_event": parsed.get("timeline_event", "Document processed")
    }

def question_node(state: AgentState) -> AgentState:
    """Answer user questions about the complaint."""
    current = state.get("complaint_fields", {})
    assessment = state.get("assessment", {})
    user_context = f"""
Current complaint: {json.dumps(current, indent=2)}
Risk assessment: {json.dumps(assessment, indent=2)}

User question: {state['user_message']}
"""
    result = call_llm(LLAMA_MODEL, QUESTION_SYSTEM_PROMPT, user_context)
    parsed = safe_json_parse(result, {"message": "I can help you with that.", "form_update": {}, "timeline_event": "User inquiry answered"})
    
    return {
        **state,
        "form_update": {},
        "ai_response_message": parsed.get("message", ""),
        "timeline_event": parsed.get("timeline_event", "User question answered")
    }

def risk_assessment_node(state: AgentState) -> AgentState:
    """Generate risk assessment based on current complaint fields."""
    fields = state.get("complaint_fields", {})
    # Only run if we have enough info
    if not fields.get("product_name") and not fields.get("description"):
        return {**state, "assessment": {}}
    
    complaint_summary = f"""
Product: {fields.get('product_name', 'Unknown')} {fields.get('product_strength', '')}
Batch: {fields.get('batch_number', 'Unknown')}
Complaint Type: {fields.get('complaint_type', 'Unknown')}
Description: {fields.get('description', 'No description')}
Quantity Affected: {fields.get('quantity_affected', 'Unknown')}
Customer: {fields.get('customer_name', 'Unknown')}
"""
    result = call_llm(LLAMA_MODEL, RISK_SYSTEM_PROMPT, complaint_summary)
    assessment = safe_json_parse(result, {
        "severity": "Major", "priority": "High", "confidence": 0.7,
        "patient_impact": "Under assessment", "regulatory_concern": "Under assessment",
        "suggested_action": "Route to QA Investigation",
        "investigation_urgency": "Within 48 hours", "business_impact": "Under assessment"
    })
    
    # Immutably update severity/priority in form_update and complaint_fields
    form_update = {**state.get("form_update", {})}
    updated_fields = {**fields}
    if assessment.get("severity"):
        form_update["severity"] = assessment["severity"]
        updated_fields["severity"] = assessment["severity"]
    if assessment.get("priority"):
        form_update["priority"] = assessment["priority"]
        updated_fields["priority"] = assessment["priority"]
    
    return {**state, "assessment": assessment, "form_update": form_update, "complaint_fields": updated_fields}

def completeness_node(state: AgentState) -> AgentState:
    """Calculate complaint completeness score."""
    fields = state.get("complaint_fields", {})
    missing = []
    for f in COMPLETENESS_FIELDS:
        val = fields.get(f)
        if not val or str(val).strip() == "":
            missing.append(FIELD_LABELS.get(f, f))
    
    total = len(COMPLETENESS_FIELDS)
    filled = total - len(missing)
    score = round((filled / total) * 100)
    
    return {**state, "completeness": {"score": score, "missing": missing}}

def duplicate_check_node(state: AgentState) -> AgentState:
    """Find similar complaints from existing records."""
    fields = state.get("complaint_fields", {})
    existing = state.get("existing_complaints", [])
    
    duplicates = []
    for comp in existing:
        score = 0
        reasons = []
        
        if fields.get("product_name") and comp.get("product_name"):
            if fields["product_name"].lower() in comp["product_name"].lower() or \
               comp["product_name"].lower() in fields["product_name"].lower():
                score += 35
                reasons.append("same product")
        
        if fields.get("batch_number") and comp.get("batch_number"):
            if fields["batch_number"].upper() == comp["batch_number"].upper():
                score += 40
                reasons.append("same batch number")
        
        if fields.get("complaint_type") and comp.get("complaint_type"):
            if fields["complaint_type"] == comp["complaint_type"]:
                score += 15
                reasons.append("same complaint type")
        
        if fields.get("customer_name") and comp.get("customer_name"):
            if fields["customer_name"].lower() in comp["customer_name"].lower():
                score += 10
                reasons.append("same customer")
        
        if score >= 35:
            duplicates.append({
                "id": comp.get("id"),
                "customer_name": comp.get("customer_name", ""),
                "product_name": comp.get("product_name", ""),
                "batch_number": comp.get("batch_number", ""),
                "similarity": min(score, 98),
                "reason": ", ".join(reasons).capitalize() if reasons else "Similar complaint"
            })
    
    duplicates.sort(key=lambda x: x["similarity"], reverse=True)
    return {**state, "duplicates": duplicates[:3]}

def root_cause_capa_node(state: AgentState) -> AgentState:
    """Generate root cause analysis and CAPA recommendations."""
    fields = state.get("complaint_fields", {})
    if not fields.get("complaint_type") and not fields.get("description"):
        return {**state, "root_causes": [], "capa_actions": []}
    
    complaint_summary = f"""
Product: {fields.get('product_name', 'Unknown')} {fields.get('product_strength', '')}
Complaint Type: {fields.get('complaint_type', 'Unknown')}
Description: {fields.get('description', 'No description')}
Severity: {fields.get('severity', 'Unknown')}
Quantity Affected: {fields.get('quantity_affected', 'Unknown')}
"""
    result = call_llm(LLAMA_MODEL, ROOT_CAUSE_CAPA_PROMPT, complaint_summary)
    parsed = safe_json_parse(result, {"root_causes": [], "capa_actions": []})
    
    return {
        **state,
        "root_causes": parsed.get("root_causes", []),
        "capa_actions": parsed.get("capa_actions", [])
    }

def route_by_intent(state: AgentState) -> Literal["intake", "edit", "document", "question"]:
    return state.get("intent", "intake")

# Build the graph
memory = MemorySaver()

def build_complaint_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("router", router_node)
    workflow.add_node("intake", intake_node)
    workflow.add_node("edit", edit_node)
    workflow.add_node("document", document_node)
    workflow.add_node("question", question_node)
    workflow.add_node("risk_assessment", risk_assessment_node)
    workflow.add_node("completeness_check", completeness_node)
    workflow.add_node("duplicate_check", duplicate_check_node)
    workflow.add_node("root_cause_capa", root_cause_capa_node)
    
    workflow.set_entry_point("router")
    
    workflow.add_conditional_edges(
        "router",
        route_by_intent,
        {
            "intake": "intake",
            "edit": "edit",
            "document": "document",
            "question": "question"
        }
    )
    
    # After intake/edit/document \u2192 risk assessment \u2192 completeness \u2192 duplicate \u2192 root cause
    for node in ["intake", "edit", "document"]:
        workflow.add_edge(node, "risk_assessment")
    
    workflow.add_edge("risk_assessment", "completeness_check")
    workflow.add_edge("completeness_check", "duplicate_check")
    workflow.add_edge("duplicate_check", "root_cause_capa")
    workflow.add_edge("root_cause_capa", END)
    workflow.add_edge("question", END)
    
    return workflow.compile(checkpointer=memory)

complaint_graph = build_complaint_graph()
