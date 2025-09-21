import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image as ImageIcon,
  Brain,
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import ImageUpload from "./components/ImageUpload";
import PredictionResults from "./components/PredictionResults";
import LoadingSpinner from "./components/LoadingSpinner";
import Header from "./components/Header";
import { predictImage } from "./services/api";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (imageFile) => {
    setSelectedImage(imageFile);
    setPredictions(null);
    setError(null);
    setIsLoading(true);

    try {
      const result = await predictImage(imageFile);
      setPredictions(result);
    } catch (err) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPredictions(null);
    setError(null);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6"
            >
              <Brain className="w-10 h-10 text-blue-600" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              AI-Powered Breast Cancer Detection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload a histology image and get instant AI-powered analysis with
              detailed predictions
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-effect rounded-2xl p-8 card-hover">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Upload className="w-6 h-6 mr-3 text-blue-600" />
                  Upload Image
                </h2>

                <ImageUpload
                  onImageUpload={handleImageUpload}
                  isLoading={isLoading}
                />

                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6"
                  >
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-800 font-medium">
                          Selected Image
                        </span>
                        <button
                          onClick={handleReset}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Selected"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Features */}
              <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Features
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Brain, text: "Advanced AI Analysis" },
                    { icon: Activity, text: "Real-time Predictions" },
                    { icon: CheckCircle, text: "High Accuracy Results" },
                    { icon: BarChart3, text: "Detailed Confidence Scores" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-center text-gray-700"
                    >
                      <feature.icon className="w-5 h-5 mr-3 text-blue-600" />
                      {feature.text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="glass-effect rounded-2xl p-8 card-hover">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-blue-600" />
                  Analysis Results
                </h2>

                <AnimatePresence mode="wait">
                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <LoadingSpinner />
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-red-500/20 border border-red-500/30 rounded-xl p-6"
                    >
                      <div className="flex items-center text-red-300">
                        <AlertCircle className="w-6 h-6 mr-3" />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-red-200 mt-2">{error}</p>
                    </motion.div>
                  )}

                  {predictions && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <PredictionResults predictions={predictions} />
                    </motion.div>
                  )}

                  {!isLoading && !error && !predictions && (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Upload an image to see AI analysis results
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
