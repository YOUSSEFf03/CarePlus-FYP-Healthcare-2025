import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full"></div>
        <Brain className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </motion.div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">Analyzing Image</h3>
        <p className="text-gray-600">AI is processing your histology image...</p>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex space-x-1"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
        ))}
      </motion.div>
      
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          This may take a few moments
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
