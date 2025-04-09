from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import time
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import json
import re
from urllib.parse import urlparse

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

# Models
class MerchantInfo(BaseModel):
    name: str
    category: str
    amount: float

class Card(BaseModel):
    id: str
    name: str
    issuer: str
    imageUrl: str
    rewardRate: float
    categories: List[str]
    annualFee: float

class Recommendation(BaseModel):
    card: Card
    estimatedReward: float
    rewardRate: float

class GetRecommendationsRequest(BaseModel):
    merchantInfo: MerchantInfo
    amount: float

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

class DetectAmountRequest(BaseModel):
    url: str
    html: Optional[str] = None

# Sample data
SAMPLE_CARDS = [
    {
        "id": "card-1",
        "name": "Active Cash",
        "issuer": "Wells Fargo",
        "imageUrl": "https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/card-active-cash-visa-signature.png",
        "rewardRate": 2,
        "categories": ["general"],
        "annualFee": 0
    },
    {
        "id": "card-2",
        "name": "Freedom Unlimited",
        "issuer": "Chase",
        "imageUrl": "https://creditcards.chase.com/K-Marketplace/images/cardart/freedom_unlimited_card.png",
        "rewardRate": 1.5,
        "categories": ["general", "dining", "travel"],
        "annualFee": 0
    },
    {
        "id": "card-3",
        "name": "Sapphire Preferred",
        "issuer": "Chase",
        "imageUrl": "https://creditcards.chase.com/K-Marketplace/images/cardart/sapphire_preferred_card.png",
        "rewardRate": 1,
        "categories": ["travel", "dining"],
        "annualFee": 95
    },
    {
        "id": "card-4",
        "name": "Gold Card",
        "issuer": "American Express",
        "imageUrl": "https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/open/category/cardarts/gold-card.png",
        "rewardRate": 1,
        "categories": ["dining", "groceries"],
        "annualFee": 250
    }
]

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
    """Health check endpoint for monitoring API availability"""
    return {
        "status": "ok",
        "timestamp": time.time(),
        "version": "0.1.0"
    }

# API routes
@app.get("/api/status", response_model=ApiResponse)
async def check_status():
    """Check if the API is available"""
    return ApiResponse(
        success=True,
        data={"status": True, "version": "1.0.0"}
    )

@app.get("/api/cards", response_model=ApiResponse)
async def get_cards():
    """Get all available cards"""
    return ApiResponse(
        success=True,
        data={"cards": SAMPLE_CARDS}
    )

@app.post("/api/recommendations", response_model=ApiResponse)
async def get_recommendations(request: GetRecommendationsRequest):
    """Get recommendations for a merchant"""
    try:
        # In a real implementation, this would query a database or ML model
        # For now, just generate recommendations from sample data
        recommendations = []
        
        for card in SAMPLE_CARDS:
            reward_rate = card["rewardRate"]
            
            # Adjust rate based on category
            if request.merchantInfo.category in card["categories"]:
                if request.merchantInfo.category == "travel":
                    reward_rate *= 2
                else:
                    reward_rate *= 1.5
            
            # Calculate reward
            estimated_reward = (reward_rate / 100) * request.merchantInfo.amount
            
            recommendations.append({
                "card": card,
                "estimatedReward": estimated_reward,
                "rewardRate": reward_rate
            })
        
        # Sort by highest reward first
        recommendations.sort(key=lambda x: x["estimatedReward"], reverse=True)
        
        return ApiResponse(
            success=True,
            data=recommendations
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            error=str(e)
        )

@app.post("/api/detect-amount", response_model=ApiResponse)
async def detect_amount(request: DetectAmountRequest):
    """Detect purchase amount from URL or HTML"""
    try:
        # In a real implementation, this would use ML or rules to detect amounts
        # For now, return a dummy amount based on domain
        domain = urlparse(request.url).netloc
        
        # Use domain to determine a sample amount
        if "amazon" in domain:
            amount = 75.99
        elif "walmart" in domain:
            amount = 45.50
        elif "target" in domain:
            amount = 32.99
        elif "bestbuy" in domain:
            amount = 199.99
        else:
            # Default test amount
            amount = 40.81  # Match the screenshot exactly
            
        return ApiResponse(
            success=True,
            data={"amount": amount}
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 