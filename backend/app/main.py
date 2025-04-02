from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .models.database import get_db
from .models.models import create_tables
from .data.sample_data import seed_sample_data
from .routers import cards, recommendations

app = FastAPI(
    title="Swipe API",
    description="API for Swipe credit card rewards maximizer",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cards.router)
app.include_router(recommendations.router)

@app.on_event("startup")
def startup_db_client():
    # Create tables if they don't exist
    create_tables()
    
    # Get a database session
    db = next(get_db())
    # Seed sample data
    seed_sample_data(db)

@app.get("/")
def read_root():
    return {"message": "Welcome to Swipe API - Credit Card Rewards Maximizer"}

@app.get("/health")
def health_check():
    return {"status": "healthy"} 