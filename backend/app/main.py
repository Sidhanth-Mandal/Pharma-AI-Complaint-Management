from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .api import complaints, chat, documents

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AIVOA Complaint Management API",
    description="AI-Powered Customer Complaint Management System for Pharmaceutical QA",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

@app.get("/")
def root():
    return {"message": "AIVOA Complaint Management API", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
