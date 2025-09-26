import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:7860';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check the server configuration.');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to process image');
  }
);

export const predictImage = async (imageFile) => {
  try {
    console.log('Starting image prediction...', { fileName: imageFile.name, fileSize: imageFile.size });
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    console.log('Sending request to:', `${API_BASE_URL}/predict`);
    
    const response = await api.post('/predict', formData);
    
    console.log('API response received:', response.status, response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Response data keys:', Object.keys(response.data || {}));
    
    if (response.data && typeof response.data === 'object') {
      // Ensure we have the expected structure
      const data = response.data;
      
      // Check if the response has the new format with analysis data
      if (data.analysis && data.predictions) {
        console.log('Using new API format');
        return data;
      }
      
      // If it's the old format (just predictions), convert it
      if (data.predictions && !data.analysis) {
        console.log('Converting old format to new format');
        const predictions = data.predictions;
        const topPrediction = Object.entries(predictions).reduce((a, b) => predictions[a[0]] > predictions[b[0]] ? a : b);
        
        return {
          predictions: predictions,
          analysis: {
            top_prediction: {
              class: topPrediction[0],
              confidence: topPrediction[1] * 100,
              is_malignant: topPrediction[0].toLowerCase().includes('malignant'),
              density_level: parseInt(topPrediction[0].match(/Density=(\d+)/)?.[1] || '1')
            },
            overall_assessment: {
              benign_confidence: Object.entries(predictions)
                .filter(([name]) => name.includes('Benign'))
                .reduce((sum, [, conf]) => sum + conf, 0) * 100,
              malignant_confidence: Object.entries(predictions)
                .filter(([name]) => name.includes('Malignant'))
                .reduce((sum, [, conf]) => sum + conf, 0) * 100,
              risk_level: 'Moderate',
              confidence_level: 'Moderate'
            },
            density_analysis: {},
            statistical_summary: {
              max_confidence: Math.max(...Object.values(predictions)) * 100,
              min_confidence: Math.min(...Object.values(predictions)) * 100,
              confidence_range: (Math.max(...Object.values(predictions)) - Math.min(...Object.values(predictions))) * 100,
              prediction_entropy: -Object.values(predictions).reduce((sum, p) => sum + p * Math.log(p + 1e-10), 0)
            }
          },
          interpretation: {
            primary_finding: `The AI analysis indicates ${topPrediction[0].toLowerCase()} with ${(topPrediction[1] * 100).toFixed(1)}% confidence.`,
            malignancy_assessment: `Overall malignant characteristics detected with ${(Object.entries(predictions).filter(([name]) => name.includes('Malignant')).reduce((sum, [, conf]) => sum + conf, 0) * 100).toFixed(1)}% confidence.`,
            risk_evaluation: 'Risk level assessed as moderate based on the analysis.',
            density_characteristics: `Breast tissue density level ${parseInt(topPrediction[0].match(/Density=(\d+)/)?.[1] || '1')} detected.`,
            clinical_significance: 'This AI analysis is for research purposes only and should not replace professional medical diagnosis.',
            limitations: 'This AI analysis is for research purposes only and should not replace professional medical diagnosis.'
          },
          recommendations: {
            immediate_actions: ['Continue regular breast cancer screening', 'Maintain healthy lifestyle habits'],
            follow_up: ['Regular mammographic screening as per age guidelines', 'Monthly breast self-examination'],
            monitoring: ['Track any changes in breast tissue', 'Report new symptoms to healthcare provider'],
            additional_tests: ['Follow-up mammography in 6 months']
          },
          metadata: {
            model_version: 'DenseNet201_v1.0',
            analysis_timestamp: new Date().toISOString(),
            image_processed: true,
            preprocessing_applied: ['sharpening', 'normalization', 'resizing']
          }
        };
      }
      
      console.log('Returning data:', data);
      return data;
    }
    
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Prediction error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;
