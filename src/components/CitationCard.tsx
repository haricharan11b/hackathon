import React from 'react';
import { ExternalLink, Calendar, Building } from 'lucide-react';

interface Citation {
  title: string;
  source: string;
  url: string;
  publishedAt?: string;
  summary?: string;
}

interface CitationCardProps {
  citation: Citation;
}

const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('who')) return '🏥';
    if (lowerSource.includes('cdc')) return '🏛️';
    if (lowerSource.includes('pubmed') || lowerSource.includes('ncbi')) return '📚';
    if (lowerSource.includes('mayo')) return '🏥';
    if (lowerSource.includes('harvard') || lowerSource.includes('medical')) return '🎓';
    return '📄';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getSourceIcon(citation.source)}</div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-white leading-snug mb-2">
            {citation.title}
          </h4>
          
          <div className="flex items-center space-x-4 mb-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <Building className="h-3 w-3" />
              <span>{citation.source}</span>
            </div>
            
            {citation.publishedAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(citation.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {citation.summary && (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2">
              {citation.summary}
            </p>
          )}
          
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium group"
          >
            <span>Read source</span>
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CitationCard;