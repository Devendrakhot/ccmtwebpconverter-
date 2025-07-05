import React from 'react';
import { FileImage} from 'lucide-react';
import { DropZone } from './components/DropZone';
import { ConversionControls } from './components/ConversionControls';
import { ImagePreview } from './components/ImagePreview';
import { ProgressBar } from './components/ProgressBar';
import { useImageConverter } from './hooks/useImageConverter';
import { ConversionOptions } from './types';

function App() {
  const {
    convertedImages,
    isConverting,
    progress,
    error,
    convertImages,
    downloadImage,
    downloadAllImages,
    removeImage,
    clearAll
  } = useImageConverter();

  const handleFilesSelected = async (files: File[]) => {
    const options: ConversionOptions = { quality: 0.8, lossless: false };
    await convertImages(files, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileImage className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CCMT WebP Converter</h1>
               
              </div>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Drop Zone */}
          <DropZone onFilesSelected={handleFilesSelected} isConverting={isConverting} />

          {/* Conversion Controls */}
          <ConversionControls
            hasConvertedImages={convertedImages.length > 0}
            onDownloadAll={downloadAllImages}
          />

          {/* Progress Bar */}
          <ProgressBar
            progress={progress}
            total={convertedImages.length + (isConverting ? 1 : 0)}
            isVisible={isConverting}
          />

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {convertedImages.length > 0 && (
            <div className="w-full max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Converted Images ({convertedImages.length})
                </h2>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {convertedImages.map((image) => (
                  <ImagePreview
                    key={image.id}
                    image={image}
                    onDownload={downloadImage}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            </div>
          )}

          
        </div>
      </main>

      
    </div>
  );
}

export default App;