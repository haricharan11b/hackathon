import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useVerification } from '../context/VerificationContext';
import toast from 'react-hot-toast';

const HistoryPage: React.FC = () => {
  const { verifications, clearHistory, removeVerification } = useVerification();
  const [filter, setFilter] = useState<'all' | 'true' | 'misleading' | 'needs-review'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getVerdictConfig = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'true':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          label: 'Verified True'
        };
      case 'misleading':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          label: 'Misleading'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          label: 'Needs Review'
        };
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesFilter = filter === 'all' || 
      verification.result.verdict.toLowerCase() === filter.replace('-', ' ');
    
    const matchesSearch = searchTerm === '' || 
      verification.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.result.explanation.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all verification history? This action cannot be undone.')) {
      clearHistory();
      toast.success('History cleared successfully');
    }
  };

  const handleRemoveVerification = (id: string) => {
    removeVerification(id);
    toast.success('Verification removed from history');
  };

  if (verifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <Clock className="h-16 w-16 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Verification History
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Start verifying health claims to see your history here. All your past verifications will be saved for easy access.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            <Search className="h-4 w-4" />
            <span>Start Verifying Claims</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Verification History
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and manage your past health claim verifications
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search verifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full sm:w-64"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white appearance-none"
              >
                <option value="all">All Results</option>
                <option value="true">Verified True</option>
                <option value="misleading">Misleading</option>
                <option value="needs-review">Needs Review</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
              {filteredVerifications.length} of {verifications.length} results
            </span>
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid gap-6">
        {filteredVerifications.map((verification) => {
          const verdictConfig = getVerdictConfig(verification.result.verdict);
          const VerdictIcon = verdictConfig.icon;

          return (
            <div
              key={verification.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${verdictConfig.bgColor} rounded-full flex items-center justify-center`}>
                    <VerdictIcon className={`h-5 w-5 ${verdictConfig.color}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${verdictConfig.color}`}>
                      {verdictConfig.label}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(verification.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{verification.result.confidence}% confidence</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/results/${verification.id}`}
                    className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    title="View Details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleRemoveVerification(verification.id)}
                    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove from History"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Original Claim:
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border-l-4 border-slate-300 dark:border-slate-600">
                    {verification.input.length > 200 
                      ? `${verification.input.substring(0, 200)}...`
                      : verification.input
                    }
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Explanation:
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {verification.result.explanation.length > 300
                      ? `${verification.result.explanation.substring(0, 300)}...`
                      : verification.result.explanation
                    }
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {verification.result.citations?.length || 0} sources referenced
                  </div>
                  <Link
                    to={`/results/${verification.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>View Full Results</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVerifications.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Try adjusting your search term or filter settings
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;