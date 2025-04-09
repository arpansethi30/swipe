from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Union
import re
from urllib.parse import urlparse
from datetime import date, datetime
from sqlalchemy import desc, case, and_, or_, func

from ..models.database import get_db
from ..models.models import Card, CardReward, Retailer, RetailerDomain, LimitedTimeOffer, CardBenefit
from ..models.schemas import CardRecommendation, MerchantRequest

router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"],
    responses={404: {"description": "Not found"}}
)

@router.post("/identify-merchant")
def identify_merchant(request: MerchantRequest, db: Session = Depends(get_db)):
    """Detect merchant from URL with enhanced detection"""
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
        alt_domain = db.query(RetailerDomain).filter(
            RetailerDomain.domain_pattern.in_([domain, "www." + domain])
        ).first()
        
        if alt_domain:
            retailer = db.query(Retailer).filter(Retailer.id == alt_domain.retailer_id).first()
        else:
            # Check if the path contains any domains
            for alt_domain in db.query(RetailerDomain).all():
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
            "logo_url": retailer.logo_url,
            "average_transaction": retailer.average_transaction,
            "special_reward_cards": retailer.special_reward_cards
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
        "cafe": "dining",
        "coffee": "dining",
        "tech": "electronics",
        "electronic": "electronics",
        "computer": "electronics",
        "laptop": "electronics",
        "phone": "electronics",
        "gadget": "electronics",
        "hotel": "travel",
        "flight": "travel",
        "airline": "travel",
        "air": "travel",
        "trip": "travel",
        "vacation": "travel",
        "cruise": "travel",
        "booking": "travel",
        "reservation": "travel",
        "shop": "online_retail",
        "store": "online_retail",
        "buy": "online_retail",
        "market": "grocery",
        "grocer": "grocery",
        "super": "grocery",
        "food": "grocery",
        "organic": "grocery",
        "stream": "streaming",
        "video": "streaming",
        "movie": "streaming",
        "music": "streaming",
        "audio": "streaming",
        "tv": "streaming",
        "game": "entertainment",
        "play": "entertainment",
        "ticket": "entertainment",
        "event": "entertainment",
        "gas": "gas",
        "fuel": "gas",
        "petrol": "gas",
        "station": "gas",
        "pump": "gas",
        "drug": "drugstores",
        "pharmacy": "drugstores",
        "prescription": "drugstores",
        "medicine": "drugstores",
        "transit": "transit",
        "transport": "transit",
        "train": "transit",
        "bus": "transit",
        "subway": "transit",
        "taxi": "transit",
        "ride": "transit",
        "uber": "transit",
        "lyft": "transit",
        "improvement": "home_improvement",
        "hardware": "home_improvement",
        "tools": "home_improvement",
        "construction": "home_improvement",
        "furniture": "home_improvement"
    }
    
    for keyword, category in domain_keywords.items():
        if keyword in domain or keyword in path:
            guessed_category = category
            break
    
    # Get the most common average transaction amount for this category
    avg_transaction = 50.0  # Default
    category_avg = db.query(func.avg(Retailer.average_transaction)).filter(
        Retailer.category == guessed_category,
        Retailer.average_transaction != None
    ).scalar()
    
    if category_avg:
        avg_transaction = float(category_avg)
    
    return {
        "merchant_name": domain.split('.')[0].capitalize(),
        "merchant_category": guessed_category,
        "merchant_subcategory": None,
        "domain": domain,
        "is_checkout": any(checkout_term in path for checkout_term in [
            "checkout", "payment", "order", "cart", "buy", "purchase", "pay"
        ]),
        "logo_url": f"https://logo.clearbit.com/{domain}",
        "average_transaction": avg_transaction,
        "special_reward_cards": None
    }

@router.post("/recommend-card", response_model=List[CardRecommendation])
def recommend_card(request: MerchantRequest, db: Session = Depends(get_db)):
    """Recommend the best cards for a given merchant URL with enhanced logic"""
    # First detect the merchant
    merchant_info = identify_merchant(request, db)
    category = merchant_info["merchant_category"]
    subcategory = merchant_info["merchant_subcategory"]
    
    # Get current date for checking limited-time offers
    current_date = date.today()
    
    # Use provided purchase amount or estimated average from merchant data
    purchase_amount = request.purchase_amount or merchant_info.get("average_transaction", 100.0)
    
    # Get all cards with their rewards
    cards = db.query(Card).all()
    
    recommendations = []
    for card in cards:
        best_reward = None
        best_reward_percentage = 0.0
        reward_reason = None
        is_limited_time = False
        offer_end_date = None
        reward_currency = "cash back"
        points_or_miles = False
        
        # Check for cards specifically mentioned for this merchant
        special_card_boost = 0.0
        if merchant_info.get("special_reward_cards") and card.name in merchant_info["special_reward_cards"]:
            special_card_boost = 0.5  # Boost the effective reward rate for specially mentioned cards
            
        # Check for limited time offers first - they usually have the best rewards
        for offer in db.query(LimitedTimeOffer).filter(
            LimitedTimeOffer.card_id == card.id,
            LimitedTimeOffer.start_date <= current_date,
            LimitedTimeOffer.end_date >= current_date
        ).all():
            # Check if offer applies to this merchant/category
            if (offer.merchant_name and merchant_info["merchant_name"] and 
                offer.merchant_name.lower() in merchant_info["merchant_name"].lower()):
                # Direct merchant match
                best_reward_percentage = offer.reward_percentage + special_card_boost
                reward_reason = f"Limited time offer: {offer.description} (expires {offer.end_date})"
                is_limited_time = True
                offer_end_date = offer.end_date
                break
            elif offer.category == category:
                # Category match
                if offer.reward_percentage > best_reward_percentage:
                    best_reward_percentage = offer.reward_percentage + special_card_boost
                    reward_reason = f"Limited time offer: {offer.description} (expires {offer.end_date})"
                    is_limited_time = True
                    offer_end_date = offer.end_date
        
        # If no limited time offer, check for rewards that match both category and subcategory
        if subcategory and best_reward_percentage == 0:
            for reward in card.rewards:
                if reward.category == category and reward.subcategory == subcategory:
                    effective_rate = reward.reward_percentage + special_card_boost
                    if effective_rate > best_reward_percentage:
                        best_reward = reward
                        best_reward_percentage = effective_rate
                        reward_reason = f"Best match for {category} - {subcategory}"
                        
                        # Check if this is a points or miles reward
                        if reward.reward_points and reward.reward_points > 0:
                            points_or_miles = True
                            if card.reward_type == "Points":
                                reward_currency = f"{card.issuer} points"
                            elif card.reward_type == "Miles":
                                reward_currency = "miles"
        
        # If still no match, check for rewards that match just the category
        if best_reward_percentage == 0:
            for reward in card.rewards:
                if reward.category == category:
                    effective_rate = reward.reward_percentage + special_card_boost
                    if effective_rate > best_reward_percentage:
                        best_reward = reward
                        best_reward_percentage = effective_rate
                        
                        # Check for points/miles and rotating categories
                        if reward.reward_points and reward.reward_points > 0:
                            points_or_miles = True
                            if card.reward_type == "Points":
                                reward_currency = f"{card.issuer} points"
                            elif card.reward_type == "Miles":
                                reward_currency = "miles"
                        
                        if reward.is_rotating:
                            quarter = (current_date.month - 1) // 3 + 1
                            if reward.quarter is not None and reward.quarter != quarter:
                                continue
                                
                            if reward.subcategory:
                                reward_reason = f"{reward.reward_percentage}% back on {reward.subcategory} this quarter"
                                if reward.activation_required:
                                    reward_reason += " (activation required)"
                            else:
                                reward_reason = f"{reward.reward_percentage}% back this quarter"
                        elif reward.max_spend:
                            reward_reason = f"{reward.reward_percentage}% back on {category} (up to ${reward.max_spend:,.0f}/year)"
                        else:
                            reward_reason = f"{reward.reward_percentage}% back on {category}"
                        
                        # If there are merchant restrictions, add them
                        if reward.merchant_restrictions:
                            reward_reason += f" ({reward.merchant_restrictions})"
        
        # Check for "other" category as fallback
        if best_reward_percentage == 0:
            for reward in card.rewards:
                if reward.category == "other":
                    effective_rate = reward.reward_percentage + special_card_boost
                    if effective_rate > best_reward_percentage:
                        best_reward = reward
                        best_reward_percentage = effective_rate
                        reward_reason = f"{reward.reward_percentage}% back on all purchases"
                        
                        # Check for points/miles
                        if reward.reward_points and reward.reward_points > 0:
                            points_or_miles = True
                            if card.reward_type == "Points":
                                reward_currency = f"{card.issuer} points"
                            elif card.reward_type == "Miles":
                                reward_currency = "miles"
        
        # Calculate estimated reward amount
        estimated_reward = None
        points_value = None
        if best_reward_percentage > 0:
            if points_or_miles and card.points_value_cents:
                # Convert points to cash value based on points_value_cents
                points_earned = purchase_amount * (best_reward_percentage / 100)
                estimated_reward = points_earned * (card.points_value_cents / 100)
                points_value = points_earned
            else:
                estimated_reward = purchase_amount * (best_reward_percentage / 100)
            
            # Check for annual fee impact - is it worth it over a 1-year period?
            if card.annual_fee > 0:
                # Calculate how many similar purchases would be needed to offset the annual fee
                if estimated_reward > 0:
                    purchases_to_offset = card.annual_fee / estimated_reward
                    
                    # If it would take more than 12 purchases to offset, note this
                    if purchases_to_offset > 12:
                        offset_note = f"Annual fee of ${card.annual_fee} requires {int(purchases_to_offset)} similar purchases to offset"
                        if reward_reason:
                            reward_reason += f" (Note: {offset_note})"
                        else:
                            reward_reason = offset_note
                            
                # Check if the card has annual credits that help offset the fee
                if card.annual_credits:
                    effective_annual_fee = card.annual_fee - card.annual_credits
                    if effective_annual_fee <= 0:
                        reward_reason += f" (Annual fee offset by ${card.annual_credits} in credits)"
                    else:
                        reward_reason += f" (Annual fee partially offset by ${card.annual_credits} in credits)"
                    
        # If we found a reward, check for additional benefits relevant to this purchase
        relevant_benefits = []
        if best_reward_percentage > 0:
            for benefit in db.query(CardBenefit).filter(CardBenefit.card_id == card.id).all():
                # Check if benefit is relevant to this category
                benefit_relevance = 0
                
                # Travel benefits are most relevant for travel purchases
                if benefit.benefit_category == "Travel" and category == "travel":
                    benefit_relevance = 2
                # Shopping benefits are relevant for retail/electronics
                elif benefit.benefit_category == "Shopping" and category in ["online_retail", "electronics"]:
                    benefit_relevance = 2
                # Dining benefits are relevant for dining/food
                elif benefit.benefit_category == "Dining" and category == "dining":
                    benefit_relevance = 2
                # Insurance might be relevant for big purchases
                elif benefit.benefit_category == "Insurance" and purchase_amount > 500:
                    benefit_relevance = 1
                
                if benefit_relevance > 0:
                    relevant_benefits.append({
                        "name": benefit.benefit_name,
                        "value": benefit.benefit_value,
                        "relevance": benefit_relevance
                    })
            
            # Sort benefits by relevance and take top 2
            relevant_benefits = sorted(relevant_benefits, key=lambda x: x["relevance"], reverse=True)[:2]
            
            # Add benefits to reason if there are any highly relevant ones
            if relevant_benefits and relevant_benefits[0]["relevance"] > 1:
                benefit_text = f"Includes {relevant_benefits[0]['name']}"
                if reward_reason:
                    reward_reason += f" • {benefit_text}"
                else:
                    reward_reason = benefit_text
            
            # Build the recommendation object
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
                    reason=reward_reason,
                    # New fields
                    points_value=points_value,
                    reward_currency=reward_currency,
                    card_network=card.card_network,
                    has_foreign_transaction_fee=card.has_foreign_transaction_fee,
                    sign_up_bonus=card.sign_up_bonus,
                    sign_up_bonus_value=card.sign_up_bonus_value,
                    annual_credits=card.annual_credits,
                    credit_score_recommended=card.credit_score_recommended,
                    additional_benefits=[b["name"] for b in relevant_benefits] if relevant_benefits else []
                )
            )
    
    # Enhanced sorting algorithm with multiple factors
    def sort_key(recommendation):
        # Start with the base reward percentage (most important factor)
        score = recommendation.reward_percentage * 100
        
        # If we have estimated rewards, consider them as well
        if recommendation.estimated_reward:
            score += recommendation.estimated_reward * 2
        
        # Limited time offers get a boost
        if recommendation.is_limited_time_offer:
            score += 50
            
        # Deduct for annual fees, but consider annual credits
        if recommendation.annual_fee > 0:
            effective_fee = recommendation.annual_fee
            if recommendation.annual_credits:
                effective_fee -= recommendation.annual_credits
            
            # Larger purchases care less about annual fees
            fee_impact = effective_fee / max(purchase_amount, 1) * 10
            score -= min(fee_impact, 50)  # Cap the negative impact
            
        # Slight preference for no foreign transaction fee cards for international merchants
        if "international" in request.url.lower() or ".com" not in request.url.lower():
            if not recommendation.has_foreign_transaction_fee:
                score += 10
                
        # Slight boost for cards that match the user's likely credit score range
        # (Implementation would require knowing user's score range)
        
        return score
    
    recommendations.sort(key=sort_key, reverse=True)
    
    # Return top recommendations (up to 5)
    return recommendations[:5]

@router.post("/identify-merchant", response_model=Dict)
def identify_merchant_endpoint(request: MerchantRequest, db: Session = Depends(get_db)):
    """API endpoint for merchant identification"""
    return identify_merchant(request, db)

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Get all available reward categories"""
    # Get unique categories from rewards
    categories = db.query(CardReward.category).distinct().all()
    return [cat[0] for cat in categories if cat[0] != "rotating" and cat[0] != "other"] 