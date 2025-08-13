#!/usr/bin/env python3
"""
Python Backend untuk Deteksi Sampah Anorganik
Integrasi dengan Next.js Frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import time
import os
from PIL import Image
import io

# Import YOLOv8 (pastikan sudah install ultralytics)
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: ultralytics tidak tersedia. Install dengan: pip install ultralytics")

app = Flask(__name__)
CORS(app)  # Enable CORS untuk Next.js

# Import konfigurasi model
try:
    from model_config import WASTE_CLASSES, MODEL_CONFIG, MODEL_INFO
except ImportError:
    # Fallback jika file config tidak ada
    WASTE_CLASSES = {
        0: "Botol Plastik",
        1: "Kaca", 
        2: "Kaleng",
        3: "Kardus",
        4: "Kertas",
        5: "Plastik"
    }
    MODEL_CONFIG = {
        "model_path": "./models/best.pt",
        "confidence_threshold": 0.5,
        "model_type": "yolov8"
    }

# Load model YOLOv8
model = None
if YOLO_AVAILABLE:
    try:
        # Ganti path ke model Anda
        model_path = os.getenv('YOLO_MODEL_PATH', MODEL_CONFIG.get('model_path', './models/best.pt'))
        if os.path.exists(model_path):
            model = YOLO(model_path)
            print(f"Model loaded: {model_path}")
        else:
            print(f"Model tidak ditemukan: {model_path}")
    except Exception as e:
        print(f"Error loading model: {e}")

def base64_to_image(base64_string):
    """Convert base64 string ke OpenCV image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_data))
        
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        return opencv_image
    except Exception as e:
        print(f"Error converting base64 to image: {e}")
        return None

def process_detection_results(results, confidence_threshold=0.5):
    """Process YOLOv8 detection results"""
    detections = []
    
    if results and len(results) > 0:
        result = results[0]  # Ambil hasil pertama
        
        if result.boxes is not None:
            boxes = result.boxes
            for box in boxes:
                # Get coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Get confidence
                confidence = float(box.conf[0].cpu().numpy())
                
                # Get class
                class_id = int(box.cls[0].cpu().numpy())
                class_name = WASTE_CLASSES.get(class_id, f"Class_{class_id}")
                
                # Filter berdasarkan confidence threshold
                if confidence >= confidence_threshold:
                    detection = {
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": [int(x1), int(y1), int(x2-x1), int(y2-y1)]  # [x, y, width, height]
                    }
                    detections.append(detection)
    
    return detections

@app.route('/detect', methods=['POST'])
def detect_waste():
    """Endpoint untuk deteksi sampah anorganik"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'error': 'No image data provided'
            }), 400
        
        # Get parameters
        image_base64 = data['image']
        confidence_threshold = data.get('confidence_threshold', 0.5)
        model_type = data.get('model_type', 'yolov8')
        
        # Start timing
        start_time = time.time()
        
        # Convert base64 to image
        image = base64_to_image(image_base64)
        if image is None:
            return jsonify({
                'error': 'Invalid image data'
            }), 400
        
        # Kalau model tidak ada, kirim error
        if model is None or not YOLO_AVAILABLE:
            return jsonify({
                'error': 'Model YOLOv8 tidak ditemukan atau belum dimuat'
            }), 500
        
        # Perform detection
        results = model(image, conf=confidence_threshold)
        detections = process_detection_results(results, confidence_threshold)
        
        processing_time = time.time() - start_time
        
        return jsonify({
            'success': True,
            'detections': detections,
            'message': f'Deteksi berhasil dengan {len(detections)} objek ditemukan',
            'processing_time': round(processing_time, 3),
            'model_info': f'YOLOv8 - {model_type}',
            'confidence_threshold': confidence_threshold
        })
            
    except Exception as e:
        return jsonify({
            'error': f'Detection error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'yolo_available': YOLO_AVAILABLE
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'model_loaded': model is not None,
        'yolo_available': YOLO_AVAILABLE,
        'waste_classes': WASTE_CLASSES,
        'model_config': MODEL_CONFIG,
        'model_info': MODEL_INFO if 'MODEL_INFO' in globals() else None
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting Python backend on port {port}")
    print(f"YOLO Available: {YOLO_AVAILABLE}")
    print(f"Model Loaded: {model is not None}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 