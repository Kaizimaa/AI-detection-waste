import { useRef, useState, useEffect } from "react";
import Head from "next/head";
import DetectionResult from "../components/DetectionResult";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const MAX_DIMENSION = 1024;

  const resizeAndCompress = (source: HTMLImageElement | HTMLCanvasElement, quality = 0.7): string => {
    const offscreen = document.createElement('canvas');
    const ctx = offscreen.getContext('2d');
    if (!ctx) return '';

    const width = (source as any).width;
    const height = (source as any).height;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));

    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    offscreen.width = targetW;
    offscreen.height = targetH;
    if (source instanceof HTMLImageElement) {
      ctx.drawImage(source, 0, 0, targetW, targetH);
    } else {
      ctx.drawImage(source, 0, 0, targetW, targetH);
    }
    return offscreen.toDataURL('image/jpeg', quality);
  };

  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Tunggu video siap
        await new Promise<void>((resolve) => {
          const video = videoRef.current!;
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          video.addEventListener('loadedmetadata', onLoaded);
        });
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) {
      console.log("Cannot capture: video or canvas not ready");
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (!context) {
        console.log("Cannot get canvas context");
        return;
      }

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      
      // Compress and resize
      const compressed = resizeAndCompress(canvas, 0.7);
      
      setResult(null);
      setImageSrc(compressed || dataUrl);
      
      console.log("Photo captured successfully");
    } catch (error) {
      console.error("Error capturing image:", error);
      setCameraError("Gagal mengambil foto. Coba lagi.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const compressed = resizeAndCompress(img, 0.7);
          setResult(null);
          setImageSrc(compressed);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectWaste = async () => {
    if (!imageSrc) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error detecting waste:", error);
      setResult({ error: "Terjadi kesalahan saat mendeteksi sampah" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDetection = () => {
    setImageSrc(null);
    setResult(null);
  };
useEffect(() => {
  if (imageSrc) {
    handleDetectWaste();
  }
}, [imageSrc]);
  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <>
      <Head>
        <title>Deteksi Sampah Anorganik | AI Waste Detection</title>
        <meta
          name="description"
          content="Aplikasi pendeteksian sampah anorganik menggunakan AI YOLOv8. Deteksi jenis sampah secara real-time dengan kamera atau upload gambar."
        />
        <meta name="keywords" content="deteksi sampah, sampah anorganik, AI detection, YOLOv8, waste classification" />
        <meta name="author" content="Waste Detection App" />
        <meta property="og:title" content="Deteksi Sampah Anorganik" />
        <meta property="og:description" content="Deteksi jenis sampah anorganik menggunakan AI YOLOv8" />
        <meta property="og:type" content="website" />
      </Head>

      {/* Hidden canvas for capturing */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
        width={1280}
        height={720}
      />

      <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🗑️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Deteksi Sampah Anorganik
                  </h1>
                  <p className="text-sm text-gray-600">AI-powered waste detection</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>System Ready</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Camera and Upload */}
            <div className="space-y-6">
              {/* Camera Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📷</span>
                  Kamera Real-time
                </h2>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleStartCamera}
                      disabled={isCameraActive}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {isCameraActive ? "🎥 Kamera Aktif" : "📷 Aktifkan Kamera"}
                    </button>
                    {isCameraActive && (
                      <button
                        onClick={handleStopCamera}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        ⏹️ Matikan Kamera
                      </button>
                    )}
                  </div>

                  {cameraError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-800 text-sm">{cameraError}</p>
                    </div>
                  )}

                  <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="camera-video bg-black"
                    />

                    {!isCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📷</div>
                          <p>Kamera belum aktif</p>
                        </div>
                      </div>
                    )}

                    {isCameraActive && (
                      <button
                        onClick={handleCapture}
                        className="absolute bottom-4 right-4 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        📸 Ambil Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📁</span>
                  Upload Gambar
                </h2>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all duration-200 bg-gray-50 hover:bg-blue-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-4">
                        <div className="text-6xl">📁</div>
                        <div className="text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Klik untuk upload
                          </span>{" "}
                          atau drag and drop
                        </div>
                        <div className="text-sm text-gray-500">
                          PNG, JPG, JPEG hingga 10MB
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview and Results */}
            <div className="space-y-6">
              {/* Preview Section */}
              {imageSrc && (
  <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
      <span className="mr-2">🖼️</span>
      Pratinjau Gambar
    </h2>

    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={imageSrc}
          alt="Gambar untuk deteksi"
          className="w-full h-auto max-h-96 object-contain"
        />
        <button
          onClick={resetDetection}
          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg"
          title="Hapus gambar"
        >
          ✕
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Mendeteksi sampah anorganik..." />
      ) : (
        <button
          disabled
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl cursor-not-allowed opacity-60"
        >
          🔍 Deteksi Sampah Anorganik
        </button>
      )}
    </div>
  </div>
)}


              {/* Results Section */}
              {result && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    {result.error ? (
                      <>
                        <span className="mr-2">❌</span>
                        Error
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✅</span>
                        Hasil Deteksi
                      </>
                    )}
                  </h2>
                  
                  <div className="space-y-4">
                    {result.error ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-800">{result.error}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {result.detections && result.detections.length > 0 ? (
                          <>
                            {/* Detection Result with Bounding Box */}
                            <DetectionResult 
                              imageSrc={imageSrc!} 
                              detections={result.detections} 
                            />
                            
                            {/* Detection List */}
                            <div className="space-y-3">
                              <div className="text-sm text-gray-600 font-medium">
                                Ditemukan {result.detections.length} objek sampah:
                              </div>
                              {result.detections.map((detection: any, index: number) => (
                                <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-green-800">
                                      {detection.class}
                                    </span>
                                    <span className="text-sm text-green-600 font-bold">
                                      {(detection.confidence * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-yellow-800">
                              Tidak ada sampah anorganik terdeteksi dalam gambar ini.
                            </p>
                          </div>
                        )}
                        
                        {result.message && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-blue-800 text-sm">{result.message}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Informasi
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Aplikasi ini dapat mendeteksi berbagai jenis sampah anorganik</p>
                  <p>• Gunakan kamera real-time atau upload gambar</p>
                  <p>• Hasil deteksi akan menampilkan jenis sampah dan tingkat kepercayaan</p>
                  <p>• Pastikan gambar jelas dan objek sampah terlihat dengan baik</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
