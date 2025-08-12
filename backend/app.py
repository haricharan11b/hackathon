from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import traceback

# Import our services
from services.verification_service import VerificationService
from services.news_service import NewsService
from utils.text_processor import TextProcessor
from utils.validators import validate_input

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(','))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
verification_service = VerificationService()
news_service = NewsService()
text_processor = TextProcessor()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/verify', methods=['POST'])
def verify_health_claim():
    """Main endpoint for health claim verification"""
    try:
        data = request.get_json()
        
        if not data or 'input' not in data:
            return jsonify({'error': 'Input is required'}), 400
        
        input_text = data['input'].strip()
        language = data.get('language', 'auto')
        
        # Validate input
        validation_result = validate_input(input_text)
        if not validation_result['valid']:
            return jsonify({'error': validation_result['error']}), 400
        
        logger.info(f"Processing verification request: {input_text[:100]}...")
        
        # Process the verification
        result = verification_service.verify_claim(input_text, language)
        
        logger.info(f"Verification completed with verdict: {result['verdict']}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in verify_health_claim: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error occurred during verification',
            'details': str(e) if app.debug else None
        }), 500

@app.route('/api/news', methods=['GET'])
def get_trusted_news():
    """Endpoint for fetching trusted health news"""
    try:
        source = request.args.get('source', 'all')
        limit = int(request.args.get('limit', 10))
        
        logger.info(f"Fetching news from source: {source}, limit: {limit}")
        
        news_articles = news_service.get_latest_news(source, limit)
        
        return jsonify({
            'articles': news_articles,
            'total': len(news_articles),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in get_trusted_news: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch news',
            'articles': [],
            'total': 0
        }), 500

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """Endpoint for text translation"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        target_language = data.get('target_language', 'en')
        source_language = data.get('source_language', 'auto')
        
        translated_text = text_processor.translate_text(text, target_language, source_language)
        
        return jsonify({
            'translated_text': translated_text,
            'source_language': source_language,
            'target_language': target_language
        })
        
    except Exception as e:
        logger.error(f"Error in translate_text: {str(e)}")
        return jsonify({'error': 'Translation failed'}), 500

@app.route('/api/extract', methods=['POST'])
def extract_article_text():
    """Endpoint for extracting text from article URLs"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
        
        url = data['url']
        
        # Validate URL
        if not url.startswith(('http://', 'https://')):
            return jsonify({'error': 'Invalid URL format'}), 400
        
        extracted_text = text_processor.extract_article_text(url)
        
        return jsonify({
            'text': extracted_text,
            'url': url,
            'extracted_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in extract_article_text: {str(e)}")
        return jsonify({'error': 'Failed to extract article text'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)