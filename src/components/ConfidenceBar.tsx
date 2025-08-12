import React from 'react';

interface ConfidenceBarProps {
  confidence: number;
  verdict: string;
}

const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence, verdict }) => {
  const getConfidenceColor = (confidence: number, verdict: string) => {
    if (confidence >= 80) {
      return verdict.toLowerCase() === 'true' 
        ? 'bg-green-500' 
        : verdict.toLowerCase() === 'misleading' 
        ? 'bg-red-500' 
        : 'bg-amber-500';
    } else if (confidence >= 60) {
      return 'bg-yellow-500';
    } else {
      return 'bg-gray-500';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'Very High';
    if (confidence >= 80) return 'High';
    if (confidence >= 70) return 'Moderate';
    if (confidence >= 60) return 'Low';
    return 'Very Low';
  };

  const colorClass = getConfidenceColor(confidence, verdict);
  const label = getConfidenceLabel(confidence);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Confidence Level
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {confidence}%
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            {label}
          </span>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div
            className={`${colorClass} h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
            style={{ width: `${confidence}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        {/* Threshold indicators */}
        <div className="absolute top-0 left-0 w-full h-3 pointer-events-none">
          {[25, 50, 75].map((threshold) => (
            <div
              key={threshold}
              className="absolute top-0 bottom-0 w-px bg-white/30"
              style={{ left: `${threshold}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default ConfidenceBar;