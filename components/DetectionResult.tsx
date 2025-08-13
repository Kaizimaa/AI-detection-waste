import React from 'react';

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

interface DetectionResultProps {
  imageSrc: string;
  detections: Detection[];
}

const DetectionResult: React.FC<DetectionResultProps> = ({ imageSrc, detections }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas setiap kali imageSrc berubah
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detections.length) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes for each detection
      detections.forEach((detection) => {
        const [x, y, width, height] = detection.bbox;
        const confidence = detection.confidence;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        const label = `${detection.class} ${(confidence * 100).toFixed(1)}%`;
        const labelWidth = ctx.measureText(label).width + 10;
        const labelHeight = 20;

        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);

        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.fillText(label, x + 5, y - 5);
      });
    };
    img.src = imageSrc;
  }, [imageSrc, detections]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Hasil Deteksi dengan Bounding Box
      </h3>
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto max-h-96 object-contain"
          style={{ maxWidth: '100%' }}
        />
      </div>
      <div className="text-sm text-gray-600">
        Total objek terdeteksi: {detections.length}
      </div>
    </div>
  );
};

export default DetectionResult;
