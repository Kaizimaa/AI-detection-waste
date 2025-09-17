import type { NextApiRequest, NextApiResponse } from "next";

// Perbesar limit body parser agar base64 image tidak melebihi batas default (1mb)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Tidak ada gambar yang dikirim"
      });
    }

    try {
      const apiUrl= process.env.NEXT_PUBLIC_URL_API || "http://127.0.0.1:5000";
      
      // Kirim gambar ke Python backend
      const response = await fetch(`${apiUrl}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: image,
          // Tambahkan parameter lain yang diperlukan
          confidence_threshold: 0.5,
          model_type: 'yolov8'
        }),
      });

      if (!response.ok) {
        throw new Error(`Python backend error: ${response.statusText}`);
      }

      const result = await response.json();
      
      res.status(200).json({
        success: true,
        detections: result.detections || [],
        message: result.message || "Deteksi sampah anorganik berhasil dilakukan",
        timestamp: new Date().toISOString(),
        processing_time: result.processing_time,
        model_info: result.model_info
      });

    } catch (error) {
      console.error("Error in detection:", error);
      
      res.status(500).json({
        error: "Terjadi kesalahan dalam proses deteksi",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } else {
    res.status(405).json({
      error: "Method not allowed"
    });
  }
}