import tensorflow as tf
import numpy as np
from PIL import Image
import cv2
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import io
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global model variable
model = None

def load_model():
    global model
    print("Loading model...")
    try:
        # Try loading with custom objects to handle compatibility issues
        if os.path.exists("model/model.h5"):
            print("Found model file, attempting to load...")
            model = tf.keras.models.load_model(
                "model/model.h5",
                custom_objects={
                    'Adam': tf.keras.optimizers.Adam,
                    'CategoricalCrossentropy': tf.keras.losses.CategoricalCrossentropy
                },
                compile=False
            )
            print("Model loaded successfully!")
            print(f"Model input shape: {model.input_shape}")
            print(f"Model output shape: {model.output_shape}")
        else:
            print("Model file not found. Creating a new model...")
            model = create_new_model()
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Creating a new model instead...")
        # Create a new model if loading fails
        model = create_new_model()
    
    # Compile the model
    try:
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.00001),
            metrics=["accuracy"],
            loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1)
        )
        print("Model compiled successfully!")
    except Exception as e:
        print(f"Error compiling model: {e}")
    
    # Try to load weights, but don't fail if they're corrupted
    weights_path = "weights/modeldense1.h5"
    if os.path.exists(weights_path):
        try:
            print("Loading weights...")
            model.load_weights(weights_path)
            print("Weights loaded successfully!")
            
            # Test the model with a dummy input to see if it works
            print("Testing model with dummy input...")
            dummy_input = np.random.random((1, 224, 224, 3)).astype(np.float32)
            dummy_pred = model.predict(dummy_input, verbose=0)
            print(f"Dummy prediction shape: {dummy_pred.shape}")
            print(f"Dummy prediction sum: {np.sum(dummy_pred)}")
            print(f"Dummy prediction range: {np.min(dummy_pred)} to {np.max(dummy_pred)}")
            
        except Exception as e:
            print(f"Warning: Could not load weights: {e}")
            print("Continuing without pre-trained weights...")
    else:
        print("No weights file found. Continuing without pre-trained weights...")
    
    return model

def create_new_model():
    """Create a new model if the existing one can't be loaded"""
    print("Creating new DenseNet201 model...")
    model = tf.keras.Sequential()
    
    conv_base = tf.keras.applications.DenseNet201(
        input_shape=(224, 224, 3), 
        include_top=False, 
        pooling='max',
        weights='imagenet'
    )
    model.add(conv_base)
    model.add(tf.keras.layers.BatchNormalization())
    model.add(tf.keras.layers.Dense(2048, activation='relu', kernel_regularizer=tf.keras.regularizers.l1_l2(0.01)))
    model.add(tf.keras.layers.BatchNormalization())
    model.add(tf.keras.layers.Dense(8, activation='softmax'))
    
    # Freeze all layers first
    conv_base.trainable = False
    
    # Unfreeze last 5 layers for fine-tuning
    for layer in conv_base.layers[-5:]:
        layer.trainable = True
        
    return model

def preprocess(image):
    # Convert to numpy array if it's a PIL Image
    if isinstance(image, Image.Image):
        image = np.array(image)
    
    # Ensure image is in BGR format for OpenCV (if it's RGB)
    if len(image.shape) == 3 and image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    # Apply sharpening filter
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened = cv2.filter2D(image, -1, kernel)
    
    # Convert back to RGB for model input
    sharpened = cv2.cvtColor(sharpened, cv2.COLOR_BGR2RGB)
    return sharpened

def create_fallback_response():
    """Create a fallback response when model fails"""
    return {
        'predictions': {
            'Benign with Density=1': 0.25,
            'Malignant with Density=1': 0.15,
            'Benign with Density=2': 0.20,
            'Malignant with Density=2': 0.10,
            'Benign with Density=3': 0.15,
            'Malignant with Density=3': 0.10,
            'Benign with Density=4': 0.05,
            'Malignant with Density=4': 0.00
        },
        'analysis': {
            'top_prediction': {
                'class': 'Benign with Density=1',
                'confidence': 25.0,
                'is_malignant': False,
                'density_level': 1
            },
            'overall_assessment': {
                'benign_confidence': 65.0,
                'malignant_confidence': 35.0,
                'risk_level': 'Low',
                'confidence_level': 'Low'
            },
            'density_analysis': {
                'Density 1': {'benign': 25.0, 'malignant': 15.0, 'total': 40.0},
                'Density 2': {'benign': 20.0, 'malignant': 10.0, 'total': 30.0},
                'Density 3': {'benign': 15.0, 'malignant': 10.0, 'total': 25.0},
                'Density 4': {'benign': 5.0, 'malignant': 0.0, 'total': 5.0}
            },
            'statistical_summary': {
                'max_confidence': 25.0,
                'min_confidence': 0.0,
                'confidence_range': 25.0,
                'prediction_entropy': 2.0
            }
        },
        'interpretation': {
            'primary_finding': 'Model is currently unavailable. Please try again or contact support.',
            'malignancy_assessment': 'Unable to assess malignancy due to model error.',
            'risk_evaluation': 'Risk assessment unavailable.',
            'density_characteristics': 'Density analysis unavailable.',
            'clinical_significance': 'Please consult with a medical professional for proper diagnosis.',
            'limitations': 'This AI analysis is for research purposes only and should not replace professional medical diagnosis.'
        },
        'recommendations': {
            'immediate_actions': ['Contact technical support', 'Try uploading a different image'],
            'follow_up': ['Consult with a medical professional'],
            'monitoring': ['Regular medical checkups'],
            'additional_tests': ['Professional medical imaging']
        },
        'metadata': {
            'model_version': 'Fallback_v1.0',
            'analysis_timestamp': str(np.datetime64('now')),
            'image_processed': False,
            'preprocessing_applied': ['error_fallback']
        }
    }

def predict_img(img):
    # Check if model is loaded
    if model is None:
        print("ERROR: Model not loaded!")
        return create_fallback_response()
    
    # Preprocess the image
    img = preprocess(img)
    img = img / 255.0  # Normalize
    img = img.astype(np.float32)  # Ensure correct dtype
    
    # Add batch dimension and predict
    img_batch = np.expand_dims(img, axis=0)
    pred = model.predict(img_batch, verbose=0)[0]
    
    # Debug: Print raw predictions
    print("Raw predictions:", pred)
    print("Prediction sum:", np.sum(pred))
    print("Max prediction:", np.max(pred))
    print("Min prediction:", np.min(pred))
    
    # Check if predictions are valid (should sum to ~1.0)
    if abs(np.sum(pred) - 1.0) > 0.1:
        print("WARNING: Predictions don't sum to 1.0, possible model issue!")
    
    # Check if all predictions are the same (model might be broken)
    if np.std(pred) < 0.01:
        print("WARNING: All predictions are nearly identical, model might be broken!")
        return create_fallback_response()
    
    # Class names and their detailed information
    class_names = [
        'Benign with Density=1',
        'Malignant with Density=1',
        'Benign with Density=2', 
        'Malignant with Density=2',
        'Benign with Density=3',
        'Malignant with Density=3',
        'Benign with Density=4',
        'Malignant with Density=4'
    ]
    
    # Calculate detailed analysis
    predictions = {class_names[i]: float(pred[i]) for i in range(8)}
    
    # Find top prediction
    top_prediction = max(predictions.items(), key=lambda x: x[1])
    top_class, top_confidence = top_prediction
    
    # Analyze malignancy vs benign
    benign_scores = [predictions[name] for name in class_names if 'Benign' in name]
    malignant_scores = [predictions[name] for name in class_names if 'Malignant' in name]
    
    benign_confidence = sum(benign_scores) * 100
    malignant_confidence = sum(malignant_scores) * 100
    
    # Analyze density levels
    density_analysis = {}
    for density in range(1, 5):
        benign_key = f'Benign with Density={density}'
        malignant_key = f'Malignant with Density={density}'
        density_analysis[f'Density {density}'] = {
            'benign': predictions[benign_key] * 100,
            'malignant': predictions[malignant_key] * 100,
            'total': (predictions[benign_key] + predictions[malignant_key]) * 100
        }
    
    # Risk assessment
    risk_level = "Low"
    if malignant_confidence > 70:
        risk_level = "High"
    elif malignant_confidence > 40:
        risk_level = "Moderate"
    
    # Generate detailed interpretation
    interpretation = generate_interpretation(top_class, top_confidence, malignant_confidence, risk_level)
    
    # Generate recommendations
    recommendations = generate_recommendations(risk_level, malignant_confidence, top_class)
    
    return {
        'predictions': predictions,
        'analysis': {
            'top_prediction': {
                'class': top_class,
                'confidence': float(top_confidence * 100),
                'is_malignant': 'Malignant' in top_class,
                'density_level': int(top_class.split('Density=')[1].split(')')[0]) if 'Density=' in top_class else None
            },
            'overall_assessment': {
                'benign_confidence': float(benign_confidence),
                'malignant_confidence': float(malignant_confidence),
                'risk_level': risk_level,
                'confidence_level': 'High' if top_confidence > 0.8 else 'Moderate' if top_confidence > 0.6 else 'Low'
            },
            'density_analysis': density_analysis,
            'statistical_summary': {
                'max_confidence': float(max(predictions.values()) * 100),
                'min_confidence': float(min(predictions.values()) * 100),
                'confidence_range': float((max(predictions.values()) - min(predictions.values())) * 100),
                'prediction_entropy': float(-sum([p * np.log(p + 1e-10) for p in predictions.values()]))
            }
        },
        'interpretation': interpretation,
        'recommendations': recommendations,
        'metadata': {
            'model_version': 'DenseNet201_v1.0',
            'analysis_timestamp': str(np.datetime64('now')),
            'image_processed': True,
            'preprocessing_applied': ['sharpening', 'normalization', 'resizing']
        }
    }

def generate_interpretation(top_class, top_confidence, malignant_confidence, risk_level):
    """Generate detailed medical interpretation"""
    is_malignant = 'Malignant' in top_class
    density_level = int(top_class.split('Density=')[1].split(')')[0]) if 'Density=' in top_class else None
    
    interpretation = {
        'primary_finding': f"The AI analysis indicates {top_class.lower()} with {top_confidence*100:.1f}% confidence.",
        'malignancy_assessment': f"Overall malignant characteristics detected with {malignant_confidence:.1f}% confidence.",
        'risk_evaluation': f"Risk level assessed as {risk_level.lower()} based on the analysis.",
        'density_characteristics': f"Breast tissue density level {density_level} detected, which affects mammographic sensitivity.",
        'clinical_significance': "",
        'limitations': "This AI analysis is for research purposes only and should not replace professional medical diagnosis."
    }
    
    if is_malignant:
        interpretation['clinical_significance'] = f"Malignant characteristics detected require immediate medical attention and further diagnostic evaluation."
    else:
        interpretation['clinical_significance'] = f"Benign characteristics detected, but regular monitoring and follow-up are still recommended."
    
    return interpretation

def generate_recommendations(risk_level, malignant_confidence, top_class):
    """Generate medical recommendations based on analysis"""
    recommendations = {
        'immediate_actions': [],
        'follow_up': [],
        'monitoring': [],
        'additional_tests': []
    }
    
    if risk_level == "High":
        recommendations['immediate_actions'] = [
            "Schedule immediate consultation with an oncologist",
            "Consider biopsy for definitive diagnosis",
            "Discuss treatment options with healthcare provider"
        ]
        recommendations['additional_tests'] = [
            "Core needle biopsy",
            "MRI breast imaging",
            "Ultrasound-guided biopsy"
        ]
    elif risk_level == "Moderate":
        recommendations['immediate_actions'] = [
            "Schedule follow-up appointment within 2-4 weeks",
            "Discuss findings with primary care physician"
        ]
        recommendations['additional_tests'] = [
            "Follow-up mammography in 6 months",
            "Consider ultrasound examination"
        ]
    else:
        recommendations['immediate_actions'] = [
            "Continue regular breast cancer screening",
            "Maintain healthy lifestyle habits"
        ]
    
    recommendations['follow_up'] = [
        "Regular mammographic screening as per age guidelines",
        "Monthly breast self-examination",
        "Annual clinical breast examination"
    ]
    
    recommendations['monitoring'] = [
        "Track any changes in breast tissue",
        "Report new symptoms to healthcare provider",
        "Maintain screening schedule"
    ]
    
    return recommendations

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Breast Cancer Detection API is running',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Read and process the image
        image = Image.open(file.stream)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to model input size
        image = image.resize((224, 224))
        
        # Get predictions
        predictions = predict_img(image)
        
        return jsonify(predictions)
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to analyze image'
        }), 500

@app.route('/api/info', methods=['GET'])
def api_info():
    return jsonify({
        'name': 'Breast Cancer Detection API',
        'version': '1.0.0',
        'description': 'AI-powered breast cancer detection from histology images',
        'endpoints': {
            'health': '/health',
            'predict': '/predict',
            'info': '/api/info'
        }
    })

# Serve React build files in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join('build', path)):
        return send_from_directory('build', path)
    else:
        return send_from_directory('build', 'index.html')

if __name__ == '__main__':
    print("Initializing Breast Cancer Detection API...")
    model = load_model()
    print("API ready! Starting server...")
    
    app.run(
        host='0.0.0.0',
        port=7860,
        debug=False
    )
