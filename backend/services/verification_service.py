import os
import requests
import openai
from typing import Dict, List, Any
import time
import logging
from datetime import datetime

from utils.text_processor import TextProcessor
from services.source_checker import SourceChecker

logger = logging.getLogger(__name__)

class VerificationService:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.huggingface_api_key = os.getenv('HUGGINGFACE_API_KEY')
        self.text_processor = TextProcessor()
        self.source_checker = SourceChecker()
        
        # HuggingFace model endpoints
        self.biobert_endpoint = "https://api-inference.huggingface.co/models/dmis-lab/biobert-base-cased-v1.1"
        self.medbert_endpoint = "https://api-inference.huggingface.co/models/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"
    
    def verify_claim(self, input_text: str, language: str = 'auto') -> Dict[str, Any]:
        """Main verification pipeline"""
        start_time = time.time()
        
        try:
            # Step 1: Process input (URL extraction or direct text)
            processed_text = self._process_input(input_text)
            
            # Step 2: Detect language
            detected_language = self.text_processor.detect_language(processed_text)
            
            # Step 3: Translate to English if needed
            if detected_language != 'en':
                processed_text = self.text_processor.translate_text(
                    processed_text, 'en', detected_language
                )
            
            # Step 4: Preprocess text
            clean_text = self.text_processor.preprocess_text(processed_text)
            
            # Step 5: AI-powered classification
            classification_result = self._classify_claim(clean_text)
            
            # Step 6: Check trusted sources
            source_verification = self.source_checker.verify_against_sources(clean_text)
            
            # Step 7: Generate explanation
            explanation = self._generate_explanation(
                clean_text, 
                classification_result, 
                source_verification
            )
            
            # Step 8: Compile final result
            processing_time = round(time.time() - start_time, 1)
            
            result = {
                'verdict': classification_result['verdict'],
                'confidence': classification_result['confidence'],
                'explanation': explanation,
                'citations': source_verification.get('citations', []),
                'language': self._get_language_name(detected_language),
                'model': 'BioBERT + GPT-4',
                'processingTime': f"{processing_time}s",
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Verification completed in {processing_time}s")
            return result
            
        except Exception as e:
            logger.error(f"Error in verification pipeline: {str(e)}")
            raise
    
    def _process_input(self, input_text: str) -> str:
        """Process input - extract article text if URL, otherwise return as-is"""
        if input_text.startswith(('http://', 'https://')):
            return self.text_processor.extract_article_text(input_text)
        return input_text
    
    def _classify_claim(self, text: str) -> Dict[str, Any]:
        """Classify health claim using AI models"""
        try:
            # Try BioBERT first
            biobert_result = self._query_huggingface_model(text, self.biobert_endpoint)
            
            if biobert_result:
                return self._process_biobert_result(biobert_result)
            
            # Fallback to OpenAI GPT
            return self._classify_with_openai(text)
            
        except Exception as e:
            logger.warning(f"AI classification failed, using fallback: {str(e)}")
            return self._classify_with_openai(text)
    
    def _query_huggingface_model(self, text: str, endpoint: str) -> Dict:
        """Query HuggingFace model API"""
        headers = {"Authorization": f"Bearer {self.huggingface_api_key}"}
        
        payload = {
            "inputs": text,
            "parameters": {
                "candidate_labels": ["true", "misleading", "needs review"],
                "multi_label": False
            }
        }
        
        try:
            response = requests.post(endpoint, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"HuggingFace API error: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            logger.warning(f"HuggingFace API request failed: {str(e)}")
            return None
    
    def _process_biobert_result(self, result: Dict) -> Dict[str, Any]:
        """Process BioBERT classification result"""
        if isinstance(result, list) and len(result) > 0:
            top_result = result[0]
            labels = top_result.get('labels', [])
            scores = top_result.get('scores', [])
            
            if labels and scores:
                verdict = labels[0]
                confidence = int(scores[0] * 100)
                
                return {
                    'verdict': verdict,
                    'confidence': confidence
                }
        
        # Fallback if result format is unexpected
        return self._classify_with_openai("")
    
    def _classify_with_openai(self, text: str) -> Dict[str, Any]:
        """Classify using OpenAI GPT as fallback"""
        try:
            prompt = f"""
            As a medical fact-checker, analyze this health claim and classify it as one of:
            - "true": The claim is supported by scientific evidence
            - "misleading": The claim contains false or misleading information
            - "needs review": The claim requires more investigation or context
            
            Health claim: "{text}"
            
            Respond with only the classification and a confidence percentage (0-100).
            Format: verdict|confidence
            Example: misleading|85
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50,
                temperature=0.1
            )
            
            result = response.choices[0].message.content.strip()
            
            if '|' in result:
                verdict, confidence_str = result.split('|')
                confidence = int(confidence_str)
                
                return {
                    'verdict': verdict.strip(),
                    'confidence': confidence
                }
            
        except Exception as e:
            logger.error(f"OpenAI classification failed: {str(e)}")
        
        # Ultimate fallback
        return {
            'verdict': 'needs review',
            'confidence': 50
        }
    
    def _generate_explanation(self, text: str, classification: Dict, sources: Dict) -> str:
        """Generate detailed explanation using OpenAI"""
        try:
            verdict = classification['verdict']
            confidence = classification['confidence']
            citations = sources.get('citations', [])
            
            citation_text = ""
            if citations:
                citation_text = "\n\nRelevant sources found:\n"
                for citation in citations[:3]:  # Use top 3 citations
                    citation_text += f"- {citation['title']} ({citation['source']})\n"
            
            prompt = f"""
            As a medical expert, provide a clear, evidence-based explanation for this health claim classification.
            
            Claim: "{text}"
            Classification: {verdict}
            Confidence: {confidence}%
            {citation_text}
            
            Write a comprehensive but accessible explanation that:
            1. Explains why this claim is classified as "{verdict}"
            2. Provides scientific context and evidence
            3. Uses clear, non-technical language
            4. Mentions relevant health authorities when appropriate
            5. Is 2-3 paragraphs long
            
            Focus on being helpful and educational while maintaining scientific accuracy.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {str(e)}")
            return self._get_fallback_explanation(classification['verdict'])
    
    def _get_fallback_explanation(self, verdict: str) -> str:
        """Fallback explanations when AI generation fails"""
        explanations = {
            'true': "Based on our analysis of current medical literature and trusted health sources, this claim appears to be supported by scientific evidence. However, we recommend consulting with healthcare professionals for personalized medical advice.",
            'misleading': "Our analysis indicates this claim contains misleading or inaccurate information that contradicts established medical knowledge. Please consult reliable health sources and healthcare professionals for accurate information.",
            'needs review': "This claim requires additional investigation and context to determine its accuracy. The available evidence is insufficient or conflicting. We recommend consulting multiple trusted medical sources and healthcare professionals."
        }
        
        return explanations.get(verdict, explanations['needs review'])
    
    def _get_language_name(self, code: str) -> str:
        """Convert language code to readable name"""
        language_names = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'hi': 'Hindi'
        }
        
        return language_names.get(code, 'Unknown')