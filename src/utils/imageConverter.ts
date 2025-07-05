import { ConvertedImage, ConversionOptions } from '../types';

export class ImageConverter {
  static async convertToWebP(
    file: File,
    options: ConversionOptions = { quality: 0.8, lossless: false }
  ): Promise<ConvertedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }

            const compressionRatio = ((file.size - blob.size) / file.size) * 100;
            
            resolve({
              id: crypto.randomUUID(),
              originalFile: file,
              originalSize: file.size,
              convertedBlob: blob,
              convertedSize: blob.size,
              compressionRatio,
              originalUrl: URL.createObjectURL(file),
              convertedUrl: URL.createObjectURL(blob)
            });
          },
          'image/webp',
          options.lossless ? 1 : options.quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    return validTypes.includes(file.type);
  }
}