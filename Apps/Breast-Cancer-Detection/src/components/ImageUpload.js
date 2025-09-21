import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';

const ImageUpload = ({ onImageUpload, isLoading }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
      onImageUpload(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className="space-y-4">
          <motion.div
            animate={{ rotate: dragActive ? 5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
          </motion.div>
          
          <div>
            <p className="text-gray-800 font-medium mb-2">
              {dragActive ? 'Drop your image here' : 'Drag & drop your image'}
            </p>
            <p className="text-gray-600 text-sm mb-4">
              or click to browse files
            </p>
            <button
              onClick={openFileDialog}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Choose File
            </button>
          </div>
          
          <p className="text-gray-500 text-xs">
            Supports: JPG, PNG, WebP (Max 10MB)
          </p>
        </div>
      </motion.div>

      {preview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative"
        >
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-800 font-medium">Preview</span>
              <button
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUpload;
