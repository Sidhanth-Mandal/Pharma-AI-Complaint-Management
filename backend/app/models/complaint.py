from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from ..database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_source = Column(String(255), nullable=True)
    customer_name = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    product_strength = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=True)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    quantity_affected = Column(String(100), nullable=True)
    complaint_type = Column(String(100), nullable=True)
    complaint_date = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    severity = Column(String(50), nullable=True)
    priority = Column(String(50), nullable=True)
    completeness_score = Column(Integer, default=0)
    assessment_json = Column(JSON, default={})
    timeline_json = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
