from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import re
from urllib.parse import urlparse
from datetime import date

from ..models.database import get_db
from ..models.models import Card, CardReward, Retailer, RetailerDomain, LimitedTimeOffer
from ..models.schemas import CardRecommendation, MerchantRequest

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
    responses={404: {"description": "Not found"}}
)

@router.post("/detect-merchant")
def detect_merchant(request: MerchantRequest, db: Session = Depends(get_db)):
    """Detect merchant from URL"""
    # Extract domain from URL
    parsed_url = urlparse(request.url)
    domain = parsed_url.netloc
    
    # If www. is present, remove it
    if domain.startswith("www."):
        domain = domain[4:]
    
    # Check path for potential subdomains (e.g., amazon.com/wholefoodsmarket)
    path = parsed_url.path.lower()
    
    # Find matching retailer by domain or alternate domain
    retailer = None
    
    # First, check main domains
    for r in db.query(Retailer).all():
        if domain.endswith(r.domain_pattern):
            retailer = r
            break
    
    # If no match, check alternate domains
    if not retailer:
        for alt_domain in db.query(RetailerDomain).all():
            if domain.endswith(alt_domain.domain_pattern):
                retailer = db.query(Retailer).filter(Retailer.id == alt_domain.retailer_id).first()
                break
            
            # Check if the path contains any domains
            if alt_domain.domain_pattern in path:
                retailer = db.query(Retailer).filter(Retailer.id == alt_domain.retailer_id).first()
                break
    
    if retailer:
        return {
            "merchant_name": retailer.name,
            "merchant_category": retailer.category,
            "merchant_subcategory": retailer.subcategory,
            "domain": domain,
            "is_checkout": any(checkout_term in path for checkout_term in [
                "checkout", "payment", "order", "cart", "buy", "purchase", "pay"
            ]),
            "logo_url": retailer.logo_url
        }
    
    # Default fallback with guessed category
    guessed_category = "other"
    
    # Try to guess category from domain keywords
    domain_keywords = {
        "food": "dining",
        "restaurant": "dining",
        "pizza": "dining",
        "sushi": "dining",
        "eat": "dining",
        "burger": "dining",
        "tech": "electronics",
        "electronic": "electronics",
        "computer": "electronics",
        "laptop": "electronics",
        "phone": "electronics",
        "hotel": "travel",
        "flight": "travel",
        "airline": "travel",
        "air": "travel",
        "trip": "travel",
        "vacation": "travel",
        "cruise": "travel",
        "shop": "online_retail",
        "store": "online_retail",
        "market": "grocery",
        "grocer": "grocery"
    }
    
    for keyword, category in domain_keywords.items():
        if keyword in domain:
            guessed_category = category
            break
    
    return {
        "merchant_name": domain.split('.')[0].capitalize(),
        "merchant_category": guessed_category,
        "merchant_subcategory": None,
        "domain": domain,
        "is_checkout": any(checkout_term in path for checkout_term in [
            "checkout", "payment", "order", "cart", "buy", "purchase", "pay"
        ]),
        "logo_url": f"https://logo.clearbit.com/{domain}"
    }

@router.post("/recommend-card", response_model=List[CardRecommendation])
def recommend_card(request: MerchantRequest, db: Session = Depends(get_db)):
    """Recommend the best card for a given merchant URL"""
    # First detect the merchant
    merchant_info = detect_merchant(request, db)
    category = merchant_info["merchant_category"]
    subcategory = merchant_info["merchant_subcategory"]
    
    # Get current date for checking limited-time offers
    current_date = date.today()
    
    # Get all cards with their rewards
    cards = db.query(Card).all()
    
    recommendations = []
    for card in cards:
        best_reward = None
        best_reward_percentage = 0.0
        reward_reason = None
        is_limited_time = False
        offer_end_date = None
        
        # Check for limited time offers first - they usually have the best rewards
        for offer in db.query(LimitedTimeOffer).filter(
            LimitedTimeOffer.card_id == card.id,
            LimitedTimeOffer.start_date <= current_date,
            LimitedTimeOffer.end_date >= current_date,
            LimitedTimeOffer.category == category
        ).all():
            if offer.reward_percentage > best_reward_percentage:
                best_reward_percentage = offer.reward_percentage
                reward_reason = f"Limited time offer: {offer.description} (expires {offer.end_date})"
                is_limited_time = True
                offer_end_date = offer.end_date
        
        # If no limited time offer, check for rewards that match both category and subcategory
        if subcategory and best_reward_percentage == 0:
            for reward in card.rewards:
                if reward.category == category and reward.subcategory == subcategory:
                    if reward.reward_percentage > best_reward_percentage:
                        best_reward = reward
                        best_reward_percentage = reward.reward_percentage
                        reward_reason = f"Best match for {category} - {subcategory}"
        
        # If still no match, check for rewards that match just the category
        if best_reward_percentage == 0:
            for reward in card.rewards:
                if reward.category == category and reward.reward_percentage > best_reward_percentage:
                    best_reward = reward
                    best_reward_percentage = reward.reward_percentage
                    
                    if reward.is_rotating:
                        quarter = (current_date.month - 1) // 3 + 1
                        if reward.quarter is not None and reward.quarter != quarter:
                            continue
                            
                        if reward.subcategory:
                            reward_reason = f"{reward.reward_percentage}% back on {reward.subcategory} this quarter"
                        else:
                            reward_reason = f"{reward.reward_percentage}% back this quarter"
                    elif reward.max_spend:
                        reward_reason = f"{reward.reward_percentage}% back on {category} (up to ${reward.max_spend:,.0f}/year)"
                    else:
                        reward_reason = f"{reward.reward_percentage}% back on {category}"
        
        # Check for "other" category as fallback
        if best_reward_percentage == 0:
            for reward in card.rewards:
                if reward.category == "other" and reward.reward_percentage > best_reward_percentage:
                    best_reward = reward
                    best_reward_percentage = reward.reward_percentage
                    reward_reason = f"{reward.reward_percentage}% back on all purchases"
        
        # Calculate estimated reward amount if purchase amount is provided
        estimated_reward = None
        if request.purchase_amount and best_reward_percentage > 0:
            estimated_reward = round(request.purchase_amount * (best_reward_percentage / 100), 2)
            
            # Adjust for annual fee if considering long-term value
            # (Simple logic: we assume 10 similar purchases per year)
            if card.annual_fee > 0:
                annual_reward = estimated_reward * 10  # Assuming 10 similar purchases
                net_value = annual_reward - card.annual_fee
                if net_value <= 0:
                    # If annual fee exceeds estimated rewards, add note to reason
                    if reward_reason:
                        reward_reason += f" (Note: Annual fee of ${card.annual_fee} may not be offset by rewards)"
        
        # If we found a reward, add a recommendation
        if best_reward_percentage > 0:
            recommendations.append(
                CardRecommendation(
                    card_id=card.id,
                    card_name=card.name,
                    issuer=card.issuer,
                    reward_percentage=best_reward_percentage,
                    estimated_reward=estimated_reward,
                    category=category,
                    subcategory=subcategory,
                    annual_fee=card.annual_fee,
                    is_limited_time_offer=is_limited_time,
                    offer_end_date=offer_end_date,
                    image_url=card.image_url,
                    reason=reward_reason
                )
            )
    
    # Sort recommendations by:
    # 1. Reward percentage (highest first)
    # 2. If estimated rewards exist, also consider them (highest value)
    # 3. Consider annual fee as a tiebreaker (lower is better)
    def sort_key(recommendation):
        reward_value = recommendation.reward_percentage
        
        # If we have estimated rewards, use that as a secondary factor
        if recommendation.estimated_reward:
            reward_value = reward_value * 100 + recommendation.estimated_reward
        
        # Slightly reduce score for cards with annual fees
        if recommendation.annual_fee > 0:
            reward_value = reward_value - (recommendation.annual_fee / 1000)
            
        return reward_value
    
    recommendations.sort(key=sort_key, reverse=True)
    
    # Return top 3 recommendations or all if fewer
    return recommendations[:3] 