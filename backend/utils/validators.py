import re
from typing import Dict, Any
import validators

def validate_input(input_text: str) -> Dict[str, Any]:
    """Validate user input for health claim verification"""
    
    if not input_text or not input_text.strip():
        return {
            'valid': False,
            'error': 'Input cannot be empty'
        }
    
    # Check length
    if len(input_text.strip()) < 10:
        return {
            'valid': False,
            'error': 'Input must be at least 10 characters long'
        }
    
    if len(input_text) > 5000:
        return {
            'valid': False,
            'error': 'Input must be less than 5000 characters'
        }
    
    # Check for potentially malicious content
    dangerous_patterns = [
        r'<script.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'onload=',
        r'onerror=',
        r'onclick='
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, input_text, re.IGNORECASE):
            return {
                'valid': False,
                'error': 'Input contains potentially unsafe content'
            }
    
    # If it looks like a URL, validate it
    if input_text.strip().startswith(('http://', 'https://')):
        if not validators.url(input_text.strip()):
            return {
                'valid': False,
                'error': 'Invalid URL format'
            }
    
    return {
        'valid': True,
        'error': None
    }

def validate_language_code(language_code: str) -> bool:
    """Validate language code"""
    valid_codes = [
        'auto', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 
        'zh', 'ja', 'ko', 'ar', 'hi', 'nl', 'sv', 'da', 'no'
    ]
    
    return language_code.lower() in valid_codes

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe file operations"""
    # Remove or replace dangerous characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    
    # Limit length
    if len(filename) > 255:
        filename = filename[:255]
    
    return filename

def validate_api_key(api_key: str) -> bool:
    """Basic API key validation"""
    if not api_key or not isinstance(api_key, str):
        return False
    
    # Basic length check (most API keys are at least 20 characters)
    if len(api_key.strip()) < 20:
        return False
    
    # Check for obvious placeholder values
    placeholder_values = ['your_api_key', 'api_key_here', 'replace_me', 'xxx']
    if api_key.lower().strip() in placeholder_values:
        return False
    
    return True