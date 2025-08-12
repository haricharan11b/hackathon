import re
import requests
from newspaper import Article
from langdetect import detect
import spacy
from typing import Optional
import logging
import os
from google.cloud import translate_v2 as translate

logger = logging.getLogger(__name__)

class TextProcessor:
    def __init__(self):
        self.google_translate_api_key = os.getenv('GOOGLE_TRANSLATE_API_KEY')
        
        # Initialize spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Initialize Google Translate client
        if self.google_translate_api_key:
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = self.google_translate_api_key
            try:
                self.translate_client = translate.Client()
            except Exception as e:
                logger.warning(f"Google Translate client initialization failed: {str(e)}")
                self.translate_client = None
        else:
            self.translate_client = None
    
    def extract_article_text(self, url: str) -> str:
        """Extract main text content from article URL"""
        try:
            article = Article(url)
            article.download()
            article.parse()
            
            # Get the main text content
            text = article.text
            
            if not text or len(text.strip()) < 50:
                raise ValueError("Article text too short or empty")
            
            # Clean up the text
            text = self._clean_text(text)
            
            logger.info(f"Successfully extracted {len(text)} characters from {url}")
            return text
            
        except Exception as e:
            logger.error(f"Failed to extract article from {url}: {str(e)}")
            raise ValueError(f"Could not extract article content from URL: {str(e)}")
    
    def detect_language(self, text: str) -> str:
        """Detect the language of the input text"""
        try:
            if len(text.strip()) < 10:
                return 'en'  # Default to English for very short texts
            
            detected = detect(text)
            logger.info(f"Detected language: {detected}")
            return detected
            
        except Exception as e:
            logger.warning(f"Language detection failed: {str(e)}")
            return 'en'  # Default to English
    
    def translate_text(self, text: str, target_language: str = 'en', source_language: str = 'auto') -> str:
        """Translate text using Google Translate API"""
        if not text or target_language == source_language:
            return text
        
        try:
            if self.translate_client:
                # Use Google Translate API
                result = self.translate_client.translate(
                    text,
                    target_language=target_language,
                    source_language=source_language if source_language != 'auto' else None
                )
                
                translated_text = result['translatedText']
                logger.info(f"Translated text from {source_language} to {target_language}")
                return translated_text
            else:
                # Fallback: return original text if translation not available
                logger.warning("Google Translate not available, returning original text")
                return text
                
        except Exception as e:
            logger.error(f"Translation failed: {str(e)}")
            return text  # Return original text on failure
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess text for AI analysis"""
        try:
            # Basic cleaning
            cleaned_text = self._clean_text(text)
            
            # Use spaCy for advanced preprocessing if available
            if self.nlp:
                doc = self.nlp(cleaned_text)
                
                # Extract meaningful tokens (remove stop words, punctuation)
                meaningful_tokens = []
                for token in doc:
                    if not token.is_stop and not token.is_punct and not token.is_space:
                        meaningful_tokens.append(token.lemma_.lower())
                
                # Reconstruct text with meaningful tokens
                if meaningful_tokens:
                    processed_text = ' '.join(meaningful_tokens)
                else:
                    processed_text = cleaned_text
            else:
                processed_text = cleaned_text
            
            # Ensure reasonable length
            if len(processed_text) > 1000:
                processed_text = processed_text[:1000] + "..."
            
            return processed_text
            
        except Exception as e:
            logger.error(f"Text preprocessing failed: {str(e)}")
            return self._clean_text(text)  # Fallback to basic cleaning
    
    def _clean_text(self, text: str) -> str:
        """Basic text cleaning"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Trim and return
        return text.strip()
    
    def extract_key_phrases(self, text: str) -> list:
        """Extract key phrases from text using spaCy"""
        if not self.nlp:
            return []
        
        try:
            doc = self.nlp(text)
            
            # Extract noun phrases
            noun_phrases = [chunk.text.lower() for chunk in doc.noun_chunks]
            
            # Extract named entities
            entities = [ent.text.lower() for ent in doc.ents]
            
            # Combine and deduplicate
            key_phrases = list(set(noun_phrases + entities))
            
            # Filter out very short phrases
            key_phrases = [phrase for phrase in key_phrases if len(phrase.split()) >= 2]
            
            return key_phrases[:10]  # Return top 10 key phrases
            
        except Exception as e:
            logger.error(f"Key phrase extraction failed: {str(e)}")
            return []
    
    def is_url(self, text: str) -> bool:
        """Check if text is a URL"""
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        return url_pattern.match(text.strip()) is not None
    
    def sanitize_input(self, text: str) -> str:
        """Sanitize user input for security"""
        if not text:
            return ""
        
        # Remove potential script tags
        text = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove other potentially dangerous HTML tags
        dangerous_tags = ['script', 'iframe', 'object', 'embed', 'form']
        for tag in dangerous_tags:
            text = re.sub(f'<{tag}.*?</{tag}>', '', text, flags=re.DOTALL | re.IGNORECASE)
            text = re.sub(f'<{tag}.*?>', '', text, flags=re.IGNORECASE)
        
        # Limit length
        if len(text) > 5000:
            text = text[:5000]
        
        return text.strip()