# 🗑️ Deteksi Sampah Anorganik

Aplikasi web untuk mendeteksi sampah anorganik menggunakan AI YOLOv8 dengan antarmuka yang modern dan responsif.

## ✨ Fitur Utama

- **📷 Kamera Real-time**: Ambil foto langsung dari kamera
- **📁 Upload Gambar**: Upload file gambar dari perangkat
- **🤖 AI Detection**: Deteksi sampah menggunakan model YOLOv8
- **📊 Hasil Deteksi**: Tampilkan bounding box dan tingkat kepercayaan
- **📱 Responsive Design**: Tampilan yang optimal di desktop dan mobile
- **⚡ Real-time Processing**: Deteksi cepat dengan model AI

## 🎯 Jenis Sampah yang Dapat Dideteksi

Berdasarkan model `best.pt` yang telah dilatih:

1. **Botol Plastik** - Botol minuman, air mineral, dll
2. **Kaca** - Botol kaca, gelas, dll  
3. **Kaleng** - Kaleng minuman, makanan, dll
4. **Kardus** - Kotak kardus, kemasan kardus
5. **Kertas** - Kertas, koran, majalah
6. **Plastik** - Kemasan plastik, tas plastik, dll

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **React Webcam** - Camera integration

### Backend
- **Python Flask** - API server
- **YOLOv8 (Ultralytics)** - Object detection model
- **OpenCV** - Image processing
- **Pillow** - Image manipulation

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Model `best.pt` di folder `models/`

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd sampah-anorganik-app
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install --legacy-peer-deps
   
   # Backend dependencies
   pip install -r requirements.txt
   ```

3. **Setup model**
   - Letakkan file `best.pt` di folder `models/`
   - Model sudah dikonfigurasi otomatis

### Running the Application

#### Opsi 1: Manual (Recommended)
```bash
# Terminal 1: Start Python Backend
python python_backend_example.py

# Terminal 2: Start Next.js Frontend  
npm run dev
```

#### Opsi 2: Script Otomatis
```bash
# Windows
.\start_both.bat

# Linux/Mac
./start_both.sh
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Struktur Project

```
sampah-anorganik-app/
├── components/           # React components
│   ├── DetectionResult.tsx
│   └── LoadingSpinner.tsx
├── models/              # AI Model
│   ├── best.pt         # YOLOv8 model
│   └── README.md
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   └── detect.tsx
│   ├── _app.tsx
│   └── index.tsx       # Main page
├── public/             # Static assets
├── styles/             # CSS styles
├── python_backend_example.py  # Flask backend
├── model_config.py     # Model configuration
├── requirements.txt    # Python dependencies
├── package.json        # Node.js dependencies
└── README.md
```

## 🔧 Konfigurasi

### Model Configuration
File `model_config.py` berisi konfigurasi model:
```python
WASTE_CLASSES = {
    0: "Botol Plastik",
    1: "Kaca", 
    2: "Kaleng",
    3: "Kardus",
    4: "Kertas",
    5: "Plastik"
}
```

### Environment Variables
Buat file `.env.local` untuk konfigurasi:
```env
PYTHON_BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

## 📡 API Endpoints

### Python Backend
- `GET /health` - Health check
- `GET /model-info` - Model information  
- `POST /detect` - Waste detection

### Next.js API
- `POST /api/detect` - Proxy to Python backend

## 🎨 UI/UX Features

- **Modern Design**: Clean dan professional interface
- **Camera Integration**: Real-time camera dengan capture foto
- **Drag & Drop**: Upload gambar dengan drag & drop
- **Loading States**: Visual feedback saat processing
- **Error Handling**: Graceful error handling
- **Responsive**: Works on desktop, tablet, dan mobile

## 🧪 Testing

### Test Model
```bash
python test_model.py
```

### Test Integration  
```bash
python test_integration.py
```

## 🚨 Troubleshooting

### Camera Issues
- Pastikan izin kamera diberikan di browser
- Coba refresh halaman jika kamera tidak muncul
- Gunakan HTTPS untuk production

### Model Issues
- Pastikan file `best.pt` ada di folder `models/`
- Cek Python dependencies: `pip install -r requirements.txt`
- Restart backend jika model tidak load

### API Issues
- Pastikan backend berjalan di port 5000
- Cek CORS settings di Python backend
- Test dengan curl: `curl http://localhost:5000/health`

## 📈 Performance

- **Model Loading**: ~2-3 detik
- **Detection Time**: ~200-400ms per gambar
- **Image Processing**: Auto-resize dan compression
- **Memory Usage**: Optimized untuk mobile devices

## 🔒 Security

- **Input Validation**: Validasi gambar di frontend dan backend
- **File Size Limit**: Maksimal 10MB per gambar
- **CORS Protection**: Configured untuk development
- **Error Sanitization**: Error messages tidak expose sensitive info

## 📱 Mobile Support

- **Touch Gestures**: Swipe dan tap support
- **Camera Access**: Native camera integration
- **Responsive Layout**: Optimal di semua screen size
- **PWA Ready**: Progressive Web App features

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Cek troubleshooting section
2. Test dengan gambar yang berbeda
3. Cek console browser untuk error
4. Restart kedua service jika diperlukan

---

**🎉 Selamat menggunakan aplikasi deteksi sampah anorganik!**
