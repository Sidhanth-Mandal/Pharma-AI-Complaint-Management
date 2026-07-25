from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.complaint import Complaint
from ..schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse

router = APIRouter()

@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()
    return complaints

@router.post("/", response_model=ComplaintResponse)
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    db_complaint = Complaint(**complaint.model_dump())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.put("/{id}", response_model=ComplaintResponse)
def update_complaint(id: int, complaint: ComplaintUpdate, db: Session = Depends(get_db)):
    db_complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    update_data = complaint.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_complaint, key, value)
    
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.delete("/{id}")
def delete_complaint(id: int, db: Session = Depends(get_db)):
    db_complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    db.delete(db_complaint)
    db.commit()
    return {"ok": True}
