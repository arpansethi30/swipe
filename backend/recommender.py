import logging
import json
import os
from datetime import datetime
from card_scraper import CardScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('card-recommender')

class CardRecommender:
    def __init__(self):
        self.scraper = CardScraper()
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        
        # Load merchant categories
        self.merchant_categories_file = os.path.join(self.data_dir, 'merchant_categories.json')
        self.merchant_categories = self._load_merchant_categories()
        
        # Quarterly bonus categories
        self.quarterly_categories = self._get_quarterly_categories()
    
    def _load_merchant_categories(self):
        """Load merchant category mappings"""
        if os.path.exists(self.merchant_categories_file):
            try:
                with open(self.merchant_categories_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading merchant categories: {str(e)}")
        
        # Default merchant categories
        return {
            "travel": ["airline", "hotel", "flight", "expedia", "booking.com", "airbnb", "vrbo", "amtrak", "uber", "lyft", "taxi"],
            "dining": ["restaurant", "doordash", "grubhub", "ubereats", "mcdonalds", "starbucks", "chipotle", "pizza"],
            "groceries": ["grocery", "kroger", "safeway", "publix", "trader joe", "whole foods", "wegmans", "aldi"],
            "gas": ["gas", "shell", "exxon", "chevron", "mobil", "bp", "speedway"],
            "entertainment": ["movie", "theater", "netflix", "hulu", "disney+", "spotify", "apple music", "amc", "regal"],
            "streaming": ["netflix", "hulu", "disney+", "spotify", "apple music", "hbo", "amazon prime"],
            "transit": ["uber", "lyft", "metro", "subway", "bus", "train", "amtrak", "transit"],
            "amazon": ["amazon"],
            "wholesale_clubs": ["costco", "sam's club", "bj's"],
            "online_shopping": ["amazon", "ebay", "etsy", "walmart.com", "target.com", "best buy", "newegg"],
            "department_stores": ["macy's", "nordstrom", "jcpenney", "kohl's"],
            "home_improvement": ["home depot", "lowe's", "ace hardware", "menards"],
            "drugstores": ["cvs", "walgreens", "rite aid", "duane reade"],
            "apple": ["apple store", "apple.com", "itunes"],
            "utilities": ["water bill", "electric bill", "gas bill", "phone bill", "internet bill"],
            "phone": ["verizon", "at&t", "t-mobile", "sprint"],
            "insurance": ["insurance", "geico", "state farm", "progressive", "allstate"]
        }
    
    def _get_quarterly_categories(self):
        """Get current quarterly bonus categories for various cards"""
        current_quarter = self._get_current_quarter()
        
        # These would ideally be updated each quarter
        discover_it_categories = {
            1: ["groceries", "drugstores"],         # Q1 (Jan-Mar)
            2: ["gas", "home_improvement"],         # Q2 (Apr-Jun)
            3: ["dining", "online_shopping"],       # Q3 (Jul-Sep)
            4: ["amazon", "target", "walmart"]      # Q4 (Oct-Dec)
        }
        
        chase_freedom_categories = {
            1: ["groceries", "gas"],                # Q1 (Jan-Mar)
            2: ["online_shopping", "transit"],      # Q2 (Apr-Jun)
            3: ["restaurants", "streaming"],        # Q3 (Jul-Sep)
            4: ["walmart", "amazon", "paypal"]      # Q4 (Oct-Dec)
        }
        
        citi_dividend_categories = {
            1: ["fitness", "drugstores"],           # Q1 (Jan-Mar)
            2: ["home_improvement", "utilities"],   # Q2 (Apr-Jun)
            3: ["airlines", "car_rentals"],         # Q3 (Jul-Sep)
            4: ["department_stores", "amazon"]      # Q4 (Oct-Dec)
        }
        
        return {
            "discover_it": discover_it_categories.get(current_quarter, []),
            "chase_freedom": chase_freedom_categories.get(current_quarter, []),
            "citi_dividend": citi_dividend_categories.get(current_quarter, [])
        }
    
    def _get_current_quarter(self):
        """Get the current quarter (1-4) based on the current date"""
        current_month = datetime.now().month
        if current_month <= 3:
            return 1
        elif current_month <= 6:
            return 2
        elif current_month <= 9:
            return 3
        else:
            return 4
    
    def determine_merchant_categories(self, merchant_name):
        """Determine the categories of a merchant based on its name"""
        # Convert to lowercase for case-insensitive matching
        merchant_lower = merchant_name.lower()
        
        matching_categories = []
        
        # Check each category's keywords
        for category, keywords in self.merchant_categories.items():
            for keyword in keywords:
                if keyword.lower() in merchant_lower:
                    matching_categories.append(category)
                    break  # Only add each category once
        
        # Special case for online retailers
        if not any(cat in ["online_shopping", "shopping"] for cat in matching_categories):
            online_indicators = [".com", "online", "website", "web", "shop", "checkout", "cart"]
            for indicator in online_indicators:
                if indicator in merchant_lower:
                    matching_categories.append("online_shopping")
                    break
        
        # Handle specific merchants with custom category assignments
        merchant_specific_mapping = {
            "amazon": ["amazon", "online_shopping"],
            "walmart": ["groceries", "shopping"],
            "target": ["groceries", "shopping"],
            "costco": ["wholesale_clubs", "groceries"],
            "uber": ["transit"],
            "lyft": ["transit"],
            "netflix": ["streaming"],
            "spotify": ["streaming"],
            "hulu": ["streaming"],
            "starbucks": ["dining"],
            "mcdonalds": ["dining"],
            "delta": ["travel", "airlines"],
            "american airlines": ["travel", "airlines"],
            "united airlines": ["travel", "airlines"],
            "southwest": ["travel", "airlines"],
            "airbnb": ["travel", "lodging"],
            "marriott": ["travel", "lodging"],
            "hilton": ["travel", "lodging"],
            "apple": ["apple", "electronics"]
        }
        
        # Add merchant-specific categories if they exist
        for merchant_keyword, categories in merchant_specific_mapping.items():
            if merchant_keyword in merchant_lower:
                for category in categories:
                    if category not in matching_categories:
                        matching_categories.append(category)
        
        # If no specific category is found, default to "other"
        if not matching_categories:
            matching_categories.append("other")
        
        return matching_categories
    
    def get_recommendations(self, merchant, amount, user_preferences=None):
        """Get card recommendations for a specific merchant and purchase amount"""
        try:
            # Get merchant categories
            categories = self.determine_merchant_categories(merchant)
            
            # Get card data
            cards = self.scraper.get_card_data()
            
            # Score each card based on rewards for this purchase
            card_scores = []
            
            for card in cards:
                # Calculate potential rewards for this purchase
                best_reward_percentage = 1  # Default 1% back
                best_category = "other"
                explanation = "1% cash back on all purchases"
                
                # Check if any card categories match the merchant categories
                card_categories = card.get("categories", {})
                
                for category in categories:
                    # Check if the card has a specific category bonus
                    if category in card_categories:
                        reward_percentage = card_categories[category]
                        if reward_percentage > best_reward_percentage:
                            best_reward_percentage = reward_percentage
                            best_category = category
                            explanation = f"{reward_percentage}% back on {category}"
                
                # Check for quarterly rotating categories (Discover It, Chase Freedom, etc.)
                card_name_lower = card.get("name", "").lower()
                
                # Discover It
                if "discover it" in card_name_lower and any(cat in categories for cat in self.quarterly_categories["discover_it"]):
                    best_reward_percentage = 5
                    best_category = "quarterly_bonus"
                    explanation = f"5% cash back on quarterly bonus categories (currently: {', '.join(self.quarterly_categories['discover_it'])})"
                
                # Chase Freedom
                elif ("chase freedom" in card_name_lower or "freedom flex" in card_name_lower) and any(cat in categories for cat in self.quarterly_categories["chase_freedom"]):
                    best_reward_percentage = 5
                    best_category = "quarterly_bonus"
                    explanation = f"5% cash back on quarterly bonus categories (currently: {', '.join(self.quarterly_categories['chase_freedom'])})"
                
                # Calculate cashback value
                point_value = card.get("point_value", 0.01)
                raw_points = (amount * best_reward_percentage) / 100
                cashback_value = raw_points * point_value
                
                # Adjust for annual fee (prorated daily for comparison purposes)
                annual_fee = card.get("annual_fee", 0)
                daily_fee_cost = annual_fee / 365 if annual_fee > 0 else 0
                
                # Create recommendation object
                recommendation = {
                    "id": card.get("external_id", ""),
                    "name": card.get("name", ""),
                    "issuer": card.get("issuer", ""),
                    "network": card.get("network", ""),
                    "image": card.get("image", ""),
                    "url": card.get("url", ""),
                    "annual_fee": annual_fee,
                    "reward_percentage": best_reward_percentage,
                    "cashback": round(cashback_value, 2),
                    "best_category": best_category,
                    "explanation": explanation,
                    "score": cashback_value - daily_fee_cost,  # Score includes fee adjustment
                    "intro_offer": card.get("intro_offer", ""),
                    "bonus_value": card.get("bonus_value", 0)
                }
                
                card_scores.append(recommendation)
            
            # Sort by score (highest first)
            card_scores.sort(key=lambda x: x["score"], reverse=True)
            
            # Handle user preferences if provided
            if user_preferences:
                card_scores = self._apply_user_preferences(card_scores, user_preferences)
            
            # Create response
            response = {
                "merchant": merchant,
                "merchant_categories": categories,
                "amount": amount,
                "recommendations": card_scores[:5]  # Return top 5 recommendations
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            # Return fallback recommendations
            return {
                "merchant": merchant,
                "merchant_categories": ["other"],
                "amount": amount,
                "recommendations": self._get_fallback_recommendations(amount)
            }
    
    def _apply_user_preferences(self, card_scores, user_preferences):
        """Apply user preferences to card scoring"""
        if not user_preferences:
            return card_scores
        
        # Get user's preferred issuers, networks, annual fee range
        preferred_issuers = user_preferences.get("preferred_issuers", [])
        preferred_networks = user_preferences.get("preferred_networks", [])
        max_annual_fee = user_preferences.get("max_annual_fee", float('inf'))
        
        # Adjust scores based on preferences
        for card in card_scores:
            # Adjust for issuer preference
            if preferred_issuers and card["issuer"] in preferred_issuers:
                card["score"] += 0.5  # Bonus for preferred issuer
            
            # Adjust for network preference
            if preferred_networks and card["network"] in preferred_networks:
                card["score"] += 0.5  # Bonus for preferred network
            
            # Penalize cards with annual fees higher than user's max
            if card["annual_fee"] > max_annual_fee:
                card["score"] -= 10  # Significant penalty to push these cards down
        
        # Re-sort by adjusted score
        card_scores.sort(key=lambda x: x["score"], reverse=True)
        
        return card_scores
    
    def _get_fallback_recommendations(self, amount):
        """Generate fallback recommendations if something fails"""
        # Basic fallback recommendations with popular general-purpose cards
        recommendations = [
            {
                "id": "fallback-1",
                "name": "Citi Double Cash Card",
                "issuer": "Citibank",
                "network": "Mastercard",
                "image": "citibank_citi_double_cash_card.png",
                "annual_fee": 0,
                "reward_percentage": 2.0,
                "cashback": round(amount * 0.02, 2),
                "best_category": "other",
                "explanation": "2% cash back on all purchases (1% when you buy + 1% when you pay)",
                "score": amount * 0.02,
                "intro_offer": "$200 cash back after spending $1,500 in the first 6 months",
                "bonus_value": 200
            },
            {
                "id": "fallback-2",
                "name": "Chase Freedom Unlimited",
                "issuer": "Chase",
                "network": "Visa",
                "image": "chase_chase_freedom_unlimited.png",
                "annual_fee": 0,
                "reward_percentage": 1.5,
                "cashback": round(amount * 0.015, 2),
                "best_category": "other",
                "explanation": "1.5% cash back on all purchases",
                "score": amount * 0.015,
                "intro_offer": "$200 bonus after spending $500 in the first 3 months",
                "bonus_value": 200
            },
            {
                "id": "fallback-3",
                "name": "Capital One Quicksilver Cash",
                "issuer": "Capital One",
                "network": "Visa",
                "image": "capital_one_quicksilver_cash.png",
                "annual_fee": 0,
                "reward_percentage": 1.5,
                "cashback": round(amount * 0.015, 2),
                "best_category": "other",
                "explanation": "1.5% cash back on all purchases",
                "score": amount * 0.015,
                "intro_offer": "$200 cash bonus after spending $500 in the first 3 months",
                "bonus_value": 200
            }
        ]
        
        return recommendations
    
    def get_card_details(self, card_id):
        """Get detailed information about a specific card"""
        try:
            cards = self.scraper.get_card_data()
            
            # Find card by id
            matching_cards = [card for card in cards if card.get("external_id") == card_id]
            
            if matching_cards:
                return matching_cards[0]
            else:
                logger.warning(f"Card with ID {card_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error getting card details: {str(e)}")
            return None

# Test the recommender if run directly
if __name__ == "__main__":
    recommender = CardRecommender()
    recommendations = recommender.get_recommendations("Amazon", 50.0)
    print(f"Recommendations for Amazon purchase of $50.00:")
    for i, card in enumerate(recommendations["recommendations"]):
        print(f"{i+1}. {card['name']} - {card['explanation']} - ${card['cashback']} cash back") 