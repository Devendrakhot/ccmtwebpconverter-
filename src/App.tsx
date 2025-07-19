import React, { useRef, useState } from 'react';
import { FileImage, Upload, FileVideo, Download, Music, Trash2 } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { ConversionControls } from './components/ConversionControls';
import { ImagePreview } from './components/ImagePreview';
import { ProgressBar } from './components/ProgressBar';
import { useImageConverter } from './hooks/useImageConverter';
import { ConversionOptions } from './types';

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: string;
  status: 'pending' | 'converting' | 'completed';
  progress: number;
  audioUrl?: string;
  audioBlob?: Blob;
}

function App() {
  // Image conversion state
  const {
    convertedImages,
    isConverting: isConvertingImages,
    progress: imageProgress,
    error: imageError,
    convertImages,
    downloadImage,
    downloadAllImages,
    removeImage,
    clearAll: clearAllImages
  } = useImageConverter();

  // Video to audio state
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConvertingVideo, setIsConvertingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image conversion handlers
  const handleImageFilesSelected = async (files: File[]) => {
    const options: ConversionOptions = { quality: 0.8, lossless: false };
    await convertImages(files, options);
  };

  // Video conversion handlers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleVideoFiles(droppedFiles);
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleVideoFiles(selectedFiles);
    }
  };

  const handleVideoFiles = (fileList: File[]) => {
    const videoFiles = fileList.filter(file => file.type.startsWith('video/'));
    
    const newFiles: VideoFile[] = videoFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      status: 'pending',
      progress: 0
    }));

    setVideoFiles(prev => [...prev, ...newFiles]);
  };

  const extractAudioFromVideo = async (videoFile: File): Promise<Blob> => {
    return new Promise((resolve) => {
      // Create a video element
      const video = document.createElement('video');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a file reader to read the video file
      const reader = new FileReader();
      
      reader.onload = async function(e) {
        if (!e.target?.result) return;
        
        // Set video source
        video.src = URL.createObjectURL(new Blob([e.target.result as ArrayBuffer], { type: videoFile.type }));
        
        await video.play().catch(e => console.error('Video play error:', e));
        
        // Create media source
        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        
        source.connect(destination);
        source.connect(audioContext.destination);
        
        // Record the audio
        const mediaRecorder = new MediaRecorder(destination.stream);
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          resolve(audioBlob);
        };
        
        mediaRecorder.start();
        
        // Stop recording when video ends
        video.onended = () => {
          mediaRecorder.stop();
        };
      };
      
      reader.readAsArrayBuffer(videoFile);
    });
  };

  const convertVideoToAudio = async (fileId: string) => {
    setIsConvertingVideo(true);
    setVideoFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'converting' } : f
    ));

    try {
      const file = videoFiles.find(f => f.id === fileId);
      if (!file) return;

      // Simulate progress (in a real app, you'd use actual progress events)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setVideoFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: i } : f
        ));
      }

      // Extract audio
      const audioBlob = await extractAudioFromVideo(file.file);
      const audioUrl = URL.createObjectURL(audioBlob);

      setVideoFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed',
          progress: 100,
          audioUrl,
          audioBlob
        } : f
      ));
    } catch (error) {
      console.error('Conversion error:', error);
      setVideoFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'pending', progress: 0 } : f
      ));
    } finally {
      setIsConvertingVideo(false);
    }
  };

  const removeVideoFile = (fileId: string) => {
    setVideoFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.audioUrl) {
        URL.revokeObjectURL(file.audioUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const downloadAudio = (file: VideoFile) => {
    if (file.audioUrl && file.audioBlob) {
      const a = document.createElement('a');
      a.href = file.audioUrl;
      a.download = `${file.name.replace(/\.[^/.]+$/, '')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const clearAllVideos = () => {
    videoFiles.forEach(file => {
      if (file.audioUrl) {
        URL.revokeObjectURL(file.audioUrl);
      }
    });
    setVideoFiles([]);
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
                <h1 className="text-2xl font-bold text-gray-900">CCMT Converter</h1>
                <p className="text-sm text-gray-500">Convert images and videos with ease</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Image Conversion Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">Image Conversion</h2>
            
            {/* Drop Zone */}
            <DropZone 
              onFilesSelected={handleImageFilesSelected} 
              isConverting={isConvertingImages} 
              accept="image/*"
            />

            {/* Conversion Controls */}
            <ConversionControls
              hasConvertedImages={convertedImages.length > 0}
              onDownloadAll={downloadAllImages}
              onClearAll={clearAllImages}
            />

            {/* Progress Bar */}
            <ProgressBar
              progress={imageProgress}
              total={convertedImages.length + (isConvertingImages ? 1 : 0)}
              isVisible={isConvertingImages}
            />

            {/* Error Message */}
            {imageError && (
              <div className="w-full max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{imageError}</p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {convertedImages.length > 0 && (
              <div className="w-full max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    Converted Images ({convertedImages.length})
                  </h3>
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
          </section>

          {/* Video to Audio Conversion Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">Video to Audio Conversion</h2>
            
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Drop video files here</h3>
              <p className="text-gray-600 mb-4">or click to select files</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isConvertingVideo}
              >
                Select Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoFileSelect}
                className="hidden"
                disabled={isConvertingVideo}
              />
            </div>

            {/* Files List */}
            {videoFiles.length > 0 && (
              <div className="w-full max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    Video Files ({videoFiles.length})
                  </h3>
                  <button
                    onClick={clearAllVideos}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="divide-y">
                    {videoFiles.map((file) => (
                      <div key={file.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileVideo className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{file.name}</h4>
                              <p className="text-sm text-gray-500">{file.size}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {file.status === 'pending' && (
                              <button
                                onClick={() => convertVideoToAudio(file.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                disabled={isConvertingVideo}
                              >
                                Convert
                              </button>
                            )}
                            
                            {file.status === 'completed' && (
                              <button
                                onClick={() => downloadAudio(file)}
                                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => removeVideoFile(file.id)}
                              className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {file.status === 'converting' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Converting...</span>
                              <span>{file.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
