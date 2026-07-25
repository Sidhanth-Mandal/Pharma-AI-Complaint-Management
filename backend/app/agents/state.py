from typing import TypedDict, List, Optional, Any, Dict

class AgentState(TypedDict):
    messages: List[Dict[str, str]]
    complaint_fields: dict
    intent: str
    user_message: str
    document_text: Optional[str]
    form_update: dict
    assessment: dict
    completeness: dict
    duplicates: list
    root_causes: list
    capa_actions: list
    timeline_event: str
    existing_complaints: list
    ai_response_message: str
