import requests
import os
from typing import Dict, List, Any
import logging
import time

logger = logging.getLogger(__name__)

class SourceChecker:
    def __init__(self):
        self.google_factcheck_api_key = os.getenv('GOOGLE_FACTCHECK_API_KEY')
        self.who_api_key = os.getenv('WHO_API_KEY')
        self.cdc_api_key = os.getenv('CDC_API_KEY')
        
        # Trusted source endpoints
        self.endpoints = {
            'google_factcheck': 'https://factchecktools.googleapis.com/v1alpha1/claims:search',
            'who_search': 'https://www.who.int/api/search',
            'cdc_search': 'https://search.cdc.gov/api/search'
        }
    
    def verify_against_sources(self, text: str) -> Dict[str, Any]:
        """Verify claim against trusted sources"""
        try:
            citations = []
            
            # Check Google Fact Check Tools
            factcheck_results = self._check_google_factcheck(text)
            citations.extend(factcheck_results)
            
            # Check WHO sources
            who_results = self._check_who_sources(text)
            citations.extend(who_results)
            
            # Check CDC sources
            cdc_results = self._check_cdc_sources(text)
            citations.extend(cdc_results)
            
            # Add some general medical sources
            general_sources = self._get_general_medical_sources(text)
            citations.extend(general_sources)
            
            return {
                'citations': citations[:5],  # Limit to top 5 citations
                'total_sources_checked': len(citations)
            }
            
        except Exception as e:
            logger.error(f"Source verification failed: {str(e)}")
            return {
                'citations': self._get_fallback_citations(),
                'total_sources_checked': 0
            }
    
    def _check_google_factcheck(self, text: str) -> List[Dict[str, Any]]:
        """Check Google Fact Check Tools API"""
        if not self.google_factcheck_api_key:
            return []
        
        try:
            params = {
                'key': self.google_factcheck_api_key,
                'query': text[:100],  # Limit query length
                'languageCode': 'en'
            }
            
            response = requests.get(
                self.endpoints['google_factcheck'], 
                params=params, 
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                claims = data.get('claims', [])
                
                citations = []
                for claim in claims[:3]:  # Top 3 results
                    claim_review = claim.get('claimReview', [{}])[0]
                    
                    citation = {
                        'title': claim.get('text', 'Fact Check Result'),
                        'source': claim_review.get('publisher', {}).get('name', 'Fact Checker'),
                        'url': claim_review.get('url', '#'),
                        'publishedAt': claim_review.get('reviewDate', ''),
                        'summary': f"Fact check rating: {claim_review.get('textualRating', 'Unknown')}"
                    }
                    citations.append(citation)
                
                return citations
            
            return []
            
        except Exception as e:
            logger.warning(f"Google Fact Check API failed: {str(e)}")
            return []
    
    def _check_who_sources(self, text: str) -> List[Dict[str, Any]]:
        """Check WHO sources (mock implementation)"""
        # Note: WHO doesn't have a public search API, so this is a mock
        # In production, you might scrape WHO's website or use their RSS feeds
        
        who_citations = [
            {
                'title': 'WHO Health Topics and Guidelines',
                'source': 'World Health Organization',
                'url': 'https://www.who.int/health-topics',
                'publishedAt': '2024-01-15T00:00:00Z',
                'summary': 'Comprehensive health information and guidelines from the World Health Organization covering various health topics and medical conditions.'
            }
        ]
        
        # Filter based on text content (basic keyword matching)
        keywords = text.lower().split()
        health_keywords = ['vaccine', 'covid', 'health', 'disease', 'treatment', 'medicine', 'nutrition']
        
        if any(keyword in keywords for keyword in health_keywords):
            return who_citations
        
        return []
    
    def _check_cdc_sources(self, text: str) -> List[Dict[str, Any]]:
        """Check CDC sources (mock implementation)"""
        # Note: CDC search API might require special access
        # This is a mock implementation
        
        cdc_citations = [
            {
                'title': 'CDC Health Information and Guidelines',
                'source': 'Centers for Disease Control and Prevention',
                'url': 'https://www.cdc.gov/health-information',
                'publishedAt': '2024-01-15T00:00:00Z',
                'summary': 'Evidence-based health information and recommendations from the Centers for Disease Control and Prevention.'
            }
        ]
        
        # Filter based on text content
        keywords = text.lower().split()
        cdc_keywords = ['vaccine', 'immunization', 'disease', 'prevention', 'outbreak', 'health']
        
        if any(keyword in keywords for keyword in cdc_keywords):
            return cdc_citations
        
        return []
    
    def _get_general_medical_sources(self, text: str) -> List[Dict[str, Any]]:
        """Get general medical sources based on content"""
        general_sources = []
        
        keywords = text.lower()
        
        # Mayo Clinic
        if any(term in keywords for term in ['symptom', 'treatment', 'condition', 'disease']):
            general_sources.append({
                'title': 'Mayo Clinic Medical Information',
                'source': 'Mayo Clinic',
                'url': 'https://www.mayoclinic.org/diseases-conditions',
                'publishedAt': '2024-01-15T00:00:00Z',
                'summary': 'Comprehensive medical information from Mayo Clinic covering diseases, conditions, and treatments.'
            })
        
        # Harvard Health
        if any(term in keywords for term in ['nutrition', 'diet', 'exercise', 'wellness']):
            general_sources.append({
                'title': 'Harvard Health Publishing',
                'source': 'Harvard Medical School',
                'url': 'https://www.health.harvard.edu/',
                'publishedAt': '2024-01-15T00:00:00Z',
                'summary': 'Evidence-based health information and research from Harvard Medical School.'
            })
        
        # PubMed
        general_sources.append({
            'title': 'PubMed Medical Literature Database',
            'source': 'National Library of Medicine',
            'url': 'https://pubmed.ncbi.nlm.nih.gov/',
            'publishedAt': '2024-01-15T00:00:00Z',
            'summary': 'Comprehensive database of biomedical literature from MEDLINE, life science journals, and online books.'
        })
        
        return general_sources
    
    def _get_fallback_citations(self) -> List[Dict[str, Any]]:
        """Fallback citations when source checking fails"""
        return [
            {
                'title': 'General Health Information',
                'source': 'Medical Literature',
                'url': 'https://www.nlm.nih.gov/',
                'publishedAt': '2024-01-15T00:00:00Z',
                'summary': 'For accurate health information, please consult with healthcare professionals and trusted medical sources.'
            }
        ]