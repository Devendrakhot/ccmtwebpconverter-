import React from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';
import { ConvertedImage } from '../types';
import { ImageConverter } from '../utils/imageConverter';

interface ImagePreviewProps {
  image: ConvertedImage;
  onDownload: (image: ConvertedImage) => void;
  onRemove: (id: string) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onDownload, onRemove }) => {
  const [showComparison, setShowComparison] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={showComparison ? image.originalUrl : image.convertedUrl}
          alt={image.originalFile.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          {/* <button
            onClick={() => setShowComparison(!showComparison)}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            title={showComparison ? 'Show WebP' : 'Show Original'}
          >
            <Eye className="w-4 h-4" />
          </button> */}
          <button
            onClick={() => onRemove(image.id)}
            className="p-2 bg-red-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {showComparison && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
            Original
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate mb-2">
          {image.originalFile.name}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <p className="font-medium text-gray-700">Original</p>
            <p>{ImageConverter.formatFileSize(image.originalSize)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">WebP</p>
            <p>{ImageConverter.formatFileSize(image.convertedSize)}</p>
          </div>
        </div>

     
        <button
          onClick={() => onDownload(image)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download WebP</span>
        </button>
      </div>
    </div>
  );
};