import { useState, useCallback } from 'react';
import { ConvertedImage, ConversionOptions } from '../types';
import { ImageConverter } from '../utils/imageConverter';

export const useImageConverter = () => {
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const convertImages = useCallback(async (files: File[], options: ConversionOptions) => {
    setIsConverting(true);
    setProgress(0);
    setError(null);

    const validFiles = files.filter(file => ImageConverter.isValidImageType(file));
    const results: ConvertedImage[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      try {
        const converted = await ImageConverter.convertToWebP(validFiles[i], options);
        results.push(converted);
        setProgress(i + 1);
      } catch (err) {
        console.error('Error converting image:', err);
        setError(`Failed to convert ${validFiles[i].name}`);
      }
    }

    setConvertedImages(prev => [...prev, ...results]);
    setIsConverting(false);
  }, []);

  const downloadImage = useCallback((image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.convertedUrl;
    link.download = image.originalFile.name.replace(/\.[^/.]+$/, '.webp');
    link.click();
  }, []);

  const downloadAllImages = useCallback(() => {
    convertedImages.forEach(image => {
      downloadImage(image);
    });
  }, [convertedImages, downloadImage]);

  const removeImage = useCallback((id: string) => {
    setConvertedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.originalUrl);
        URL.revokeObjectURL(image.convertedUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    convertedImages.forEach(image => {
      URL.revokeObjectURL(image.originalUrl);
      URL.revokeObjectURL(image.convertedUrl);
    });
    setConvertedImages([]);
  }, [convertedImages]);

  return {
    convertedImages,
    isConverting,
    progress,
    error,
    convertImages,
    downloadImage,
    downloadAllImages,
    removeImage,
    clearAll
  };
};