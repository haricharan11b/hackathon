import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Share2, 
  Copy, 
  ExternalLink,
  ArrowLeft,
  Clock,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useVerification } from '../context/VerificationContext';
import ConfidenceBar from '../components/ConfidenceBar';
import CitationCard from '../components/CitationCard';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVerification } = useVerification();
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const result = getVerification(id);
      setVerification(result);
    }
  }, [id, getVerification]);

  if (!verification) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Verification Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            The verification result you're looking for doesn't exist or has expired.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const { result } = verification;
  
  const getVerdictConfig = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'true':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Verified True'
        };
      case 'misleading':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Misleading'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          label: 'Needs Review'
        };
    }
  };

  const verdictConfig = getVerdictConfig(result.verdict);
  const VerdictIcon = verdictConfig.icon;

  const handleShare = () => {
    const url = window.location.href;
    navigator.share?.({
      title: 'Health Claim Verification Result',
      text: `Check out this health fact-check result: ${result.verdict}`,
      url: url,
    }).catch(() => {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Verification Results
            </h1>
            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(verification.timestamp).toLocaleString()}</span>
              </div>
              {result.language && (
                <div className="flex items-center space-x-1">
                  <Globe className="h-4 w-4" />
                  <span>Language: {result.language}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleCopyLink}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              title="Copy Link"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              title="Share Results"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Original Claim */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Original Claim
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border-l-4 border-slate-300 dark:border-slate-600">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {verification.input}
              </p>
            </div>
          </div>

          {/* Verdict Card */}
          <div className={`${verdictConfig.bgColor} ${verdictConfig.borderColor} border-2 rounded-xl p-6`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-16 h-16 ${verdictConfig.bgColor} rounded-full flex items-center justify-center`}>
                <VerdictIcon className={`h-8 w-8 ${verdictConfig.color}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${verdictConfig.color}`}>
                  {verdictConfig.label}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Based on AI analysis and trusted sources
                </p>
              </div>
            </div>

            <ConfidenceBar 
              confidence={result.confidence} 
              verdict={result.verdict}
            />
          </div>

          {/* Explanation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Detailed Explanation
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Citations */}
          {result.citations && result.citations.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                Sources & Citations
              </h2>
              <div className="grid gap-4">
                {result.citations.map((citation: any, index: number) => (
                  <CitationCard key={index} citation={citation} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Verdict:</span>
                <span className={`font-semibold ${verdictConfig.color}`}>
                  {verdictConfig.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Confidence:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.confidence}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Sources:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.citations?.length || 0} references
                </span>
              </div>
            </div>
          </div>

          {/* Processing Details */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Analysis Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">AI Model:</span>
                <span className="text-slate-900 dark:text-white">
                  {result.model || 'BioBERT + GPT-4'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Processing Time:</span>
                <span className="text-slate-900 dark:text-white">
                  {result.processingTime || '2.3s'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Language:</span>
                <span className="text-slate-900 dark:text-white">
                  {result.language || 'English'}
                </span>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Share Results
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <Share2 className="h-4 w-4" />
                <span>Share via System</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center space-x-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Health Fact Check: ${result.verdict} - ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Share on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;