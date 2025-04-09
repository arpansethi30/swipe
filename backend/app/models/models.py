from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, Boolean, Date, create_engine, Text, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    issuer = Column(String)
    last_four = Column(String)
    annual_fee = Column(Float, default=0.0)
    image_url = Column(String, nullable=True)
    has_foreign_transaction_fee = Column(Boolean, default=True)
    foreign_transaction_fee_percent = Column(Float, nullable=True, default=3.0)
    sign_up_bonus = Column(String, nullable=True)
    sign_up_bonus_value = Column(Float, default=0.0)
    sign_up_spend_requirement = Column(Float, nullable=True)
    sign_up_timeframe_days = Column(Integer, nullable=True)
    
    # New fields
    card_network = Column(String, nullable=True)  # Visa, Mastercard, Amex, Discover
    card_type = Column(String, nullable=True)  # Credit, Charge, Debit
    reward_type = Column(String, nullable=True)  # Cash back, Points, Miles, etc.
    points_value_cents = Column(Float, nullable=True)  # Value of 1 point in cents
    intro_apr = Column(String, nullable=True)  # Intro APR offer
    intro_apr_duration = Column(Integer, nullable=True)  # Duration in months
    regular_apr_low = Column(Float, nullable=True)  # Low end of APR range
    regular_apr_high = Column(Float, nullable=True)  # High end of APR range
    credit_score_recommended = Column(String, nullable=True)  # Excellent, Good, etc.
    annual_credits = Column(Float, nullable=True)  # Total value of annual credits
    additional_benefits = Column(Text, nullable=True)  # Description of other benefits
    
    rewards = relationship("CardReward", back_populates="card")
    limited_time_offers = relationship("LimitedTimeOffer", back_populates="card")
    card_benefits = relationship("CardBenefit", back_populates="card")

class CardReward(Base):
    __tablename__ = "card_rewards"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"))
    category = Column(String, index=True)
    subcategory = Column(String, nullable=True)
    reward_percentage = Column(Float)
    is_rotating = Column(Boolean, default=False)
    quarter = Column(Integer, nullable=True)  # 1-4 for quarterly categories
    max_spend = Column(Float, nullable=True)  # Spending cap if applicable
    
    # New fields
    reward_points = Column(Float, nullable=True)  # Number of points per dollar
    reward_miles = Column(Float, nullable=True)  # Number of miles per dollar
    merchant_restrictions = Column(Text, nullable=True)  # Restrictions on where reward applies
    spend_threshold = Column(Float, nullable=True)  # Minimum spend for this reward to apply
    activation_required = Column(Boolean, default=False)  # Does the category need activation
    payment_method_requirement = Column(String, nullable=True)  # Mobile wallet, contactless, etc.
    redemption_options = Column(Text, nullable=True)  # How rewards can be redeemed
    
    card = relationship("Card", back_populates="rewards")

class LimitedTimeOffer(Base):
    __tablename__ = "limited_time_offers"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"))
    description = Column(String)
    category = Column(String)
    reward_percentage = Column(Float)
    start_date = Column(Date)
    end_date = Column(Date)
    
    # New fields
    merchant_name = Column(String, nullable=True)  # Specific merchant if applicable
    max_reward = Column(Float, nullable=True)  # Maximum reward amount
    min_spend = Column(Float, nullable=True)  # Minimum spend to qualify
    coupon_code = Column(String, nullable=True)  # Coupon code if needed
    activation_method = Column(String, nullable=True)  # How to activate this offer
    exclusions = Column(Text, nullable=True)  # Exclusions to the offer
    
    card = relationship("Card", back_populates="limited_time_offers")

class CardBenefit(Base):
    __tablename__ = "card_benefits"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"))
    benefit_name = Column(String)
    benefit_description = Column(Text)
    benefit_value = Column(Float, nullable=True)  # Estimated annual value
    benefit_category = Column(String)  # Travel, Shopping, Insurance, etc.
    
    card = relationship("Card", back_populates="card_benefits")

class Retailer(Base):
    __tablename__ = "retailers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    domain_pattern = Column(String)
    category = Column(String)
    subcategory = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    
    # New fields
    special_reward_cards = Column(Text, nullable=True)  # Cards with special rewards here
    average_transaction = Column(Float, nullable=True)  # Average transaction amount
    
    # Many retailers can have alternate domain patterns (e.g., amazon.com, amazon.co.uk)
    alternate_domains = relationship("RetailerDomain", back_populates="retailer")

class RetailerDomain(Base):
    __tablename__ = "retailer_domains"
    
    id = Column(Integer, primary_key=True, index=True)
    retailer_id = Column(Integer, ForeignKey("retailers.id"))
    domain_pattern = Column(String)
    
    retailer = relationship("Retailer", back_populates="alternate_domains")

# Create database engine
engine = create_engine("sqlite:///./swipe.db", connect_args={"check_same_thread": False})

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine) 