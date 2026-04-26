'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (objectUrl: string, file: File) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 4096;

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP, etc.)');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be under 10MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width > MAX_DIMENSION || bitmap.height > MAX_DIMENSION) {
        bitmap.close();
        URL.revokeObjectURL(objectUrl);
        setError(`Image dimensions must be ${MAX_DIMENSION}px or smaller on each side`);
        return;
      }
      bitmap.close();

      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      }
      currentObjectUrlRef.current = objectUrl;
      onFileSelect(objectUrl, file);
    } catch {
      URL.revokeObjectURL(objectUrl);
      setError('Could not decode image. Please try another file.');
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  }, [processFile]);

  return (
    <div className="w-full">
      <motion.label
        className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-violet-400 bg-violet-950/30' 
            : 'border-gray-700 bg-gray-900/50 hover:border-violet-600 hover:bg-gray-900'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={isDragging ? 'dragging' : 'idle'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4 text-center px-8"
          >
            <div className={`p-4 rounded-full ${isDragging ? 'bg-violet-500/20' : 'bg-gray-800'}`}>
              {isDragging ? (
                <ImageIcon className="w-8 h-8 text-violet-400" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-base font-medium text-gray-200">
                {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or <span className="text-violet-400 font-medium">browse files</span> · PNG, JPG, WebP up to 10MB
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.label>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-3 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
