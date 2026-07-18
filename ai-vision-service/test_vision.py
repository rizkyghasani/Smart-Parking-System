import cv2
from ultralytics import YOLO
from paddleocr import PaddleOCR
import torch
import logging

# 1. Cek Akselerasi M1 (MPS)
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
print(f"🚀 Menggunakan Device: {device}")

# Matikan logging paddle agar terminal tidak berantakan
logging.getLogger("ppocr").setLevel(logging.ERROR)

# 2. Load Model YOLOv8
model = YOLO('yolov8n.pt') 

# 3. Inisialisasi OCR (Disesuaikan untuk PaddleOCR v3)
# Parameter show_log dihapus, use_angle_cls diganti use_textline_orientation
ocr = PaddleOCR(use_textline_orientation=True, lang='en')

print("✅ Semua model berhasil di-load!")

def test_camera():
    cap = cv2.VideoCapture(0) 
    if not cap.isOpened():
        print("❌ Error: Kamera tidak terdeteksi.")
        return

    print("📸 Kamera terbuka. Tekan 'q' untuk keluar.")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        # Jalankan deteksi dengan YOLO
        results = model(frame, device=device, verbose=False)
        
        # Visualisasi box di layar
        annotated_frame = results[0].plot()
        
        cv2.imshow("Smart Parking AI Test", annotated_frame)
        
        # Keluar jika tekan 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    test_camera()

    