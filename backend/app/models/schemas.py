from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class CardRewardBase(BaseModel):
    category: str
    reward_percentage: float
    subcategory: Optional[str] = None
    is_rotating: bool = False
    quarter: Optional[int] = None
    max_spend: Optional[float] = None

class CardRewardCreate(CardRewardBase):
    pass

class CardReward(CardRewardBase):
    id: int
    card_id: int
    
    class Config:
        from_attributes = True

class LimitedTimeOfferBase(BaseModel):
    description: str
    category: str
    reward_percentage: float
    start_date: date
    end_date: date

class LimitedTimeOfferCreate(LimitedTimeOfferBase):
    pass

class LimitedTimeOffer(LimitedTimeOfferBase):
    id: int
    card_id: int
    
    class Config:
        from_attributes = True

class RetailerDomainBase(BaseModel):
    domain_pattern: str

class RetailerDomainCreate(RetailerDomainBase):
    pass

class RetailerDomain(RetailerDomainBase):
    id: int
    retailer_id: int
    
    class Config:
        from_attributes = True

class CardBase(BaseModel):
    name: str
    issuer: str
    last_four: str
    annual_fee: float = 0.0
    image_url: Optional[str] = None
    has_foreign_transaction_fee: bool = True
    sign_up_bonus: Optional[str] = None
    sign_up_bonus_value: float = 0.0
    sign_up_spend_requirement: Optional[float] = None
    sign_up_timeframe_days: Optional[int] = None

class CardCreate(CardBase):
    rewards: List[CardRewardCreate]
    limited_time_offers: Optional[List[LimitedTimeOfferCreate]] = []

class Card(CardBase):
    id: int
    rewards: List[CardReward] = []
    limited_time_offers: List[LimitedTimeOffer] = []
    
    class Config:
        from_attributes = True

class RetailerBase(BaseModel):
    name: str
    domain_pattern: str
    category: str
    subcategory: Optional[str] = None
    logo_url: Optional[str] = None

class RetailerCreate(RetailerBase):
    alternate_domains: Optional[List[RetailerDomainCreate]] = []

class Retailer(RetailerBase):
    id: int
    alternate_domains: List[RetailerDomain] = []
    
    class Config:
        from_attributes = True

class MerchantRequest(BaseModel):
    url: str
    purchase_amount: Optional[float] = None

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