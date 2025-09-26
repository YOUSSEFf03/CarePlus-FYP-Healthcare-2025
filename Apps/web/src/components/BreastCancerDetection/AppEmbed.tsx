import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Brain, Activity, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import PredictionResults from './PredictionResults';
import LoadingSpinner from './LoadingSpinner';

export default function AppEmbed() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [predictions, setPredictions] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (imageFile: File) => {
        setSelectedImage(imageFile);
        setPredictions(null);
        setError(null);
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const apiBase = (process.env.REACT_APP_API_URL as string | undefined) || 'http://127.0.0.1:7860';
            const res = await fetch(`${apiBase}/predict`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            setPredictions(data);
        } catch (e: any) {
            setError(e?.message || 'Failed to analyze image');
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
        <div className="min-h-[80vh] gradient-bg">
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <Brain className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-2">AI-Powered Breast Cancer Detection</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Upload a histology image and get instant AI-powered analysis</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="glass-effect rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                                    Upload Image
                                </h2>
                                <ImageUpload onImageUpload={handleImageUpload} isLoading={isLoading} />
                                {selectedImage && (
                                    <div className="mt-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-gray-800 font-medium">Selected Image</span>
                                                <button onClick={handleReset} className="text-gray-600 hover:text-gray-800 transition-colors">Reset</button>
                                            </div>
                                            <img src={URL.createObjectURL(selectedImage)} alt="Selected" className="w-full h-48 object-cover rounded-lg" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="glass-effect rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                                    Analysis Results
                                </h2>
                                <AnimatePresence mode="wait">
                                    {isLoading && (
                                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <LoadingSpinner />
                                        </motion.div>
                                    )}
                                    {error && (
                                        <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                                            <div className="flex items-center text-red-300">
                                                <AlertCircle className="w-5 h-5 mr-2" />
                                                <span className="font-medium">Error</span>
                                            </div>
                                            <p className="text-red-200 mt-2 text-sm">{error}</p>
                                        </motion.div>
                                    )}
                                    {predictions && (
                                        <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <PredictionResults predictions={predictions} />
                                        </motion.div>
                                    )}
                                    {!isLoading && !error && !predictions && (
                                        <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600">Upload an image to see AI analysis results</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


