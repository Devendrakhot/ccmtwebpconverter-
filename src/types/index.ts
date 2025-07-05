export interface ConvertedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  convertedBlob: Blob;
  convertedSize: number;
  compressionRatio: number;
  originalUrl: string;
  convertedUrl: string;
}

export interface ConversionOptions {
  quality: number;
  lossless: boolean;
}