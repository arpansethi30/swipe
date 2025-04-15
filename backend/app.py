import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from recommender import CardRecommender
from card_scraper import CardScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('api.log')
    ]
)
logger = logging.getLogger('swipe-api')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the recommender and scraper
recommender = CardRecommender()
scraper = CardScraper()

# Setup static file directory for card images
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

CARD_IMAGES_DIR = os.path.join(STATIC_DIR, 'card-images')
if not os.path.exists(CARD_IMAGES_DIR):
    os.makedirs(CARD_IMAGES_DIR)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    try:
        # Get request data
        if not request.is_json:
            logger.warning("Request doesn't contain JSON data")
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.json
        logger.info(f"Received request: {data}")
        
        # Validate required fields
        if 'merchant' not in data or 'amount' not in data:
            logger.warning("Missing required fields in request")
            return jsonify({"error": "Missing required field: merchant or amount"}), 400
            
        merchant = data['merchant']
        amount = float(data['amount'])
        
        # Get optional user preferences if provided
        user_preferences = data.get('user_preferences', None)
        
        logger.info(f"Processing request for merchant: {merchant}, amount: {amount}")
        
        # Get recommendations using our enhanced recommender
        response = recommender.get_recommendations(merchant, amount, user_preferences)
        
        logger.info(f"Sending response with {len(response['recommendations'])} recommendations")
        return jsonify(response)
        
    except Exception as e:
        # Log the error and return a generic error message
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/cards', methods=['GET'])
def get_all_cards():
    """Return all available credit cards with their details"""
    try:
        # Get the cards from our scraper
        cards = scraper.get_card_data()
        return jsonify({"cards": cards})
    except Exception as e:
        logger.error(f"Error getting all cards: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to retrieve cards"}), 500

@app.route('/api/card/<card_id>', methods=['GET'])
def get_card_details(card_id):
    """Get detailed information about a specific card"""
    try:
        card_details = recommender.get_card_details(card_id)
        if card_details:
            return jsonify(card_details)
        else:
            return jsonify({"error": "Card not found"}), 404
    except Exception as e:
        logger.error(f"Error getting card details: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to retrieve card details"}), 500

@app.route('/api/merchant-categories', methods=['GET'])
def get_merchant_categories():
    """Return all merchant categories"""
    try:
        return jsonify(recommender.merchant_categories)
    except Exception as e:
        logger.error(f"Error getting merchant categories: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to retrieve merchant categories"}), 500

@app.route('/api/quarterly-categories', methods=['GET'])
def get_quarterly_categories():
    """Return current quarterly bonus categories for various cards"""
    try:
        return jsonify(recommender.quarterly_categories)
    except Exception as e:
        logger.error(f"Error getting quarterly categories: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to retrieve quarterly categories"}), 500

@app.route('/api/refresh-card-data', methods=['POST'])
def refresh_card_data():
    """Force refresh of card data from external sources"""
    try:
        cards = scraper.get_card_data(force_refresh=True)
        return jsonify({
            "success": True,
            "message": f"Successfully refreshed data for {len(cards)} cards",
            "last_updated": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error refreshing card data: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to refresh card data"}), 500

@app.route('/api/search', methods=['GET'])
def search_cards():
    """Search for cards by name, issuer, category, etc."""
    try:
        query = request.args.get('q', '').lower()
        if not query:
            return jsonify({"error": "Query parameter 'q' is required"}), 400
            
        cards = scraper.get_card_data()
        
        # Filter cards based on query
        results = []
        for card in cards:
            # Check if query matches card name or issuer
            if (query in card.get('name', '').lower() or 
                query in card.get('issuer', '').lower() or 
                query in card.get('network', '').lower()):
                results.append(card)
        
        return jsonify({"results": results, "count": len(results)})
    except Exception as e:
        logger.error(f"Error searching cards: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to search cards"}), 500

@app.route('/api/images/<path:filename>')
def get_card_image(filename):
    """Serve card images from the static directory"""
    return send_from_directory(CARD_IMAGES_DIR, filename)

@app.route('/api/test-recommendation', methods=['GET'])
def test_recommendation():
    """Generate test recommendations for a sample purchase"""
    merchant = request.args.get('merchant', 'Amazon')
    amount = float(request.args.get('amount', '50.0'))
    
    try:
        response = recommender.get_recommendations(merchant, amount)
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in test recommendation: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate test recommendation"}), 500

@app.route('/ping', methods=['GET'])
def ping():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    })

@app.route('/')
def home():
    """Home page with API information"""
    return """
    <html>
    <head>
        <title>Swipe Credit Card Recommender API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #0066FF; }
            code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 4px; }
            pre { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
            .endpoint { margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <h1>Swipe Credit Card Recommender API</h1>
        <p>Welcome to the Swipe Credit Card Recommender API! This API provides recommendations for the best credit cards to use for different merchants and purchase amounts.</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
            <h3>GET /ping</h3>
            <p>Health check endpoint</p>
        </div>
        
        <div class="endpoint">
            <h3>POST /api/recommend</h3>
            <p>Get credit card recommendations for a specific merchant and purchase amount</p>
            <pre>{
  "merchant": "Amazon",
  "amount": 50.0,
  "user_preferences": {
    "preferred_issuers": ["Chase", "Amex"],
    "preferred_networks": ["Visa"],
    "max_annual_fee": 95
  }
}</pre>
        </div>
        
        <div class="endpoint">
            <h3>GET /api/cards</h3>
            <p>Get all available credit cards</p>
        </div>
        
        <div class="endpoint">
            <h3>GET /api/card/:card_id</h3>
            <p>Get detailed information about a specific card</p>
        </div>
        
        <div class="endpoint">
            <h3>GET /api/merchant-categories</h3>
            <p>Get all merchant categories</p>
        </div>
        
        <div class="endpoint">
            <h3>GET /api/quarterly-categories</h3>
            <p>Get current quarterly bonus categories for various cards</p>
        </div>
        
        <div class="endpoint">
            <h3>POST /api/refresh-card-data</h3>
            <p>Force refresh of card data from external sources</p>
        </div>
        
        <div class="endpoint">
            <h3>GET /api/search?q=:query</h3>
            <p>Search for cards by name, issuer, category, etc.</p>
        </div>
        
        <div class="endpoint">
            <h3>GET /api/test-recommendation</h3>
            <p>Generate test recommendations for a sample purchase</p>
            <p>Optional parameters: <code>merchant</code>, <code>amount</code></p>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    # Make sure we have some initial card data
    try:
        scraper.get_card_data()
    except Exception as e:
        logger.error(f"Error loading initial card data: {str(e)}", exc_info=True)
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=5001, debug=True) 