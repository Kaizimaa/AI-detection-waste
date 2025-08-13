# Konfigurasi untuk model best.pt
# Sesuaikan dengan kelas yang ada di model Anda

# Mapping kelas ID ke nama kelas (sesuai model best.pt)
WASTE_CLASSES = {
    0: "Botol Plastik",
    1: "Kaca",
    2: "Kaleng",
    3: "Kardus",
    4: "Kertas",
    5: "Plastik"
}

# Konfigurasi model
MODEL_CONFIG = {
    "model_path": "./models/best.pt",
    "confidence_threshold": 0.5,
    "model_type": "yolov8",
    "input_size": (640, 640),  # Sesuaikan dengan input size model Anda
    "max_detections": 100
}

# Informasi model
MODEL_INFO = {
    "name": "best.pt",
    "version": "1.0",
    "description": "Model deteksi sampah anorganik",
    "classes": WASTE_CLASSES,
    "total_classes": len(WASTE_CLASSES)
}

# Contoh penggunaan:
# from model_config import WASTE_CLASSES, MODEL_CONFIG, MODEL_INFO 