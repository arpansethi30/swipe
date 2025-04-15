import os
import json
import requests
import logging
from bs4 import BeautifulSoup
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('card-scraper')

class CardScraper:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        self.cards_file = os.path.join(self.data_dir, 'cards.json')
        self.offers_file = os.path.join(self.data_dir, 'card_offers.json')
        self.last_updated_file = os.path.join(self.data_dir, 'last_updated.txt')
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
    
    def fetch_card_data(self):
        """Fetch credit card data from various sources and compile them"""
        logger.info("Starting credit card data fetch...")
        
        cards = []
        
        try:
            # Get existing data if available
            if os.path.exists(self.cards_file):
                with open(self.cards_file, 'r') as f:
                    cards = json.load(f)
                logger.info(f"Loaded {len(cards)} existing cards from local storage")
            
            # Try to fetch cards from GitHub API (credit-card-bonuses-api)
            try:
                github_cards = self._fetch_github_cards()
                if github_cards:
                    logger.info(f"Fetched {len(github_cards)} cards from GitHub API")
                    self._merge_cards(cards, github_cards)
            except Exception as e:
                logger.error(f"Error fetching cards from GitHub: {str(e)}")
            
            # Fetch top credit cards from credit card comparison websites
            try:
                web_cards = self._fetch_web_cards()
                if web_cards:
                    logger.info(f"Fetched {len(web_cards)} cards from web scraping")
                    self._merge_cards(cards, web_cards)
            except Exception as e:
                logger.error(f"Error fetching cards from web: {str(e)}")
            
            # Save updated data
            with open(self.cards_file, 'w') as f:
                json.dump(cards, f, indent=2)
            
            # Update last updated time
            with open(self.last_updated_file, 'w') as f:
                f.write(datetime.now().isoformat())
                
            logger.info(f"Successfully saved {len(cards)} cards to local storage")
            
            return cards
        
        except Exception as e:
            logger.error(f"Error in fetch_card_data: {str(e)}")
            # Return default data or cached data if available
            if os.path.exists(self.cards_file):
                with open(self.cards_file, 'r') as f:
                    return json.load(f)
            return []
    
    def _fetch_github_cards(self):
        """Fetch credit card data from credit-card-bonuses-api GitHub repo"""
        url = "https://raw.githubusercontent.com/andenacitelli/credit-card-bonuses-api/main/exports/data.json"
        response = requests.get(url)
        
        if response.status_code == 200:
            cards_data = response.json()
            # Transform data to our format
            cards = []
            for card in cards_data:
                # Map fields from GitHub data to our format
                try:
                    new_card = {
                        "name": card.get("name", ""),
                        "issuer": card.get("issuer", ""),
                        "network": self._determine_network(card.get("name", "")),
                        "annual_fee": self._extract_annual_fee(card.get("annualFee", "0")),
                        "intro_offer": card.get("bonus", {}).get("text", ""),
                        "bonus_value": self._extract_bonus_value(card.get("bonus", {}).get("text", "")),
                        "categories": self._determine_categories(card),
                        "point_value": self._determine_point_value(card.get("issuer", "")),
                        "image": f"{card.get('issuer', '').lower().replace(' ', '_')}_{card.get('name', '').lower().replace(' ', '_')}.png",
                        "url": card.get("link", ""),
                        "external_id": card.get("id", "")
                    }
                    cards.append(new_card)
                except Exception as e:
                    logger.error(f"Error transforming card {card.get('name', 'unknown')}: {str(e)}")
                    continue
            
            return cards
        else:
            logger.error(f"GitHub API request failed with status code {response.status_code}")
            return []
    
    def _fetch_web_cards(self):
        """Scrape credit card data from popular websites"""
        cards = []
        
        # Define websites to scrape (these would need to be customized based on site structure)
        sites = [
            {"url": "https://www.nerdwallet.com/best/credit-cards/", "parser": self._parse_nerdwallet}
            # Add more sites as needed
        ]
        
        for site in sites:
            try:
                headers = {'User-Agent': self.user_agent}
                response = requests.get(site["url"], headers=headers)
                if response.status_code == 200:
                    site_cards = site["parser"](response.text)
                    if site_cards:
                        cards.extend(site_cards)
                else:
                    logger.error(f"Request to {site['url']} failed with status code {response.status_code}")
            except Exception as e:
                logger.error(f"Error scraping {site['url']}: {str(e)}")
        
        return cards
    
    def _parse_nerdwallet(self, html_content):
        """Parse NerdWallet credit card listings (simplified example)"""
        soup = BeautifulSoup(html_content, 'html.parser')
        cards = []
        
        # This is a simplified example and would need to be adjusted based on actual website structure
        try:
            card_elements = soup.select(".CreditCardCard_cardDetails__ZG8Pp")
            
            for card_elem in card_elements:
                try:
                    name_elem = card_elem.select_one(".CreditCardCard_cardName__Z5U1B")
                    name = name_elem.text.strip() if name_elem else "Unknown Card"
                    
                    issuer_elem = card_elem.select_one(".CreditCardCard_cardIssuer__iV2wT")
                    issuer = issuer_elem.text.strip() if issuer_elem else "Unknown Issuer"
                    
                    offer_elem = card_elem.select_one(".CreditCardCard_cardReward__NJaQn")
                    intro_offer = offer_elem.text.strip() if offer_elem else ""
                    
                    fee_elem = card_elem.select_one(".CreditCardCard_cardFee__aJlqH")
                    fee_text = fee_elem.text.strip() if fee_elem else "$0"
                    annual_fee = self._extract_annual_fee(fee_text)
                    
                    # Create card object
                    card = {
                        "name": name,
                        "issuer": issuer,
                        "network": self._determine_network(name),
                        "annual_fee": annual_fee,
                        "intro_offer": intro_offer,
                        "bonus_value": self._extract_bonus_value(intro_offer),
                        "categories": self._determine_categories_from_text(intro_offer),
                        "point_value": self._determine_point_value(issuer),
                        "image": f"{issuer.lower().replace(' ', '_')}_{name.lower().replace(' ', '_')}.png"
                    }
                    
                    cards.append(card)
                except Exception as e:
                    logger.error(f"Error parsing card element: {str(e)}")
                    continue
        except Exception as e:
            logger.error(f"Error in NerdWallet parser: {str(e)}")
        
        return cards
    
    def _merge_cards(self, existing_cards, new_cards):
        """Merge new cards with existing ones, updating if needed"""
        existing_card_names = {card["name"].lower(): i for i, card in enumerate(existing_cards)}
        
        for new_card in new_cards:
            # Check if card exists by name
            name_key = new_card["name"].lower()
            if name_key in existing_card_names:
                # Update existing card
                idx = existing_card_names[name_key]
                for key, value in new_card.items():
                    if value and value != existing_cards[idx].get(key, ""):
                        existing_cards[idx][key] = value
            else:
                # Add new card
                existing_cards.append(new_card)
                existing_card_names[name_key] = len(existing_cards) - 1
    
    def _determine_network(self, card_name):
        """Determine the card network based on name"""
        card_name_lower = card_name.lower()
        if "visa" in card_name_lower:
            return "Visa"
        elif "mastercard" in card_name_lower:
            return "Mastercard"
        elif "amex" in card_name_lower or "american express" in card_name_lower:
            return "American Express"
        elif "discover" in card_name_lower:
            return "Discover"
        else:
            # Default assignment based on issuer patterns
            if "chase" in card_name_lower:
                return "Visa"
            elif "citi" in card_name_lower:
                return "Mastercard"
            elif "capital one" in card_name_lower:
                return "Visa"
            else:
                return "Unknown"
    
    def _extract_annual_fee(self, fee_text):
        """Extract annual fee as a number from text"""
        try:
            if not fee_text or fee_text.lower() == "no annual fee":
                return 0
            
            # Extract digits
            import re
            fee_numbers = re.findall(r'\d+', fee_text)
            if fee_numbers:
                return int(fee_numbers[0])
            return 0
        except Exception:
            return 0
    
    def _extract_bonus_value(self, bonus_text):
        """Extract estimated bonus value from text"""
        try:
            if not bonus_text:
                return 0
                
            # Look for patterns like "50,000 points" or "$200 cash back"
            import re
            
            # Cash match
            cash_match = re.search(r'\$(\d{1,3}(?:,\d{3})*)', bonus_text)
            if cash_match:
                return int(cash_match.group(1).replace(',', ''))
            
            # Points match
            points_match = re.search(r'(\d{1,3}(?:,\d{3})*)\s*(?:points|miles|bonus points)', bonus_text, re.IGNORECASE)
            if points_match:
                points = int(points_match.group(1).replace(',', ''))
                # Estimate 1 cent per point as default
                return points / 100
                
            return 0
        except Exception:
            return 0
    
    def _determine_categories(self, card_data):
        """Determine reward categories from card data"""
        # This would need to be customized based on the data source
        # For now, returning a generic structure
        return {
            "other": 1  # Base 1% on everything
        }
    
    def _determine_categories_from_text(self, text):
        """Extract likely reward categories from descriptive text"""
        categories = {"other": 1}  # Base 1% on everything
        
        # Define category keywords
        category_patterns = {
            "travel": ["travel", "airline", "hotel", "flight"],
            "dining": ["dining", "restaurant", "food"],
            "groceries": ["grocery", "groceries", "supermarket"],
            "gas": ["gas", "fuel", "station"],
            "entertainment": ["entertainment", "movie", "theater"],
            "streaming": ["streaming", "netflix", "spotify", "hulu"],
            "transit": ["transit", "commute", "train", "subway"],
            "amazon": ["amazon"],
            "wholesale_clubs": ["costco", "sam's club", "wholesale"]
        }
        
        text_lower = text.lower()
        
        # Check for percentages followed by categories
        import re
        percentage_matches = re.finditer(r'(\d+)%\s+(?:cash\s*back|back|rewards?|points?|miles?)\s+(?:on|for|in|at)\s+([^\.;,]+)', text_lower)
        
        for match in percentage_matches:
            percentage = int(match.group(1))
            category_text = match.group(2).strip()
            
            # Check which category this matches
            matched_category = None
            for category, keywords in category_patterns.items():
                if any(keyword in category_text for keyword in keywords):
                    matched_category = category
                    break
            
            # If we found a matching category, add it
            if matched_category:
                categories[matched_category] = percentage
        
        return categories
    
    def _determine_point_value(self, issuer):
        """Determine estimated point value based on issuer"""
        issuer_lower = issuer.lower()
        
        if "chase" in issuer_lower:
            return 0.0125  # Chase Ultimate Rewards
        elif "american express" in issuer_lower or "amex" in issuer_lower:
            return 0.02  # Amex Membership Rewards
        elif "capital one" in issuer_lower:
            return 0.0175  # Capital One miles
        elif "discover" in issuer_lower:
            return 0.01  # Cash back
        elif "citi" in issuer_lower:
            return 0.01  # Citi ThankYou Points (base value)
        else:
            return 0.01  # Default to 1 cent per point
    
    def is_data_stale(self, max_age_days=1):
        """Check if the card data needs to be refreshed"""
        if not os.path.exists(self.last_updated_file):
            return True
            
        try:
            with open(self.last_updated_file, 'r') as f:
                last_updated_str = f.read().strip()
                last_updated = datetime.fromisoformat(last_updated_str)
                age = datetime.now() - last_updated
                return age.days >= max_age_days
        except Exception:
            return True
    
    def get_card_data(self, force_refresh=False):
        """Get card data, refreshing if needed"""
        if force_refresh or self.is_data_stale():
            return self.fetch_card_data()
        elif os.path.exists(self.cards_file):
            with open(self.cards_file, 'r') as f:
                return json.load(f)
        else:
            return self.fetch_card_data()

# Test the scraper if run directly
if __name__ == "__main__":
    scraper = CardScraper()
    cards = scraper.get_card_data(force_refresh=True)
    print(f"Fetched {len(cards)} cards")
    for i, card in enumerate(cards[:5]):
        print(f"{i+1}. {card['name']} - {card['issuer']} - ${card['annual_fee']}/year") 