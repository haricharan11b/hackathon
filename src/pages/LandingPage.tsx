import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import TrustedNews from '../components/TrustedNews';
import { useVerification } from '../context/VerificationContext';
import { verifyHealthClaim } from '../services/api';

const LandingPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addVerification } = useVerification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast.error('Please enter a health claim or article URL');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await verifyHealthClaim(input);
      const verification = {
        id: Date.now().toString(),
        input: input,
        result: result,
        timestamp: new Date().toISOString(),
      };
      
      addVerification(verification);
      navigate(`/results/${verification.id}`);
      
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to analyze the claim. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const examples = [
    "Drinking lemon water in the morning boosts metabolism and helps with weight loss",
    "Vaccines cause autism in children",
    "https://example.com/health-article-url"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-2" />
              AI-Powered Health Fact Checking
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white">
              Health Misinformation
              <span className="block text-blue-600 dark:text-blue-400">Detector</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Check if a health claim is true, misleading, or needs review using advanced AI 
              and trusted medical sources like WHO, CDC, and PubMed.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="healthClaim" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Enter health claim or article URL
                </label>
                <div className="relative">
                  <textarea
                    id="healthClaim"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste a health claim or article URL here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none transition-all duration-200"
                    disabled={isProcessing}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {input.length}/1000
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Analyzing claim...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Verify Health Claim</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Example Claims */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Try these example claims:
            </h3>
            <div className="grid gap-3">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInput(example)}
                  className="text-left p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 group"
                  disabled={isProcessing}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {example.startsWith('http') ? (
                        <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
                      {example}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Advanced AI models trained on medical literature for accurate fact-checking.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Trusted Sources
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Cross-references claims with WHO, CDC, PubMed, and other authoritative sources.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Stay informed with the latest trusted health news and research updates.
              </p>
            </div>
          </div>
        </div>

        {/* Trusted News Sidebar */}
        <div className="lg:col-span-1">
          <TrustedNews />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;