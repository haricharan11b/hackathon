import requests
import feedparser
import os
from typing import List, Dict, Any
import logging
from datetime import datetime, timedelta
import time

logger = logging.getLogger(__name__)

class NewsService:
    def __init__(self):
        self.who_api_key = os.getenv('WHO_API_KEY')
        self.cdc_api_key = os.getenv('CDC_API_KEY')
        
        # RSS Feed URLs
        self.rss_feeds = {
            'who': 'https://www.who.int/rss-feeds/news-english.xml',
            'cdc': 'https://tools.cdc.gov/api/v2/resources/media/132608.rss',
            'pubmed': 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1QHBAdOjNvfLK5Jh1FLIr2Twqj1YjXBVgNdGBoOvXYrVgNdGBoOvXY'
        }
        
        # Cache for news articles
        self._cache = {}
        self._cache_expiry = {}
        self._cache_duration = 300  # 5 minutes
    
    def get_latest_news(self, source: str = 'all', limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch latest health news from trusted sources"""
        try:
            if source == 'all':
                articles = []
                for src in ['who', 'cdc', 'pubmed']:
                    articles.extend(self._get_news_from_source(src, limit // 3))
                
                # Sort by date and limit
                articles.sort(key=lambda x: x['publishedAt'], reverse=True)
                return articles[:limit]
            else:
                return self._get_news_from_source(source, limit)
                
        except Exception as e:
            logger.error(f"Error fetching news: {str(e)}")
            return self._get_fallback_news()
    
    def _get_news_from_source(self, source: str, limit: int) -> List[Dict[str, Any]]:
        """Fetch news from a specific source"""
        # Check cache first
        cache_key = f"{source}_{limit}"
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        try:
            if source == 'who':
                articles = self._fetch_who_news(limit)
            elif source == 'cdc':
                articles = self._fetch_cdc_news(limit)
            elif source == 'pubmed':
                articles = self._fetch_pubmed_news(limit)
            else:
                articles = []
            
            # Cache the results
            self._cache[cache_key] = articles
            self._cache_expiry[cache_key] = time.time() + self._cache_duration
            
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching {source} news: {str(e)}")
            return []
    
    def _fetch_who_news(self, limit: int) -> List[Dict[str, Any]]:
        """Fetch WHO news via RSS"""
        try:
            feed = feedparser.parse(self.rss_feeds['who'])
            articles = []
            
            for entry in feed.entries[:limit]:
                article = {
                    'id': f"who_{hash(entry.link)}",
                    'title': entry.title,
                    'summary': self._clean_summary(entry.get('summary', entry.get('description', ''))),
                    'url': entry.link,
                    'publishedAt': self._parse_date(entry.get('published', '')),
                    'source': 'WHO'
                }
                articles.append(article)
            
            return articles
            
        except Exception as e:
            logger.error(f"WHO RSS fetch failed: {str(e)}")
            return []
    
    def _fetch_cdc_news(self, limit: int) -> List[Dict[str, Any]]:
        """Fetch CDC news via RSS"""
        try:
            feed = feedparser.parse(self.rss_feeds['cdc'])
            articles = []
            
            for entry in feed.entries[:limit]:
                article = {
                    'id': f"cdc_{hash(entry.link)}",
                    'title': entry.title,
                    'summary': self._clean_summary(entry.get('summary', entry.get('description', ''))),
                    'url': entry.link,
                    'publishedAt': self._parse_date(entry.get('published', '')),
                    'source': 'CDC'
                }
                articles.append(article)
            
            return articles
            
        except Exception as e:
            logger.error(f"CDC RSS fetch failed: {str(e)}")
            return []
    
    def _fetch_pubmed_news(self, limit: int) -> List[Dict[str, Any]]:
        """Fetch PubMed news via RSS"""
        try:
            # Use PubMed's general health RSS or search API
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
            params = {
                'db': 'pubmed',
                'term': 'health[Title] AND ("last 30 days"[PDat])',
                'retmax': limit,
                'retmode': 'json',
                'sort': 'pub_date'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                pmids = data.get('esearchresult', {}).get('idlist', [])
                
                return self._fetch_pubmed_details(pmids[:limit])
            
            return []
            
        except Exception as e:
            logger.error(f"PubMed fetch failed: {str(e)}")
            return []
    
    def _fetch_pubmed_details(self, pmids: List[str]) -> List[Dict[str, Any]]:
        """Fetch detailed information for PubMed articles"""
        if not pmids:
            return []
        
        try:
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
            params = {
                'db': 'pubmed',
                'id': ','.join(pmids),
                'retmode': 'json'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                articles = []
                
                for pmid in pmids:
                    if pmid in data.get('result', {}):
                        article_data = data['result'][pmid]
                        
                        article = {
                            'id': f"pubmed_{pmid}",
                            'title': article_data.get('title', 'No title available'),
                            'summary': self._extract_pubmed_summary(article_data),
                            'url': f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                            'publishedAt': self._parse_pubmed_date(article_data.get('pubdate', '')),
                            'source': 'PubMed'
                        }
                        articles.append(article)
                
                return articles
            
            return []
            
        except Exception as e:
            logger.error(f"PubMed details fetch failed: {str(e)}")
            return []
    
    def _clean_summary(self, summary: str) -> str:
        """Clean and truncate summary text"""
        if not summary:
            return "No summary available."
        
        # Remove HTML tags
        import re
        clean_text = re.sub(r'<[^>]+>', '', summary)
        
        # Truncate to reasonable length
        if len(clean_text) > 200:
            clean_text = clean_text[:200] + "..."
        
        return clean_text.strip()
    
    def _extract_pubmed_summary(self, article_data: Dict) -> str:
        """Extract summary from PubMed article data"""
        authors = article_data.get('authors', [])
        author_names = [author.get('name', '') for author in authors[:3]]
        author_str = ', '.join(author_names)
        
        if len(authors) > 3:
            author_str += ' et al.'
        
        journal = article_data.get('fulljournalname', 'Unknown Journal')
        
        return f"Research article by {author_str} published in {journal}."
    
    def _parse_date(self, date_str: str) -> str:
        """Parse various date formats to ISO format"""
        if not date_str:
            return datetime.utcnow().isoformat()
        
        try:
            # Try parsing common RSS date formats
            from dateutil import parser
            parsed_date = parser.parse(date_str)
            return parsed_date.isoformat()
        except:
            return datetime.utcnow().isoformat()
    
    def _parse_pubmed_date(self, date_str: str) -> str:
        """Parse PubMed date format"""
        if not date_str:
            return datetime.utcnow().isoformat()
        
        try:
            # PubMed dates are often in format "2024 Jan 15" or "2024/01/15"
            from dateutil import parser
            parsed_date = parser.parse(date_str)
            return parsed_date.isoformat()
        except:
            return datetime.utcnow().isoformat()
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self._cache:
            return False
        
        if cache_key not in self._cache_expiry:
            return False
        
        return time.time() < self._cache_expiry[cache_key]
    
    def _get_fallback_news(self) -> List[Dict[str, Any]]:
        """Fallback news when all sources fail"""
        return [
            {
                'id': 'fallback_1',
                'title': 'Health News Currently Unavailable',
                'summary': 'We are experiencing temporary issues fetching the latest health news. Please check back later.',
                'url': '#',
                'publishedAt': datetime.utcnow().isoformat(),
                'source': 'System'
            }
        ]