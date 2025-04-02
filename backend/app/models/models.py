from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, Boolean, Date, create_engine
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
    sign_up_bonus = Column(String, nullable=True)
    sign_up_bonus_value = Column(Float, default=0.0)
    sign_up_spend_requirement = Column(Float, nullable=True)
    sign_up_timeframe_days = Column(Integer, nullable=True)
    
    rewards = relationship("CardReward", back_populates="card")
    limited_time_offers = relationship("LimitedTimeOffer", back_populates="card")

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
    
    card = relationship("Card", back_populates="limited_time_offers")

class Retailer(Base):
    __tablename__ = "retailers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    domain_pattern = Column(String)
    category = Column(String)
    subcategory = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    
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