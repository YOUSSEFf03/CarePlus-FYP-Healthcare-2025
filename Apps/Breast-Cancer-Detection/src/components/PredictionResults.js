import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  BarChart3,
  FileText,
  Stethoscope,
  Calendar,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PredictionResults = ({ predictions }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    interpretation: false,
    recommendations: false,
    statistics: false
  });

  if (!predictions) {
    return null;
  }

  console.log('PredictionResults received data:', predictions);
  console.log('Predictions type:', typeof predictions);
  console.log('Predictions keys:', Object.keys(predictions || {}));

  // Handle both old and new API response formats
  const predData = predictions.predictions || predictions;
  const analysis = predictions.analysis || {};
  const interpretation = predictions.interpretation || {};
  const recommendations = predictions.recommendations || {};
  const metadata = predictions.metadata || {};

  // Ensure predData is valid and has values
  if (!predData || typeof predData !== 'object' || Object.keys(predData).length === 0) {
    console.error('Invalid prediction data:', predData);
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center text-red-300">
          <AlertTriangle className="w-6 h-6 mr-3" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-200 mt-2">Invalid prediction data received from server</p>
      </div>
    );
  }

  // Provide fallback data for missing analysis
  const top_prediction = analysis.top_prediction || {
    class: Object.keys(predData)[0] || 'Unknown',
    confidence: Math.max(...Object.values(predData)) * 100 || 0,
    is_malignant: false,
    density_level: 1
  };

  const overall_assessment = analysis.overall_assessment || {
    benign_confidence: 50,
    malignant_confidence: 50,
    risk_level: 'Moderate',
    confidence_level: 'Moderate'
  };

  const density_analysis = analysis.density_analysis || {};
  const statistical_summary = analysis.statistical_summary || {
    max_confidence: Math.max(...Object.values(predData)) * 100 || 0,
    min_confidence: Math.min(...Object.values(predData)) * 100 || 0,
    confidence_range: 0,
    prediction_entropy: 0
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'Moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
    { id: 'medical', label: 'Medical Info', icon: Stethoscope }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Prediction Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Primary Finding</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(overall_assessment.risk_level)}`}>
                {overall_assessment.risk_level} Risk
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium text-lg">{top_prediction.class}</span>
                <span className={`text-2xl font-bold ${getConfidenceColor(top_prediction.confidence)}`}>
                  {top_prediction.confidence.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${top_prediction.confidence}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-4 rounded-full ${getConfidenceBg(top_prediction.confidence)}`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-600">
                  <span className="text-gray-800 font-medium">Density Level:</span> {top_prediction.density_level}
                </div>
                <div className="text-gray-600">
                  <span className="text-gray-800 font-medium">Type:</span> 
                  <span className={top_prediction.is_malignant ? 'text-red-600 ml-1' : 'text-green-600 ml-1'}>
                    {top_prediction.is_malignant ? 'Malignant' : 'Benign'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-gray-800 font-medium">Benign Confidence</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {overall_assessment.benign_confidence.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-gray-800 font-medium">Malignant Confidence</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {overall_assessment.malignant_confidence.toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Detailed Analysis Tab */}
      {activeTab === 'detailed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* All Predictions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">All Predictions</h3>
            <div className="space-y-3">
              {Object.entries(predData)
                .sort(([,a], [,b]) => b - a)
                .map(([className, confidence], index) => (
                <motion.div
                  key={className}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-medium">{className}</span>
                    </div>
                    <span className={`font-bold ${getConfidenceColor(confidence * 100)}`}>
                      {(confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${getConfidenceBg(confidence * 100)}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Density Analysis */}
          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-black mb-4">Density Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(density_analysis).map(([density, data]) => (
                <div key={density} className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-black font-medium mb-3">{density}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Benign:</span>
                      <span className="text-black">{data.benign.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Malignant:</span>
                      <span className="text-black">{data.malignant.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-red-500" 
                           style={{ width: `${data.total}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistical Summary */}
          <div className="bg-white/10 rounded-xl p-6">
            <button
              onClick={() => toggleSection('statistics')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-xl font-semibold text-black">Statistical Summary</h3>
              {expandedSections.statistics ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
            </button>
            
            <AnimatePresence>
              {expandedSections.statistics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-black/70">Max Confidence:</span>
                      <div className="text-black font-medium">{statistical_summary.max_confidence.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-black/70">Min Confidence:</span>
                      <div className="text-black font-medium">{statistical_summary.min_confidence.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-black/70">Confidence Range:</span>
                      <div className="text-black font-medium">{statistical_summary.confidence_range.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <span className="text-black/70">Prediction Entropy:</span>
                      <div className="text-black font-medium">{statistical_summary.prediction_entropy.toFixed(3)}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Medical Information Tab */}
      {activeTab === 'medical' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Interpretation */}
          <div className="bg-white/10 rounded-xl p-6">
            <button
              onClick={() => toggleSection('interpretation')}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-xl font-semibold text-black flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Medical Interpretation
              </h3>
              {expandedSections.interpretation ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
            </button>
            
            <AnimatePresence>
              {expandedSections.interpretation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {Object.entries(interpretation).map(([key, value]) => (
                    <div key={key} className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-black font-medium mb-2 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-black/80 text-sm">{value}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recommendations */}
          <div className="bg-white/10 rounded-xl p-6">
            <button
              onClick={() => toggleSection('recommendations')}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-xl font-semibold text-black flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Medical Recommendations
              </h3>
              {expandedSections.recommendations ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
            </button>
            
            <AnimatePresence>
              {expandedSections.recommendations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {Object.entries(recommendations).map(([category, items]) => (
                    <div key={category} className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-black font-medium mb-3 capitalize flex items-center">
                        {category === 'immediate_actions' && <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />}
                        {category === 'follow_up' && <Calendar className="w-4 h-4 mr-2 text-blue-400" />}
                        {category === 'monitoring' && <Activity className="w-4 h-4 mr-2 text-green-400" />}
                        {category === 'additional_tests' && <FileText className="w-4 h-4 mr-2 text-purple-400" />}
                        {category.replace(/_/g, ' ')}
                      </h4>
                      <ul className="space-y-2">
                        {items.map((item, index) => (
                          <li key={index} className="text-black/80 text-sm flex items-start">
                            <span className="w-2 h-2 bg-black/40 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata */}
          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-black mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Analysis Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-black/70">Model Version:</span>
                <div className="text-black font-medium">{metadata.model_version}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-black/70">Analysis Time:</span>
                <div className="text-black font-medium">{new Date(metadata.analysis_timestamp).toLocaleString()}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-black/70">Image Processed:</span>
                <div className="text-black font-medium">{metadata.image_processed ? 'Yes' : 'No'}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-black/70">Preprocessing:</span>
                <div className="text-black font-medium">{metadata.preprocessing_applied.join(', ')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PredictionResults;
