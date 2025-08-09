from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, db

router = APIRouter(
    prefix="/api-keys",
    tags=["API Keys"]
)

# Dependency
def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()

# Create API key
@router.post("/", response_model=schemas.APIKeyOut)
def create_api_key(api_key_data: schemas.APIKeyCreate, db: Session = Depends(get_db)):
    # For now, using user_id=1 (replace with real authentication later)
    user_id = 1
    existing_key = db.query(models.APIKey).filter_by(user_id=user_id, service_name=api_key_data.service_name).first()
    if existing_key:
        raise HTTPException(status_code=400, detail="API key for this service already exists")

    api_key = models.APIKey(
        user_id=user_id,
        service_name=api_key_data.service_name,
        api_key=api_key_data.api_key
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    return api_key

# Get all API keys
@router.get("/", response_model=List[schemas.APIKeyOut])
def get_all_api_keys(db: Session = Depends(get_db)):
    user_id = 1
    keys = db.query(models.APIKey).filter_by(user_id=user_id).all()
    return keys

# Update API key
@router.put("/{key_id}", response_model=schemas.APIKeyOut)
def update_api_key(key_id: int, api_key_data: schemas.APIKeyUpdate, db: Session = Depends(get_db)):
    user_id = 1
    api_key = db.query(models.APIKey).filter_by(id=key_id, user_id=user_id).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    if api_key_data.api_key:
        api_key.api_key = api_key_data.api_key

    db.commit()
    db.refresh(api_key)
    return api_key

# Delete API key
@router.delete("/{key_id}")
def delete_api_key(key_id: int, db: Session = Depends(get_db)):
    user_id = 1
    api_key = db.query(models.APIKey).filter_by(id=key_id, user_id=user_id).first()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    db.delete(api_key)
    db.commit()
    return {"message": "API key deleted successfully"}
