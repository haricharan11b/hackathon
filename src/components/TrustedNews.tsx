import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Calendar, Globe } from 'lucide-react';
import { fetchTrustedNews } from '../services/newsApi';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

const TrustedNews: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const articles = await fetchTrustedNews();
      setNews(articles);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load trusted news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadNews();
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'who':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cdc':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pubmed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 sticky top-24">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Trusted Health News
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-200 disabled:cursor-not-allowed"
            title="Refresh News"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Latest updates from WHO, CDC, and PubMed
        </p>
        {lastUpdated && (
          <div className="flex items-center space-x-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* News List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {news.map((article) => (
              <article key={article.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(article.source)}`}>
                      {article.source.toUpperCase()}
                    </span>
                    <time className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </time>
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 dark:text-white leading-snug text-sm">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {article.summary}
                  </p>
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium group"
                  >
                    <span>Read more</span>
                    <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <Globe className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No news articles available at the moment.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Try refreshing
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Updates every 5 minutes • Verified sources only
        </p>
      </div>
    </div>
  );
};

export default TrustedNews;