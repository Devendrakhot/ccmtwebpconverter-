import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isConverting: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, isConverting }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please drop valid image files (JPG, PNG, GIF, BMP)');
      return;
    }

    if (imageFiles.length !== files.length) {
      setError('Some files were skipped. Only image files are supported.');
    }

    onFilesSelected(imageFiles);
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragging
            ? 'border-blue-400 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
          ${isConverting ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isDragging ? (
            <Upload className="w-16 h-16 text-blue-500 animate-bounce" />
          ) : (
            <FileImage className="w-16 h-16 text-gray-400" />
          )}
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isDragging ? 'Drop your images here' : 'Upload Images to Convert'}
            </h3>
            <p className="text-gray-600">
              Drag and drop your images here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPG, PNG, GIF, BMP formats
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};