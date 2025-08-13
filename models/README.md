# 📁 Models Directory

Folder ini untuk menyimpan model YOLOv8 Anda.

## 📋 Cara Penggunaan

1. **Model `best.pt` sudah tersedia di folder ini**
   ```
   models/
   └── best.pt
   ```

2. **Path sudah dikonfigurasi di `python_backend_example.py`:**
   ```python
   model_path = os.getenv('YOLO_MODEL_PATH', './models/best.pt')
   ```

3. **Update kelas sampah sesuai model Anda:**
   ```python
   WASTE_CLASSES = {
       0: "Botol Plastik",
       1: "Kaleng Aluminium", 
       2: "Kardus",
       3: "Kaca",
       4: "Plastik",
       5: "Logam"
       # Sesuaikan dengan model Anda
   }
   ```

## 🔧 Format Model

- **Format**: `.pt` (PyTorch)
- **Framework**: YOLOv8 (ultralytics)
- **Input**: RGB image
- **Output**: Bounding boxes dengan confidence scores

## 📊 Model Information

Jika Anda memiliki informasi tentang model Anda, tambahkan di sini:

- **Training Data**: [Deskripsi dataset]
- **Classes**: [Daftar kelas yang dapat dideteksi]
- **Accuracy**: [Akurasi model]
- **Training Date**: [Tanggal training]

## 🚀 Testing Model

Untuk test model Anda:

1. **Jalankan Python backend:**
   ```bash
   python python_backend_example.py
   ```

2. **Test health check:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Test model info:**
   ```bash
   curl http://localhost:5000/model-info
   ```

## 📝 Notes

- Pastikan model Anda kompatibel dengan YOLOv8
- File model bisa besar, pastikan ada cukup storage
- Backup model Anda di tempat yang aman 