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
        
        # Load top merchants file for exact domain matching
        self.top_merchants_file = os.path.join(self.data_dir, 'top_merchants.json')
        self.top_merchants = self._load_top_merchants()
        
        # Quarterly bonus categories
        self.quarterly_categories = self._get_quarterly_categories()
    
    def _load_top_merchants(self):
        """Load curated list of top merchant domains"""
        if os.path.exists(self.top_merchants_file):
            try:
                with open(self.top_merchants_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading top merchants: {str(e)}")
        
        # Return empty dict if file doesn't exist or has errors
        return {}
    
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
        # Extract domain for exact matching
        domain = self._extract_domain(merchant_name)
        confidence = "low"
        
        # First try exact domain matching with our top merchants list
        if domain and domain in self.top_merchants:
            merchant_info = self.top_merchants[domain]
            confidence = merchant_info.get("confidence", "medium")
            return {
                "categories": [merchant_info["category"]],
                "name": merchant_info["name"],
                "confidence": confidence
            }
        
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
        
        return {
            "categories": matching_categories,
            "name": merchant_name,
            "confidence": "medium" if len(matching_categories) > 0 else "low"
        }
    
    def _extract_domain(self, merchant_string):
        """Extract domain from a merchant name that might be a URL or contain a domain"""
        # Check if it looks like a domain/URL
        if "." in merchant_string:
            # Try to handle URLs
            if "://" in merchant_string:
                try:
                    # Extract domain from URL
                    parts = merchant_string.split('/')
                    if len(parts) >= 3:
                        domain_part = parts[2].lower()
                        return self._clean_domain(domain_part)
                except:
                    pass
            
            # Check if it's just a domain name
            if "www." in merchant_string or ".com" in merchant_string or ".org" in merchant_string:
                return self._clean_domain(merchant_string)
        
        return None
    
    def _clean_domain(self, domain):
        """Clean up a domain name for standard comparison"""
        domain = domain.lower().strip()
        # Remove protocol
        if "://" in domain:
            domain = domain.split('://', 1)[1]
        # Remove www.
        if domain.startswith('www.'):
            domain = domain[4:]
        # Remove path
        if '/' in domain:
            domain = domain.split('/', 1)[0]
        # Remove port
        if ':' in domain:
            domain = domain.split(':', 1)[0]
        
        return domain
    
    def get_recommendations(self, merchant, amount, user_preferences=None):
        """Get card recommendations for a specific merchant and purchase amount"""
        try:
            # Get merchant categories
            merchant_result = self.determine_merchant_categories(merchant)
            categories = merchant_result["categories"]
            merchant_name = merchant_result["name"]
            confidence = merchant_result["confidence"]
            
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
                
                # Citi Dividend
                elif "citi dividend" in card_name_lower and any(cat in categories for cat in self.quarterly_categories["citi_dividend"]):
                    best_reward_percentage = 5
                    best_category = "quarterly_bonus"
                    explanation = f"5% cash back on quarterly bonus categories (currently: {', '.join(self.quarterly_categories['citi_dividend'])})"
                
                # Calculate cashback amount
                cashback_amount = round(amount * (best_reward_percentage / 100), 2)
                
                # Add score to results
                card_scores.append({
                    "name": card.get("name", "Unknown Card"),
                    "issuer": card.get("issuer", ""),
                    "network": card.get("network", ""),
                    "reward_percentage": best_reward_percentage,
                    "reward_category": best_category,
                    "explanation": explanation,
                    "cashback": cashback_amount,
                    "annual_fee": card.get("annual_fee", 0)
                })
            
            # Apply user preferences if provided
            if user_preferences:
                card_scores = self._apply_user_preferences(card_scores, user_preferences)
            
            # Sort by cashback amount (descending)
            card_scores.sort(key=lambda x: x["cashback"], reverse=True)
            
            # Return results
            return {
                "success": True,
                "merchant": merchant_name,
                "merchant_categories": categories,
                "confidence": confidence,
                "amount": amount,
                "recommendations": card_scores
            }
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}", exc_info=True)
            
            # Return fallback recommendations
            return self._get_fallback_recommendations(amount)
    
    def _apply_user_preferences(self, card_scores, user_preferences):
        """Apply user preferences to filter or adjust card scores"""
        filtered_scores = []
        
        for card in card_scores:
            # Filter by preferred issuers
            if "preferred_issuers" in user_preferences and user_preferences["preferred_issuers"]:
                if card["issuer"] not in user_preferences["preferred_issuers"]:
                    continue
            
            # Filter by preferred networks
            if "preferred_networks" in user_preferences and user_preferences["preferred_networks"]:
                if card["network"] not in user_preferences["preferred_networks"]:
                    continue
            
            # Filter by annual fee
            if "max_annual_fee" in user_preferences and user_preferences["max_annual_fee"] is not None:
                if card["annual_fee"] > user_preferences["max_annual_fee"]:
                    continue
            
            # If it passes all filters, add it to results
            filtered_scores.append(card)
        
        # If no cards passed the filters, return original list
        return filtered_scores if filtered_scores else card_scores
    
    def _get_fallback_recommendations(self, amount):
        """Get fallback recommendations when there's an error"""
        cashback_2percent = round(amount * 0.02, 2)
        cashback_1_5percent = round(amount * 0.015, 2)
        cashback_1percent = round(amount * 0.01, 2)
        
        return {
            "success": True,
            "merchant": "Unknown",
            "merchant_categories": ["other"],
            "confidence": "low",
            "amount": amount,
            "recommendations": [
                {
                    "name": "Citi Double Cash",
                    "issuer": "Citi",
                    "network": "Mastercard",
                    "reward_percentage": 2,
                    "reward_category": "all_purchases",
                    "explanation": "2% back on all purchases (1% when you buy, 1% when you pay)",
                    "cashback": cashback_2percent,
                    "annual_fee": 0
                },
                {
                    "name": "Chase Freedom Unlimited",
                    "issuer": "Chase",
                    "network": "Visa",
                    "reward_percentage": 1.5,
                    "reward_category": "all_purchases",
                    "explanation": "1.5% back on all purchases",
                    "cashback": cashback_1_5percent,
                    "annual_fee": 0
                },
                {
                    "name": "Capital One Quicksilver",
                    "issuer": "Capital One",
                    "network": "Visa",
                    "reward_percentage": 1.5,
                    "reward_category": "all_purchases",
                    "explanation": "1.5% back on all purchases",
                    "cashback": cashback_1_5percent,
                    "annual_fee": 0
                },
                {
                    "name": "Discover it Miles",
                    "issuer": "Discover",
                    "network": "Discover",
                    "reward_percentage": 1.5,
                    "reward_category": "all_purchases",
                    "explanation": "1.5 miles per dollar on all purchases (worth 1.5% cash back)",
                    "cashback": cashback_1_5percent,
                    "annual_fee": 0
                }
            ]
        }
    
    def get_card_details(self, card_id):
        """Get detailed information about a specific card"""
        try:
            # Get all cards
            cards = self.scraper.get_card_data()
            
            # Find card by ID/name
            for card in cards:
                if card.get("id") == card_id or card.get("name").lower() == card_id.lower():
                    return {
                        "success": True,
                        "card": card
                    }
            
            return {"success": False, "error": "Card not found"}
        except Exception as e:
            logger.error(f"Error getting card details: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}

# Test the recommender if run directly
if __name__ == "__main__":
    recommender = CardRecommender()
    recommendations = recommender.get_recommendations("Amazon", 50.0)
    print(f"Recommendations for Amazon purchase of $50.00:")
    for i, card in enumerate(recommendations["recommendations"]):
        print(f"{i+1}. {card['name']} - {card['explanation']} - ${card['cashback']} cash back") 