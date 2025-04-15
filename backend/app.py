from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Debug route to test the API is working
@app.route('/', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Swipe Credit Card Recommender API!"})

# Hardcoded credit card data
CREDIT_CARDS = [
    {
        "id": 1,
        "name": "Chase Sapphire Preferred",
        "image": "chase_sapphire_preferred.png",
        "categories": {
            "travel": 5,
            "dining": 3,
            "streaming": 3,
            "online_grocery": 3,
            "other": 1
        }
    },
    {
        "id": 2,
        "name": "Amex Gold Card",
        "image": "amex_gold.png",
        "categories": {
            "dining": 4,
            "groceries": 4,
            "travel": 3,
            "other": 1
        }
    },
    {
        "id": 3,
        "name": "Citi Double Cash",
        "image": "citi_double_cash.png",
        "categories": {
            "other": 2
        }
    },
    {
        "id": 4,
        "name": "Capital One Venture",
        "image": "capital_one_venture.png",
        "categories": {
            "travel": 5,
            "other": 2
        }
    },
    {
        "id": 5,
        "name": "Discover It Cash Back",
        "image": "discover_it.png",
        "categories": {
            "rotating": 5,
            "other": 1
        }
    },
    {
        "id": 6,
        "name": "Bank of America Cash Rewards",
        "image": "bofa_cash_rewards.png",
        "categories": {
            "choice_category": 3,
            "groceries": 2,
            "other": 1
        }
    },
    {
        "id": 7,
        "name": "Amazon Prime Rewards",
        "image": "amazon_prime.png",
        "categories": {
            "amazon": 5,
            "whole_foods": 5,
            "dining": 2,
            "gas": 2,
            "other": 1
        }
    },
    {
        "id": 8,
        "name": "Apple Card",
        "image": "apple_card.png",
        "categories": {
            "apple": 3,
            "apple_pay": 2,
            "other": 1
        }
    },
    {
        "id": 9,
        "name": "Wells Fargo Active Cash",
        "image": "wells_fargo_active_cash.png",
        "categories": {
            "other": 2
        }
    },
    {
        "id": 10,
        "name": "U.S. Bank Cash+",
        "image": "us_bank_cash_plus.png",
        "categories": {
            "choice_category_1": 5,
            "choice_category_2": 5,
            "groceries": 2,
            "other": 1
        }
    }
]

# Merchant to category mapping
MERCHANT_CATEGORIES = {
    "amazon": "amazon",
    "whole foods": "whole_foods",
    "walmart": "groceries",
    "target": "groceries",
    "kroger": "groceries",
    "safeway": "groceries",
    "trader joe's": "groceries",
    "uber": "travel",
    "lyft": "travel",
    "expedia": "travel",
    "booking.com": "travel",
    "airbnb": "travel",
    "marriott": "travel",
    "hilton": "travel",
    "mcdonald's": "dining",
    "starbucks": "dining",
    "chipotle": "dining",
    "doordash": "dining",
    "grubhub": "dining",
    "apple": "apple",
    "best buy": "electronics",
    "costco": "wholesale_club",
    "exxon": "gas",
    "shell": "gas",
    "chevron": "gas",
    "bp": "gas",
    "netflix": "streaming",
    "hulu": "streaming",
    "spotify": "streaming",
    "disney+": "streaming"
}

@app.route('/api/recommend', methods=['POST'])
def recommend_card():
    # Debug print
    print("Received request:", request)
    print("Request JSON:", request.get_json())
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
            
        merchant = data.get('merchant', '').lower()
        purchase_amount = data.get('amount', 0)
        
        print(f"Processing request for merchant: {merchant}, amount: {purchase_amount}")
        
        # Default category if merchant not found
        category = 'other'
        
        # Look for merchant in our mapping
        for key, value in MERCHANT_CATEGORIES.items():
            if key in merchant:
                category = value
                break
        
        # Find the best cards for this category
        recommended_cards = []
        for card in CREDIT_CARDS:
            reward_percentage = card['categories'].get(category, card['categories'].get('other', 0))
            cashback = (purchase_amount * reward_percentage) / 100
            
            recommended_cards.append({
                'id': card['id'],
                'name': card['name'],
                'image': card['image'],
                'reward_percentage': reward_percentage,
                'cashback': round(cashback, 2)
            })
        
        # Sort by reward percentage, highest first
        recommended_cards.sort(key=lambda x: x['reward_percentage'], reverse=True)
        
        response_data = {
            'merchant': merchant,
            'category': category,
            'purchase_amount': purchase_amount,
            'recommendations': recommended_cards[:3]
        }
        
        print("Sending response:", response_data)
        return jsonify(response_data)
    except Exception as e:
        print("Error processing request:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5001) 