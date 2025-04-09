from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import date, datetime

class CardRewardBase(BaseModel):
    category: str
    reward_percentage: float
    subcategory: Optional[str] = None
    is_rotating: bool = False
    quarter: Optional[int] = None
    max_spend: Optional[float] = None
    
    # New fields
    reward_points: Optional[float] = None
    reward_miles: Optional[float] = None
    merchant_restrictions: Optional[str] = None
    spend_threshold: Optional[float] = None
    activation_required: bool = False
    payment_method_requirement: Optional[str] = None
    redemption_options: Optional[str] = None
    
    class Config:
        orm_mode = True

class CardRewardCreate(CardRewardBase):
    card_id: int

class CardReward(CardRewardBase):
    id: int
    card_id: int
    
    class Config:
        orm_mode = True

class LimitedTimeOfferBase(BaseModel):
    description: str
    reward_percentage: float
    category: Optional[str] = None
    start_date: date
    end_date: date
    
    # New fields
    merchant_name: Optional[str] = None
    max_reward: Optional[float] = None
    min_spend: Optional[float] = None
    coupon_code: Optional[str] = None
    activation_method: Optional[str] = None
    exclusions: Optional[str] = None
    
    class Config:
        orm_mode = True

class LimitedTimeOfferCreate(LimitedTimeOfferBase):
    card_id: int

class LimitedTimeOffer(LimitedTimeOfferBase):
    id: int
    card_id: int
    
    class Config:
        orm_mode = True

class RetailerDomainBase(BaseModel):
    domain_pattern: str
    
    class Config:
        orm_mode = True

class RetailerDomainCreate(RetailerDomainBase):
    retailer_id: int

class RetailerDomain(RetailerDomainBase):
    id: int
    retailer_id: int
    
    class Config:
        orm_mode = True

class CardBase(BaseModel):
    name: str
    issuer: str
    last_four: Optional[str] = None
    annual_fee: float = 0.0
    image_url: Optional[str] = None
    has_foreign_transaction_fee: bool = False
    foreign_transaction_fee_percent: Optional[float] = None
    sign_up_bonus: Optional[str] = None
    sign_up_bonus_value: Optional[float] = None
    sign_up_spend_requirement: Optional[float] = None
    sign_up_timeframe_days: Optional[int] = None
    
    # New fields
    card_network: Optional[str] = None
    card_type: Optional[str] = None
    reward_type: Optional[str] = None
    points_value_cents: Optional[float] = None
    intro_apr: Optional[float] = None
    intro_apr_duration: Optional[int] = None
    regular_apr_low: Optional[float] = None
    regular_apr_high: Optional[float] = None
    credit_score_recommended: Optional[str] = None
    annual_credits: Optional[float] = None
    additional_benefits: Optional[str] = None

    class Config:
        orm_mode = True

class CardCreate(CardBase):
    rewards: List[CardRewardCreate]
    limited_time_offers: Optional[List[LimitedTimeOfferCreate]] = []

class Card(CardBase):
    id: int
    rewards: List[CardReward] = []
    limited_time_offers: List[LimitedTimeOffer] = []
    
    class Config:
        orm_mode = True

class RetailerBase(BaseModel):
    name: str
    domain_pattern: str
    category: str
    subcategory: Optional[str] = None
    logo_url: Optional[str] = None
    
    # New fields
    special_reward_cards: Optional[str] = None
    average_transaction: Optional[float] = None

    class Config:
        orm_mode = True

class RetailerCreate(RetailerBase):
    alternate_domains: Optional[List[RetailerDomainCreate]] = []

class Retailer(RetailerBase):
    id: int
    alternate_domains: List[RetailerDomain] = []
    
    class Config:
        orm_mode = True

class MerchantRequest(BaseModel):
    url: str
    purchase_amount: Optional[float] = None
    
    class Config:
        orm_mode = True

class CardRecommendation(BaseModel):
    card_id: int
    card_name: str
    issuer: str
    reward_percentage: float
    estimated_reward: Optional[float] = None
    category: str
    subcategory: Optional[str] = None
    annual_fee: float = 0.0
    is_limited_time_offer: bool = False
    offer_end_date: Optional[date] = None
    image_url: Optional[str] = None
    reason: Optional[str] = None
    
    # New fields
    points_value: Optional[float] = None
    reward_currency: Optional[str] = "cash back"
    card_network: Optional[str] = None
    has_foreign_transaction_fee: Optional[bool] = None
    sign_up_bonus: Optional[str] = None
    sign_up_bonus_value: Optional[float] = None
    annual_credits: Optional[float] = None
    credit_score_recommended: Optional[str] = None
    additional_benefits: Optional[List[str]] = []
    
    class Config:
        orm_mode = True

class CardBenefitBase(BaseModel):
    benefit_name: str
    benefit_description: str
    benefit_value: Optional[float] = None
    benefit_category: Optional[str] = None
    
    class Config:
        orm_mode = True

class CardBenefitCreate(CardBenefitBase):
    card_id: int

class CardBenefit(CardBenefitBase):
    id: int
    card_id: int

    class Config:
        orm_mode = True

# Update forward references
Retailer.update_forward_refs() 