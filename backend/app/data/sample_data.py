from sqlalchemy.orm import Session
from ..models.models import Card, CardReward, Retailer, RetailerDomain, LimitedTimeOffer, CardBenefit
from datetime import date, timedelta

def populate_sample_data(db: Session):
    """
    Populate the database with sample data for testing and development
    """
    # Clear existing data first to avoid duplicates
    db.query(CardBenefit).delete()
    db.query(LimitedTimeOffer).delete()
    db.query(RetailerDomain).delete()
    db.query(CardReward).delete()
    db.query(Card).delete()
    db.query(Retailer).delete()
    db.commit()
    
    # Add credit cards
    cards = [
        # Card 1: Chase Sapphire Preferred (detailed)
        Card(
            name="Chase Sapphire Preferred",
            issuer="Chase",
            last_four="1234",
            annual_fee=95.0,
            image_url="https://creditcards.chase.com/K-Marketplace/images/cardart/sapphire_preferred_card.png",
            has_foreign_transaction_fee=False,
            foreign_transaction_fee_percent=0.0,
            sign_up_bonus="60,000 points after spending $4,000 in 3 months",
            sign_up_bonus_value=750.0,
            sign_up_spend_requirement=4000.0,
            sign_up_timeframe_days=90,
            card_network="Visa",
            card_type="Travel",
            reward_type="Points",
            points_value_cents=1.25,
            intro_apr=0.0,
            intro_apr_duration=12,
            regular_apr_low=18.24,
            regular_apr_high=25.24,
            credit_score_recommended="Excellent",
            annual_credits=50.0,
            additional_benefits="Primary rental car insurance, Trip cancellation/interruption insurance, Purchase protection"
        ),
        
        # Card 2: American Express Gold (detailed)
        Card(
            name="American Express Gold",
            issuer="American Express",
            last_four="5678",
            annual_fee=250.0,
            image_url="https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/open/category/cardarts/gold-card.png",
            has_foreign_transaction_fee=False,
            foreign_transaction_fee_percent=0.0,
            sign_up_bonus="60,000 Membership Rewards® points after spending $4,000 in 6 months",
            sign_up_bonus_value=600.0,
            sign_up_spend_requirement=4000.0,
            sign_up_timeframe_days=180,
            card_network="American Express",
            card_type="Dining & Travel",
            reward_type="Points",
            points_value_cents=1.0,
            intro_apr=None,
            intro_apr_duration=None,
            regular_apr_low=19.99,
            regular_apr_high=27.99,
            credit_score_recommended="Excellent",
            annual_credits=240.0,
            additional_benefits="$120 Dining Credit, $120 Uber Cash, Baggage insurance"
        ),
        
        # Card 3: Citi Double Cash (detailed)
        Card(
            name="Citi Double Cash",
            issuer="Citi",
            last_four="9012",
            annual_fee=0.0,
            image_url="https://www.citi.com/CRD/images/citi-double-cash-credit-card.jpg",
            has_foreign_transaction_fee=True,
            foreign_transaction_fee_percent=3.0,
            sign_up_bonus=None,
            sign_up_bonus_value=None,
            sign_up_spend_requirement=None,
            sign_up_timeframe_days=None,
            card_network="Mastercard",
            card_type="Cash Back",
            reward_type="Cash Back",
            points_value_cents=1.0,
            intro_apr=0.0,
            intro_apr_duration=18,
            regular_apr_low=17.74,
            regular_apr_high=27.74,
            credit_score_recommended="Good",
            annual_credits=0.0,
            additional_benefits="Lost wallet service, 24/7 customer service"
        ),
        
        # Card 4: Discover it Cash Back (detailed)
        Card(
            name="Discover it Cash Back",
            issuer="Discover",
            last_four="3456",
            annual_fee=0.0,
            image_url="https://www.discover.com/content/dam/discover/en_us/credit-cards/card-art/discover-it-cash-back-card-art.png",
            has_foreign_transaction_fee=False,
            foreign_transaction_fee_percent=0.0,
            sign_up_bonus="Cashback Match - all cash back earned in the first year is matched",
            sign_up_bonus_value=None,
            sign_up_spend_requirement=None,
            sign_up_timeframe_days=365,
            card_network="Discover",
            card_type="Cash Back",
            reward_type="Cash Back",
            points_value_cents=1.0,
            intro_apr=0.0,
            intro_apr_duration=15,
            regular_apr_low=16.24,
            regular_apr_high=27.24,
            credit_score_recommended="Good",
            annual_credits=0.0,
            additional_benefits="Free FICO score, No late fee on first payment"
        ),
        
        # Card 5: Capital One Venture (detailed)
        Card(
            name="Capital One Venture",
            issuer="Capital One",
            last_four="7890",
            annual_fee=95.0,
            image_url="https://ecm.capitalone.com/WCM/card/products/venture-card-art/tablet.png",
            has_foreign_transaction_fee=False,
            foreign_transaction_fee_percent=0.0,
            sign_up_bonus="75,000 miles after spending $4,000 in 3 months",
            sign_up_bonus_value=750.0,
            sign_up_spend_requirement=4000.0,
            sign_up_timeframe_days=90,
            card_network="Visa",
            card_type="Travel",
            reward_type="Miles",
            points_value_cents=1.0,
            intro_apr=None,
            intro_apr_duration=None,
            regular_apr_low=19.99,
            regular_apr_high=26.99,
            credit_score_recommended="Excellent",
            annual_credits=0.0,
            additional_benefits="Global Entry/TSA PreCheck credit, Travel accident insurance"
        ),
        
        # Remaining cards with basic details
        Card(
            name="Amazon Prime Rewards Visa",
            issuer="Chase",
            annual_fee=0.0,
            has_foreign_transaction_fee=False,
            card_network="Visa",
            card_type="Retail",
            reward_type="Cash Back"
        ),
        
        Card(
            name="Chase Freedom Flex",
            issuer="Chase",
            annual_fee=0.0,
            has_foreign_transaction_fee=True,
            foreign_transaction_fee_percent=3.0,
            card_network="Mastercard",
            card_type="Cash Back",
            reward_type="Cash Back"
        ),
        
        Card(
            name="Blue Cash Preferred",
            issuer="American Express",
            annual_fee=95.0,
            has_foreign_transaction_fee=True,
            foreign_transaction_fee_percent=2.7,
            card_network="American Express",
            card_type="Cash Back",
            reward_type="Cash Back"
        ),
        
        Card(
            name="Wells Fargo Active Cash",
            issuer="Wells Fargo",
            annual_fee=0.0,
            has_foreign_transaction_fee=True,
            foreign_transaction_fee_percent=3.0,
            card_network="Visa",
            card_type="Cash Back",
            reward_type="Cash Back"
        ),
        
        Card(
            name="U.S. Bank Altitude Go",
            issuer="U.S. Bank",
            annual_fee=0.0,
            has_foreign_transaction_fee=False,
            card_network="Visa",
            card_type="Dining",
            reward_type="Points"
        )
    ]
    
    db.add_all(cards)
    db.commit()
    
    # Reload cards to get their IDs
    db_cards = {card.name: card for card in db.query(Card).all()}
    
    # Add rewards for each card
    rewards = []
    
    # Chase Sapphire Preferred rewards
    rewards.extend([
        CardReward(card_id=db_cards["Chase Sapphire Preferred"].id, category="travel", reward_percentage=5.0, reward_points=5.0),
        CardReward(card_id=db_cards["Chase Sapphire Preferred"].id, category="dining", reward_percentage=3.0, reward_points=3.0),
        CardReward(card_id=db_cards["Chase Sapphire Preferred"].id, category="streaming", reward_percentage=3.0, reward_points=3.0),
        CardReward(card_id=db_cards["Chase Sapphire Preferred"].id, category="online_grocery", reward_percentage=3.0, reward_points=3.0),
        CardReward(card_id=db_cards["Chase Sapphire Preferred"].id, category="other", reward_percentage=1.0, reward_points=1.0)
    ])
    
    # American Express Gold rewards
    rewards.extend([
        CardReward(card_id=db_cards["American Express Gold"].id, category="dining", reward_percentage=4.0, reward_points=4.0),
        CardReward(card_id=db_cards["American Express Gold"].id, category="grocery", reward_percentage=4.0, reward_points=4.0, max_spend=25000.0),
        CardReward(card_id=db_cards["American Express Gold"].id, category="travel", reward_percentage=3.0, reward_points=3.0, merchant_restrictions="Amex Travel only"),
        CardReward(card_id=db_cards["American Express Gold"].id, category="other", reward_percentage=1.0, reward_points=1.0)
    ])
    
    # Citi Double Cash rewards
    rewards.extend([
        CardReward(card_id=db_cards["Citi Double Cash"].id, category="other", reward_percentage=2.0)
    ])
    
    # Discover it Cash Back rewards
    rewards.extend([
        CardReward(card_id=db_cards["Discover it Cash Back"].id, category="rotating", reward_percentage=5.0, is_rotating=True, quarter=1, activation_required=True, max_spend=1500.0),
        CardReward(card_id=db_cards["Discover it Cash Back"].id, category="other", reward_percentage=1.0)
    ])
    
    # Capital One Venture rewards
    rewards.extend([
        CardReward(card_id=db_cards["Capital One Venture"].id, category="travel", reward_percentage=5.0, reward_miles=5.0, merchant_restrictions="Capital One Travel portal"),
        CardReward(card_id=db_cards["Capital One Venture"].id, category="other", reward_percentage=2.0, reward_miles=2.0)
    ])
    
    # Amazon Prime Rewards Visa rewards
    rewards.extend([
        CardReward(card_id=db_cards["Amazon Prime Rewards Visa"].id, category="online_retail", reward_percentage=5.0, merchant_restrictions="Amazon.com"),
        CardReward(card_id=db_cards["Amazon Prime Rewards Visa"].id, category="grocery", reward_percentage=5.0, merchant_restrictions="Whole Foods"),
        CardReward(card_id=db_cards["Amazon Prime Rewards Visa"].id, category="dining", reward_percentage=2.0),
        CardReward(card_id=db_cards["Amazon Prime Rewards Visa"].id, category="gas", reward_percentage=2.0),
        CardReward(card_id=db_cards["Amazon Prime Rewards Visa"].id, category="other", reward_percentage=1.0)
    ])
    
    # Chase Freedom Flex rewards
    rewards.extend([
        CardReward(card_id=db_cards["Chase Freedom Flex"].id, category="rotating", reward_percentage=5.0, is_rotating=True, quarter=1, activation_required=True, max_spend=1500.0),
        CardReward(card_id=db_cards["Chase Freedom Flex"].id, category="travel", reward_percentage=5.0, merchant_restrictions="Chase Travel Portal"),
        CardReward(card_id=db_cards["Chase Freedom Flex"].id, category="dining", reward_percentage=3.0),
        CardReward(card_id=db_cards["Chase Freedom Flex"].id, category="drugstores", reward_percentage=3.0),
        CardReward(card_id=db_cards["Chase Freedom Flex"].id, category="other", reward_percentage=1.0)
    ])
    
    # Blue Cash Preferred rewards
    rewards.extend([
        CardReward(card_id=db_cards["Blue Cash Preferred"].id, category="grocery", reward_percentage=6.0, max_spend=6000.0),
        CardReward(card_id=db_cards["Blue Cash Preferred"].id, category="streaming", reward_percentage=6.0),
        CardReward(card_id=db_cards["Blue Cash Preferred"].id, category="transit", reward_percentage=3.0),
        CardReward(card_id=db_cards["Blue Cash Preferred"].id, category="gas", reward_percentage=3.0),
        CardReward(card_id=db_cards["Blue Cash Preferred"].id, category="other", reward_percentage=1.0)
    ])
    
    # Wells Fargo Active Cash rewards
    rewards.extend([
        CardReward(card_id=db_cards["Wells Fargo Active Cash"].id, category="other", reward_percentage=2.0)
    ])
    
    # U.S. Bank Altitude Go rewards
    rewards.extend([
        CardReward(card_id=db_cards["U.S. Bank Altitude Go"].id, category="dining", reward_percentage=4.0, reward_points=4.0),
        CardReward(card_id=db_cards["U.S. Bank Altitude Go"].id, category="grocery", reward_percentage=2.0, reward_points=2.0),
        CardReward(card_id=db_cards["U.S. Bank Altitude Go"].id, category="gas", reward_percentage=2.0, reward_points=2.0),
        CardReward(card_id=db_cards["U.S. Bank Altitude Go"].id, category="streaming", reward_percentage=2.0, reward_points=2.0),
        CardReward(card_id=db_cards["U.S. Bank Altitude Go"].id, category="other", reward_percentage=1.0, reward_points=1.0)
    ])
    
    db.add_all(rewards)
    db.commit()
    
    # Add card benefits
    benefits = []
    
    # Chase Sapphire Preferred benefits
    benefits.extend([
        CardBenefit(card_id=db_cards["Chase Sapphire Preferred"].id, benefit_name="Primary Rental Car Insurance", benefit_description="Primary coverage for rental cars", benefit_category="Travel"),
        CardBenefit(card_id=db_cards["Chase Sapphire Preferred"].id, benefit_name="Trip Cancellation Insurance", benefit_description="Up to $10,000 coverage", benefit_value=10000.0, benefit_category="Travel"),
        CardBenefit(card_id=db_cards["Chase Sapphire Preferred"].id, benefit_name="Purchase Protection", benefit_description="120 days against damage or theft", benefit_category="Shopping")
    ])
    
    # American Express Gold benefits
    benefits.extend([
        CardBenefit(card_id=db_cards["American Express Gold"].id, benefit_name="Dining Credit", benefit_description="$10 monthly dining credit", benefit_value=120.0, benefit_category="Dining"),
        CardBenefit(card_id=db_cards["American Express Gold"].id, benefit_name="Uber Cash", benefit_description="$10 monthly Uber credit", benefit_value=120.0, benefit_category="Travel"),
        CardBenefit(card_id=db_cards["American Express Gold"].id, benefit_name="Baggage Insurance", benefit_description="Coverage for lost, damaged, or stolen baggage", benefit_category="Travel")
    ])
    
    # Capital One Venture benefits
    benefits.extend([
        CardBenefit(card_id=db_cards["Capital One Venture"].id, benefit_name="Global Entry/TSA PreCheck Credit", benefit_description="Credit for application fee", benefit_value=100.0, benefit_category="Travel"),
        CardBenefit(card_id=db_cards["Capital One Venture"].id, benefit_name="Travel Accident Insurance", benefit_description="Accident coverage while traveling", benefit_category="Travel")
    ])
    
    db.add_all(benefits)
    db.commit()
    
    # Add limited time offers
    today = date.today()
    
    offers = [
        LimitedTimeOffer(
            card_id=db_cards["Chase Sapphire Preferred"].id,
            description="10% back on hotels booked through Chase Travel",
            reward_percentage=10.0,
            category="travel",
            start_date=today,
            end_date=today + timedelta(days=90),
            merchant_name=None,
            activation_method="Automatic"
        ),
        
        LimitedTimeOffer(
            card_id=db_cards["American Express Gold"].id,
            description="$100 statement credit on eligible dining purchases of $100+",
            reward_percentage=100.0,
            category="dining",
            start_date=today,
            end_date=today + timedelta(days=60),
            merchant_name=None,
            min_spend=100.0,
            max_reward=100.0
        ),
        
        LimitedTimeOffer(
            card_id=db_cards["Discover it Cash Back"].id,
            description="5% cash back on Restaurants & PayPal this quarter",
            reward_percentage=5.0,
            category="dining",
            start_date=today,
            end_date=today + timedelta(days=90),
            activation_method="Registration required"
        ),
        
        LimitedTimeOffer(
            card_id=db_cards["Amazon Prime Rewards Visa"].id,
            description="10% back on Amazon electronics",
            reward_percentage=10.0,
            category="electronics",
            start_date=today,
            end_date=today + timedelta(days=30),
            merchant_name="Amazon.com"
        )
    ]
    
    db.add_all(offers)
    db.commit()
    
    # Add retailers
    retailers = [
        Retailer(
            name="Amazon",
            domain_pattern="amazon.com",
            category="online_retail",
            logo_url="https://logo.clearbit.com/amazon.com",
            special_reward_cards="Amazon Prime Rewards Visa",
            average_transaction=75.0
        ),
        
        Retailer(
            name="Walmart",
            domain_pattern="walmart.com",
            category="grocery",
            subcategory="superstore",
            logo_url="https://logo.clearbit.com/walmart.com",
            average_transaction=120.0
        ),
        
        Retailer(
            name="Target",
            domain_pattern="target.com",
            category="grocery",
            subcategory="superstore",
            logo_url="https://logo.clearbit.com/target.com",
            average_transaction=85.0
        ),
        
        Retailer(
            name="Best Buy",
            domain_pattern="bestbuy.com",
            category="electronics",
            logo_url="https://logo.clearbit.com/bestbuy.com",
            average_transaction=350.0
        ),
        
        Retailer(
            name="Whole Foods",
            domain_pattern="wholefoodsmarket.com",
            category="grocery",
            subcategory="organic",
            logo_url="https://logo.clearbit.com/wholefoodsmarket.com",
            special_reward_cards="Amazon Prime Rewards Visa",
            average_transaction=95.0
        ),
        
        Retailer(
            name="Uber Eats",
            domain_pattern="ubereats.com",
            category="dining",
            subcategory="delivery",
            logo_url="https://logo.clearbit.com/ubereats.com",
            special_reward_cards="American Express Gold",
            average_transaction=35.0
        ),
        
        Retailer(
            name="DoorDash",
            domain_pattern="doordash.com",
            category="dining",
            subcategory="delivery",
            logo_url="https://logo.clearbit.com/doordash.com",
            average_transaction=40.0
        ),
        
        Retailer(
            name="Instacart",
            domain_pattern="instacart.com",
            category="grocery",
            subcategory="delivery",
            logo_url="https://logo.clearbit.com/instacart.com",
            average_transaction=120.0
        ),
        
        Retailer(
            name="Expedia",
            domain_pattern="expedia.com",
            category="travel",
            subcategory="booking",
            logo_url="https://logo.clearbit.com/expedia.com",
            average_transaction=750.0
        ),
        
        Retailer(
            name="Southwest Airlines",
            domain_pattern="southwest.com",
            category="travel",
            subcategory="airline",
            logo_url="https://logo.clearbit.com/southwest.com",
            average_transaction=450.0
        )
    ]
    
    db.add_all(retailers)
    db.commit()
    
    # Get the retailer IDs for alternate domains
    db_retailers = {retailer.name: retailer for retailer in db.query(Retailer).all()}
    
    # Add alternate domains for some retailers
    alternate_domains = [
        RetailerDomain(retailer_id=db_retailers["Amazon"].id, domain_pattern="smile.amazon.com"),
        RetailerDomain(retailer_id=db_retailers["Amazon"].id, domain_pattern="amazon.ca"),
        RetailerDomain(retailer_id=db_retailers["Walmart"].id, domain_pattern="grocery.walmart.com"),
        RetailerDomain(retailer_id=db_retailers["Whole Foods"].id, domain_pattern="amazon.com/wholefoodsmarket"),
        RetailerDomain(retailer_id=db_retailers["Uber Eats"].id, domain_pattern="uber.com/food-delivery")
    ]
    
    db.add_all(alternate_domains)
    db.commit()
    
    print("Sample data populated successfully!")
    return True

def seed_sample_data(db: Session):
    """
    Wrapper function to seed the database with sample data.
    This function is called from main.py on startup.
    """
    print("Seeding sample data...")
    try:
        return populate_sample_data(db)
    except Exception as e:
        print(f"Error seeding data: {e}")
        return False 