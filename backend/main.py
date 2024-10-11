from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models import Document, SessionLocal, engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentCreate(BaseModel):
    type: str
    title: str
    position: int

class DocumentUpdate(BaseModel):
    id: int
    type: Optional[str] = None  # Use Optional for older Python versions
    title: Optional[str] = None
    position: Optional[int] = None

class DocumentOut(BaseModel):
    id: int
    type: str
    title: str
    position: int

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/documents/", response_model=list[DocumentOut])
def get_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).order_by(Document.position).all()
    return documents

@app.post("/documents/", response_model=DocumentOut)
def create_document(document: DocumentCreate, db: Session = Depends(get_db)):
    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@app.put("/documents/batch-update", response_model=dict)
def batch_update_documents(documents: list[DocumentUpdate], db: Session = Depends(get_db)):
    for document in documents:
        db_document = db.query(Document).filter(Document.id == document.id).first()
        if not db_document:
            raise HTTPException(status_code=404, detail=f"Document with id {document.id} not found")

        # Update fields if provided
        for key, value in document.dict(exclude_unset=True).items():
            setattr(db_document, key, value)

    db.commit()
    return {"message": "Batch update successful"}

@app.put("/documents/{document_id}", response_model=DocumentOut)
def update_document(
    document_id: int,
    document: DocumentUpdate,
    db: Session = Depends(get_db)
):
    db_document = db.query(Document).filter(Document.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Update fields if provided
    for key, value in document.dict(exclude_unset=True).items():
        setattr(db_document, key, value)

    db.commit()
    db.refresh(db_document)
    return db_document

@app.delete("/documents/{document_id}", response_model=dict)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    db_document = db.query(Document).filter(Document.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(db_document)
    db.commit()
    return {"message": "Document deleted successfully"}
