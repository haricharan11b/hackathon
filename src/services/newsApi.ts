// News API service for backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

export const fetchTrustedNews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/news?limit=8`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    
    const data = await response.json();
    return data.articles || [];
    
  } catch (error) {
    console.error('News API Error:', error);
    
    // Fallback to mock data if backend is not available
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Backend not available, using mock news data');
      return getMockNewsArticles();
    }
    
    return [];
  }
};

// Mock news data as fallback
const getMockNewsArticles = async (): Promise<NewsArticle[]> => {
  const mockNewsArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'New WHO Guidelines on Digital Health Interventions',
      summary: 'The World Health Organization releases updated guidelines for digital health technologies and their implementation in healthcare systems worldwide.',
      url: 'https://www.who.int/news/item/01-01-2024-new-digital-health-guidelines',
      publishedAt: '2024-01-15T10:00:00Z',
      source: 'WHO'
    },
    {
      id: '2',
      title: 'CDC Updates Recommendations for Seasonal Flu Vaccination',
      summary: 'Latest recommendations for the 2024 flu season, including new vaccine formulations and priority groups for vaccination.',
      url: 'https://www.cdc.gov/flu/season/recommendations-2024.html',
      publishedAt: '2024-01-14T14:30:00Z',
      source: 'CDC'
    },
    {
      id: '3',
      title: 'Breakthrough in Cancer Immunotherapy Research',
      summary: 'Recent studies published in major medical journals show promising results for new immunotherapy approaches in treating various cancer types.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38234567/',
      publishedAt: '2024-01-13T09:15:00Z',
      source: 'PubMed'
    },
    {
      id: '4',
      title: 'Global Mental Health Initiative Launched by WHO',
      summary: 'A comprehensive global initiative aimed at improving mental health services and reducing stigma worldwide.',
      url: 'https://www.who.int/news/item/12-01-2024-mental-health-initiative',
      publishedAt: '2024-01-12T11:45:00Z',
      source: 'WHO'
    },
    {
      id: '5',
      title: 'Antibiotic Resistance: New Surveillance Data Released',
      summary: 'CDC releases latest data on antibiotic resistance patterns and provides updated guidelines for healthcare providers.',
      url: 'https://www.cdc.gov/drugresistance/surveillance-report-2024.html',
      publishedAt: '2024-01-11T16:20:00Z',
      source: 'CDC'
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Randomly shuffle and return subset of articles
  const shuffled = [...mockNewsArticles].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5 + Math.floor(Math.random() * 3));
};