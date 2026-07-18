import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import threading
from ultralytics import YOLO
from queue import Queue
import time
import re
import requests
import logging

# 1. SETUP LOGGING & APP
logging.getLogger("ppocr").setLevel(logging.ERROR)
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# 2. LOAD MODELS
# Gunakan GPU jika tersedia (Mac M1 menggunakan CPU untuk EasyOCR biasanya lebih stabil)
model = YOLO("yolov8n.pt")
reader = easyocr.Reader(['en'], gpu=False) 

# 3. GLOBAL STATE & QUEUE
ocr_queue = Queue(maxsize=1)
ocr_results = {
    "text": "",
    "last_time": 0
}

LARAVEL_API_URL = "http://127.0.0.1:8000/api/parking/validate"

# 4. FILTER PLAT INDONESIA
def filter_plat_indonesia(text):
    text = text.replace('.', ' ').replace('-', ' ').upper()
    # Pattern: [Huruf Depan] [Angka] [Huruf Belakang]
    match = re.search(r'\b([A-Z]{1,2})\s*(\d{1,4})\s*([A-Z]{1,3})\b', text)
    if match:
        return f"{match.group(1)} {match.group(2)} {match.group(3)}"
    return ""

# 5. OCR THREAD WORKER
def ocr_worker():
    while True:
        if not ocr_queue.empty():
            roi = ocr_queue.get()
            try:
                gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                # Gunakan detail=0 agar langsung mendapatkan list teks
                results = reader.readtext(gray, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', detail=0)
                raw_text = " ".join(results).upper()
                final_text = filter_plat_indonesia(raw_text)

                if final_text:
                    ocr_results["text"] = final_text
                    ocr_results["last_time"] = time.time()
                    
                    # Langsung tembak ke Laravel jika ketemu plat
                    try:
                        requests.post(LARAVEL_API_URL, 
                                     json={"slot_code": "1A", "detected_plate": final_text}, 
                                     timeout=0.2)
                        print(f"📡 Terdeteksi & Dikirim: {final_text}")
                    except:
                        pass
            except Exception as e:
                print(f"OCR Error: {e}")
            ocr_queue.task_done()
        else:
            time.sleep(0.01)

# Jalankan thread OCR
threading.Thread(target=ocr_worker, daemon=True).start()

# 6. ENDPOINT UNTUK FASTAPI
@app.post("/process-frame")
async def process_frame(file: UploadFile = File(...)):
    print("Frame diterima oleh Python!")
    t0 = time.perf_counter()
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None: return {"status": "error"}

        # Auto Reset jika sudah 4 detik tidak ada plat baru
        if time.time() - ocr_results["last_time"] > 4:
            ocr_results["text"] = ""

        # YOLO DETEKSI KENDARAAN
        results = model(frame, verbose=False)[0]
        detections = []
        vehicle_bbox = None

        for box in results.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]

            if label in ["car", "motorcycle", "bus", "truck"]:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                vehicle_bbox = [x1, y1, x2, y2]
                
                # Crop area bawah mobil (asumsi plat di sana)
                vh, vw = y2 - y1, x2 - x1
                plate_roi = frame[y1 + int(vh * 0.5):y2, x1:x2]

                # Kirim ke Queue OCR jika kosong
                if ocr_queue.empty() and (time.time() - ocr_results["last_time"] > 1.0):
                    ocr_queue.put(plate_roi)
                
                # Masukkan info ke response agar React bisa gambar kotak
                if ocr_results["text"]:
                    detections.append({
                        "plate": ocr_results["text"],
                        "bbox": vehicle_bbox,
                        "score": 0.90 # Skor dummy untuk EasyOCR
                    })
                break # Fokus pada kendaraan pertama yang paling jelas

        elapsed = round((time.perf_counter() - t0) * 1000)
        return {
            "status": "success",
            "detections": detections,
            "vehicles_found": 1 if vehicle_bbox else 0,
            "elapsed_ms": elapsed
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)