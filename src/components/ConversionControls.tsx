import React from 'react';
import { Download } from 'lucide-react';

interface ConversionControlsProps {
  hasConvertedImages: boolean;
  onDownloadAll: () => void;
}

export const ConversionControls: React.FC<ConversionControlsProps> = ({
  hasConvertedImages,
  onDownloadAll
}) => {
  if (!hasConvertedImages) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-center">
          <button
            onClick={onDownloadAll}
            className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            <span>Download All Images</span>
          </button>
        </div>
      </div>
    </div>
  );
};