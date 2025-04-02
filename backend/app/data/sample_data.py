from sqlalchemy.orm import Session
from ..models.models import Card, CardReward, Retailer, LimitedTimeOffer, RetailerDomain
from datetime import date, datetime

def seed_sample_data(db: Session):
    # Clear existing data
    db.query(LimitedTimeOffer).delete()
    db.query(RetailerDomain).delete()
    db.query(CardReward).delete()
    db.query(Card).delete()
    db.query(Retailer).delete()
    
    # Add sample credit cards
    cards = [
        # Card 1: Chase Sapphire Preferred
        Card(
            name="Chase Sapphire Preferred",
            issuer="Chase",
            last_four="1234",
            annual_fee=95.0,
            image_url="https://creditcards.chase.com/K-Marketplace/images/cards/sapphire_preferred_card.png",
            has_foreign_transaction_fee=False,
            sign_up_bonus="60,000 Ultimate Rewards points",
            sign_up_bonus_value=750.0,
            sign_up_spend_requirement=4000.0,
            sign_up_timeframe_days=90
        ),
        
        # Card 2: American Express Gold
        Card(
            name="American Express Gold",
            issuer="American Express",
            last_four="5678",
            annual_fee=250.0,
            image_url="https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/gold-card.png",
            has_foreign_transaction_fee=True,
            sign_up_bonus="60,000 Membership Rewards points",
            sign_up_bonus_value=600.0,
            sign_up_spend_requirement=4000.0,
            sign_up_timeframe_days=180
        ),
        
        # Card 3: Citi Double Cash
        Card(
            name="Citi Double Cash",
            issuer="Citi",
            last_four="9012",
            annual_fee=0.0,
            image_url="https://www.citi.com/CRD/images/cc_doublecash.jpg",
            has_foreign_transaction_fee=True,
            sign_up_bonus=None,
            sign_up_bonus_value=0.0
        ),
        
        # Card 4: Discover it Cash Back
        Card(
            name="Discover it Cash Back",
            issuer="Discover",
            last_four="3456",
            annual_fee=0.0,
            image_url="https://www.discover.com/content/dam/discover/en_us/credit-cards/card-art/discover-it-cash-back-1.png",
            has_foreign_transaction_fee=True,
            sign_up_bonus="Cashback Match for first year",
            sign_up_bonus_value=0.0 # Value depends on spending
        ),
        
        # Card 5: Capital One Venture
        Card(
            name="Capital One Venture",
            issuer="Capital One",
            last_four="7890",
            annual_fee=95.0,
            image_url="https://www.capitalone.com/assets/credit-cards/img/venture-card-art.png",
            has_foreign_transaction_fee=False,
            sign_up_bonus="75,000 miles",
            sign_up_bonus_value=750.0,
            sign_up_spend_requirement=4000.0,
            sign_up_timeframe_days=90
        ),
        
        # Card 6: Chase Freedom Flex
        Card(
            name="Chase Freedom Flex",
            issuer="Chase",
            last_four="2468",
            annual_fee=0.0,
            image_url="https://creditcards.chase.com/K-Marketplace/images/cards/freedom_flex.png",
            has_foreign_transaction_fee=True,
            sign_up_bonus="$200 cash back",
            sign_up_bonus_value=200.0,
            sign_up_spend_requirement=500.0,
            sign_up_timeframe_days=90
        ),
        
        # Card 7: Amazon Prime Rewards Visa
        Card(
            name="Amazon Prime Rewards Visa",
            issuer="Chase",
            last_four="1357",
            annual_fee=0.0, # Requires Prime membership
            image_url="https://creditcards.chase.com/K-Marketplace/images/cards/amazon_prime_visa.png",
            has_foreign_transaction_fee=False,
            sign_up_bonus="$100 Amazon Gift Card",
            sign_up_bonus_value=100.0
        ),
        
        # Card 8: Blue Cash Preferred
        Card(
            name="Blue Cash Preferred",
            issuer="American Express",
            last_four="9753",
            annual_fee=95.0,
            image_url="https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/blue-cash-preferred.png",
            has_foreign_transaction_fee=True,
            sign_up_bonus="$350 statement credit",
            sign_up_bonus_value=350.0,
            sign_up_spend_requirement=3000.0,
            sign_up_timeframe_days=180
        )
    ]
    
    db.add_all(cards)
    db.commit()
    
    # Refresh cards to get IDs
    for card in cards:
        db.refresh(card)
    
    # Add rewards for each card
    rewards = [
        # Chase Sapphire Preferred rewards
        CardReward(card_id=cards[0].id, category="travel", reward_percentage=5.0, subcategory="chase_portal"),
        CardReward(card_id=cards[0].id, category="travel", reward_percentage=2.0),
        CardReward(card_id=cards[0].id, category="dining", reward_percentage=3.0),
        CardReward(card_id=cards[0].id, category="streaming", reward_percentage=3.0),
        CardReward(card_id=cards[0].id, category="grocery", reward_percentage=3.0),
        CardReward(card_id=cards[0].id, category="other", reward_percentage=1.0),
        
        # American Express Gold rewards
        CardReward(card_id=cards[1].id, category="dining", reward_percentage=4.0),
        CardReward(card_id=cards[1].id, category="grocery", reward_percentage=4.0, max_spend=25000.0),
        CardReward(card_id=cards[1].id, category="travel", reward_percentage=3.0, subcategory="flights"),
        CardReward(card_id=cards[1].id, category="other", reward_percentage=1.0),
        
        # Citi Double Cash rewards
        CardReward(card_id=cards[2].id, category="other", reward_percentage=2.0),
        CardReward(card_id=cards[2].id, category="dining", reward_percentage=2.0),
        CardReward(card_id=cards[2].id, category="grocery", reward_percentage=2.0),
        CardReward(card_id=cards[2].id, category="travel", reward_percentage=2.0),
        
        # Discover it Cash Back rewards
        CardReward(card_id=cards[3].id, category="rotating", reward_percentage=5.0, is_rotating=True, quarter=1, max_spend=1500.0, subcategory="grocery"),
        CardReward(card_id=cards[3].id, category="rotating", reward_percentage=5.0, is_rotating=True, quarter=2, max_spend=1500.0, subcategory="gas"),
        CardReward(card_id=cards[3].id, category="rotating", reward_percentage=5.0, is_rotating=True, quarter=3, max_spend=1500.0, subcategory="restaurants"),
        CardReward(card_id=cards[3].id, category="rotating", reward_percentage=5.0, is_rotating=True, quarter=4, max_spend=1500.0, subcategory="amazon"),
        CardReward(card_id=cards[3].id, category="other", reward_percentage=1.0),
        
        # Capital One Venture rewards
        CardReward(card_id=cards[4].id, category="travel", reward_percentage=5.0, subcategory="hotels_rental_cars"),
        CardReward(card_id=cards[4].id, category="other", reward_percentage=2.0),
        
        # Chase Freedom Flex rewards
        CardReward(card_id=cards[5].id, category="dining", reward_percentage=3.0),
        CardReward(card_id=cards[5].id, category="drugstores", reward_percentage=3.0),
        CardReward(card_id=cards[5].id, category="rotating", reward_percentage=5.0, is_rotating=True, max_spend=1500.0),
        CardReward(card_id=cards[5].id, category="travel", reward_percentage=5.0, subcategory="chase_portal"),
        CardReward(card_id=cards[5].id, category="other", reward_percentage=1.0),
        
        # Amazon Prime Rewards Visa
        CardReward(card_id=cards[6].id, category="online_retail", reward_percentage=5.0, subcategory="amazon"),
        CardReward(card_id=cards[6].id, category="online_retail", reward_percentage=5.0, subcategory="whole_foods"),
        CardReward(card_id=cards[6].id, category="dining", reward_percentage=2.0),
        CardReward(card_id=cards[6].id, category="grocery", reward_percentage=2.0),
        CardReward(card_id=cards[6].id, category="gas", reward_percentage=2.0),
        CardReward(card_id=cards[6].id, category="other", reward_percentage=1.0),
        
        # Blue Cash Preferred
        CardReward(card_id=cards[7].id, category="grocery", reward_percentage=6.0, max_spend=6000.0),
        CardReward(card_id=cards[7].id, category="streaming", reward_percentage=6.0),
        CardReward(card_id=cards[7].id, category="transit", reward_percentage=3.0),
        CardReward(card_id=cards[7].id, category="gas", reward_percentage=3.0),
        CardReward(card_id=cards[7].id, category="other", reward_percentage=1.0)
    ]
    
    db.add_all(rewards)
    
    # Add limited time offers
    current_date = date.today()
    three_months_later = date(current_date.year + (0 if current_date.month <= 9 else 1), 
                            ((current_date.month + 3 - 1) % 12) + 1, 
                            min(current_date.day, 28))
    
    limited_offers = [
        # Chase Sapphire Preferred limited offer
        LimitedTimeOffer(
            card_id=cards[0].id,
            description="10% back on Lyft rides",
            category="rideshare",
            reward_percentage=10.0,
            start_date=current_date,
            end_date=three_months_later
        ),
        
        # Amex Gold limited offer
        LimitedTimeOffer(
            card_id=cards[1].id,
            description="5x points at select retailers",
            category="online_retail",
            reward_percentage=5.0,
            start_date=current_date,
            end_date=three_months_later
        ),
        
        # Discover it limited offer (in addition to rotating categories)
        LimitedTimeOffer(
            card_id=cards[3].id,
            description="10% back on PayPal purchases",
            category="online_retail",
            reward_percentage=10.0,
            start_date=current_date,
            end_date=three_months_later
        )
    ]
    
    db.add_all(limited_offers)
    
    # Add major retailers with enhanced data
    retailers = [
        Retailer(name="Amazon", domain_pattern="amazon.com", category="online_retail", 
                logo_url="https://logo.clearbit.com/amazon.com"),
        Retailer(name="Walmart", domain_pattern="walmart.com", category="grocery", 
                subcategory="superstore", logo_url="https://logo.clearbit.com/walmart.com"),
        Retailer(name="Target", domain_pattern="target.com", category="grocery", 
                subcategory="superstore", logo_url="https://logo.clearbit.com/target.com"),
        Retailer(name="Best Buy", domain_pattern="bestbuy.com", category="electronics", 
                logo_url="https://logo.clearbit.com/bestbuy.com"),
        Retailer(name="Uber Eats", domain_pattern="ubereats.com", category="dining", 
                subcategory="delivery", logo_url="https://logo.clearbit.com/ubereats.com"),
        Retailer(name="Grubhub", domain_pattern="grubhub.com", category="dining", 
                subcategory="delivery", logo_url="https://logo.clearbit.com/grubhub.com"),
        Retailer(name="DoorDash", domain_pattern="doordash.com", category="dining", 
                subcategory="delivery", logo_url="https://logo.clearbit.com/doordash.com"),
        Retailer(name="Whole Foods", domain_pattern="wholefoodsmarket.com", category="grocery", 
                subcategory="organic", logo_url="https://logo.clearbit.com/wholefoodsmarket.com"),
        Retailer(name="Apple", domain_pattern="apple.com", category="electronics", 
                subcategory="tech", logo_url="https://logo.clearbit.com/apple.com"),
        Retailer(name="Costco", domain_pattern="costco.com", category="grocery", 
                subcategory="wholesale", logo_url="https://logo.clearbit.com/costco.com"),
        Retailer(name="Home Depot", domain_pattern="homedepot.com", category="home_improvement", 
                logo_url="https://logo.clearbit.com/homedepot.com"),
        Retailer(name="Lowe's", domain_pattern="lowes.com", category="home_improvement", 
                logo_url="https://logo.clearbit.com/lowes.com"),
        Retailer(name="Instacart", domain_pattern="instacart.com", category="grocery", 
                subcategory="delivery", logo_url="https://logo.clearbit.com/instacart.com"),
        Retailer(name="Lyft", domain_pattern="lyft.com", category="rideshare", 
                logo_url="https://logo.clearbit.com/lyft.com"),
        Retailer(name="Uber", domain_pattern="uber.com", category="rideshare", 
                logo_url="https://logo.clearbit.com/uber.com")
    ]
    
    db.add_all(retailers)
    db.commit()
    
    # Refresh retailers to get IDs
    for retailer in retailers:
        db.refresh(retailer)
    
    # Add alternate domains for retailers
    alternate_domains = [
        RetailerDomain(retailer_id=retailers[0].id, domain_pattern="amazon.co.uk"),
        RetailerDomain(retailer_id=retailers[0].id, domain_pattern="amazon.ca"),
        RetailerDomain(retailer_id=retailers[0].id, domain_pattern="amazon.de"),
        RetailerDomain(retailer_id=retailers[0].id, domain_pattern="primevideo.com"),
        RetailerDomain(retailer_id=retailers[1].id, domain_pattern="walmart.ca"),
        RetailerDomain(retailer_id=retailers[2].id, domain_pattern="target.com.au"),
        RetailerDomain(retailer_id=retailers[7].id, domain_pattern="amazon.com/wholefoodsmarket")
    ]
    
    db.add_all(alternate_domains)
    db.commit() 