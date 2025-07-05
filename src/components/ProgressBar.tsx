import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  total: number;
  isVisible: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total, isVisible }) => {
  if (!isVisible) return null;

  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-800">
            Converting Images ({progress}/{total})
          </h3>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {percentage.toFixed(1)}% complete
        </p>
      </div>
    </div>
  );
};