from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class ComplaintBase(BaseModel):
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(ComplaintBase):
    pass

class ComplaintResponse(ComplaintBase):
    id: int
    completeness_score: int
    assessment_json: Dict[str, Any]
    timeline_json: List[Any]
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    thread_id: str
    message: str
    current_fields: dict = Field(default_factory=dict)
    existing_complaints: list = Field(default_factory=list)

class AssessmentSchema(BaseModel):
    severity: Optional[str] = None
    priority: Optional[str] = None
    confidence: Optional[float] = None
    patient_impact: Optional[str] = None
    regulatory_concern: Optional[str] = None
    suggested_action: Optional[str] = None
    investigation_urgency: Optional[str] = None
    business_impact: Optional[str] = None

class CompletenessSchema(BaseModel):
    score: int
    missing: List[str]

class DuplicateSchema(BaseModel):
    id: int
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    similarity: int
    reason: str

class RootCauseSchema(BaseModel):
    cause: str
    confidence: float
    explanation: str

class AIResponse(BaseModel):
    message: str
    form_update: dict
    assessment: Optional[AssessmentSchema] = None
    completeness: CompletenessSchema
    duplicates: List[DuplicateSchema] = []
    root_causes: List[RootCauseSchema] = []
    capa_actions: List[str] = []
    timeline_event: Optional[str] = None
