# CarePlusAI - Breast Cancer Detection

<div align="center">
  <img src="public/logo512_primary.svg" alt="CarePlusAI Logo" width="100" height="100">
  <h3>AI-Powered Breast Cancer Detection from Histology Images</h3>
  <p>Modern React frontend with Python backend for accurate breast cancer classification</p>
</div>

## ✨ Features

- **🎨 Modern React UI**: Beautiful, responsive interface with drag-and-drop upload
- **🤖 AI Analysis**: DenseNet201 model for high-accuracy classification
- **📊 Detailed Results**: Comprehensive analysis with medical insights and confidence scores
- **🏥 8-Class Classification**: Benign/Malignant × 4 density levels
- **⚡ Real-time Predictions**: Instant analysis with visual progress indicators
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🔍 Medical Interpretation**: Detailed medical analysis and recommendations

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (recommended: Python 3.9)
- **Node.js 16+** (recommended: Node.js 18+)
- **npm** or **yarn**
- **Git**

### Installation

**Option 1: Automated Setup (Recommended)**
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

**Option 2: Manual Setup**
```bash
# Clone the repository
git clone <repository-url>
cd Breast-Cancer-Detection

# Install Python dependencies
pip install -r requirements.txt

# Install React dependencies
npm install
```

### Running the Application

**Method 1: Using npm scripts (from project root)**
```bash
# Start the API server
npm run start:breast-cancer-api

# In a new terminal, start the React app
npm run start:breast-cancer
```

**Method 2: Manual startup**
```bash
# Terminal 1: Start the API server
python api_server.py

# Terminal 2: Start the React app
npm start
```

**Method 3: Development mode**
```bash
# Start API server in debug mode
python api_server.py

# Start React app in development mode
npm run dev
```

3. **Open your browser**: `http://localhost:3000`

## 📁 Project Structure

```
Breast-Cancer-Detection/
├── src/                          # React frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── Header.js            # Application header with CarePlusAI branding
│   │   ├── ImageUpload.js       # Drag-and-drop image upload component
│   │   ├── PredictionResults.js # Results display with tabs and analysis
│   │   ├── LoadingSpinner.js    # Loading animation component
│   │   └── Footer.js            # Application footer
│   ├── services/                 # API integration and utilities
│   │   └── api.js               # API service for backend communication
│   ├── App.js                    # Main React application component
│   ├── index.js                  # React application entry point
│   └── index.css                 # Global styles
├── public/                       # Static files and assets
│   ├── logo512_primary.svg      # CarePlusAI logo
│   ├── index.html               # HTML template
│   └── manifest.json            # PWA manifest
├── model/                        # AI model files
│   └── model.h5                 # Pre-trained DenseNet201 model
├── weights/                      # Model weights
│   └── modeldense1.h5           # Model weights file
├── Test_images/                  # Sample test images
│   ├── Density1Malignant.jpg    # Test image: Malignant, Density 1
│   ├── Density2Malignant.jpg    # Test image: Malignant, Density 2
│   ├── Density3Benign.jpg       # Test image: Benign, Density 3
│   └── Density4Benign.jpg       # Test image: Benign, Density 4
├── image/                        # Additional sample images
├── api_server.py                # Flask API server
├── requirements.txt             # Python dependencies
├── package.json                 # React dependencies and scripts
├── setup.bat                    # Windows setup script
├── setup.sh                     # Linux/Mac setup script
└── README.md                    # This file
```

## 🎯 Usage Guide

### 1. **Image Upload**
- Drag and drop a histology image onto the upload area
- Or click "Choose File" to select an image
- Supported formats: JPG, JPEG, PNG, BMP, TIFF
- Recommended size: 224x224 pixels (auto-resized)

### 2. **AI Analysis**
- The image is automatically preprocessed (sharpening, normalization)
- DenseNet201 model analyzes the image
- Processing typically takes 2-5 seconds

### 3. **Results Interpretation**
- **Overview Tab**: Primary finding with confidence score and risk level
- **Detailed Analysis Tab**: All 8 class predictions with confidence bars
- **Medical Info Tab**: Medical interpretation and recommendations

### 4. **Understanding Results**
- **Green Bar (80%+)**: High confidence prediction
- **Yellow Bar (60-79%)**: Moderate confidence prediction
- **Red Bar (<60%)**: Low confidence prediction

## 🔬 Classification Categories

| Class | Description | Clinical Significance |
|-------|-------------|----------------------|
| **Benign with Density=1** | Low density, non-cancerous | Normal breast tissue, low risk |
| **Malignant with Density=1** | Low density, cancerous | Early-stage cancer, treatable |
| **Benign with Density=2** | Medium-low density, non-cancerous | Normal variation, routine monitoring |
| **Malignant with Density=2** | Medium-low density, cancerous | Moderate risk, requires treatment |
| **Benign with Density=3** | Medium-high density, non-cancerous | Dense tissue, regular screening |
| **Malignant with Density=3** | Medium-high density, cancerous | Higher risk, aggressive treatment |
| **Benign with Density=4** | High density, non-cancerous | Very dense tissue, frequent monitoring |
| **Malignant with Density=4** | High density, cancerous | Highest risk, immediate intervention |

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons

### Backend
- **Python 3.8+** - Backend language
- **Flask** - Lightweight web framework
- **TensorFlow/Keras** - Deep learning framework
- **OpenCV** - Computer vision library
- **PIL (Pillow)** - Image processing

### AI Model
- **DenseNet201** - Pre-trained CNN architecture
- **Transfer Learning** - Fine-tuned for histology images
- **8-Class Classification** - Benign/Malignant × 4 density levels

## 🔧 Troubleshooting

### Common Issues

**1. Model not loading**
```bash
# Check if model files exist
ls model/model.h5
ls weights/modeldense1.h5

# If missing, the app will create a new model
```

**2. API server not starting**
```bash
# Check Python version
python --version

# Install missing dependencies
pip install -r requirements.txt

# Check port availability
netstat -an | grep 7860
```

**3. React app not starting**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Check Node.js version
node --version
```

**4. CORS errors**
- Ensure the API server is running on port 7860
- Check that Flask-CORS is installed
- Verify the frontend is making requests to the correct API endpoint

**5. Model always predicting the same class**
- Check the console output for debugging information
- Verify model weights are loading correctly
- Test with different sample images

### Debug Mode

Enable debug logging by setting environment variables:
```bash
# Windows
set FLASK_DEBUG=1
python api_server.py

# Linux/Mac
export FLASK_DEBUG=1
python api_server.py
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/predict` | POST | Image analysis endpoint |
| `/api/info` | GET | API information |

### Example API Usage

```bash
# Health check
curl http://localhost:7860/health

# Predict (with image file)
curl -X POST -F "image=@test_image.jpg" http://localhost:7860/predict
```

## 🧪 Testing

### Test Images
The `Test_images/` directory contains sample images for testing:
- `Density1Malignant.jpg` - Test malignant classification
- `Density2Malignant.jpg` - Test different density levels
- `Density3Benign.jpg` - Test benign classification
- `Density4Benign.jpg` - Test high density benign

### Manual Testing
1. Upload each test image
2. Verify predictions are reasonable
3. Check confidence scores
4. Test different image formats

## 🔒 Security & Privacy

- **No Data Storage**: Images are processed in memory only
- **Local Processing**: All analysis happens on your machine
- **No Network Calls**: Model runs locally, no external API calls
- **Privacy First**: Images are not sent to external servers

## ⚠️ Important Disclaimer

**🚨 MEDICAL DISCLAIMER**

This tool is designed for **research and educational purposes only**. It should **NOT** be used as a substitute for professional medical diagnosis, treatment, or decision-making.

**Important Notes:**
- Always consult with qualified healthcare professionals for medical decisions
- This AI model is not FDA-approved for clinical use
- Results should be interpreted by trained medical professionals
- False positives and false negatives are possible
- Regular medical screening and professional consultation are essential

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for **research and educational purposes only**. 

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

<div align="center">
  <p>Made with ❤️ for medical research and education</p>
  <p><strong>CarePlusAI</strong> - Advancing Healthcare Through AI</p>
</div>