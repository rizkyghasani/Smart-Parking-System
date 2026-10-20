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
import os
import requests
import logging

# Workaround: oneDNN/mkldnn gagal di CPU VPS ("could not create a primitive")
import torch
torch.backends.mkldnn.enabled = False

# 1. SETUP LOGGING & APP
logging.getLogger("ppocr").setLevel(logging.ERROR)
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# 2. LOAD MODELS
# Gunakan GPU jika tersedia (Mac M1 menggunakan CPU untuk EasyOCR biasanya lebih stabil)
model = YOLO("yolov8n.pt")
reader = easyocr.Reader(['en'], gpu=False) 

# 3. GLOBAL STATE & QUEUE
# EasyOCR tidak aman dipanggil bersamaan dari dua thread.
ocr_lock = threading.Lock()
ocr_queue = Queue(maxsize=1)
ocr_results = {
    "text": "",
    "last_time": 0
}

# Bisa dioverride lewat env var (misal di docker-compose: http://backend:8000/api/parking/validate)
LARAVEL_API_URL = os.getenv("LARAVEL_API_URL", "http://127.0.0.1:8000/api/parking/validate")

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
                with ocr_lock:
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

# 7. DETEKSI DARI GAMBAR YANG DIUNGGAH (satu kali, sinkron)
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
MAX_SIDE = 1280
ALLOW = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'


def _ocr_plate(img):
    """Baca plat dari sebuah gambar. Mengembalikan (plat, skor 0..1) atau ("", 0)."""
    if img is None or img.size == 0:
        return "", 0.0
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape[:2]
    # Perbesar potongan kecil agar huruf terbaca
    if w < 600:
        scale = 600 / max(w, 1)
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    variants = [gray, cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)]
    best = ("", 0.0)
    for v in variants:
        with ocr_lock:
            res = reader.readtext(v, allowlist=ALLOW, detail=1)
        text = " ".join(r[1] for r in res).upper()
        plate = filter_plat_indonesia(text)
        if plate:
            conf = float(np.mean([r[2] for r in res])) if res else 0.0
            if conf >= best[1]:
                best = (plate, conf)
            if conf >= 0.6:
                break
    return best


@app.post("/detect-image")
def detect_image(file: UploadFile = File(...)):
    """Deteksi plat dari satu foto (unggahan). Tidak mengirim apa pun ke Laravel;
    hasilnya hanya dikembalikan ke pemanggil."""
    t0 = time.perf_counter()
    try:
        data = file.file.read(MAX_UPLOAD_BYTES + 1)
        if len(data) > MAX_UPLOAD_BYTES:
            return {"status": "error", "message": "Ukuran gambar terlalu besar."}
        img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            return {"status": "error", "message": "File bukan gambar yang valid."}

        h, w = img.shape[:2]
        if max(h, w) > MAX_SIDE:
            k = MAX_SIDE / max(h, w)
            img = cv2.resize(img, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
            h, w = img.shape[:2]

        plate, score, bbox, source = "", 0.0, None, "none"

        # 1) Cari kendaraan, baca plat dari separuh bawahnya (sama seperti pemindaian kamera)
        res = model(img, verbose=False)[0]
        vehicles = []
        for box in res.boxes:
            if model.names[int(box.cls[0])] in ["car", "motorcycle", "bus", "truck"]:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                vehicles.append(((x2 - x1) * (y2 - y1), [x1, y1, x2, y2]))
        vehicles.sort(reverse=True)
        if vehicles:
            _, bbox = vehicles[0]
            x1, y1, x2, y2 = bbox
            roi = img[y1 + int((y2 - y1) * 0.4):y2, x1:x2]
            plate, score = _ocr_plate(roi)
            if plate:
                source = "vehicle"

        # 2) Cadangan: foto close-up plat atau kendaraan tidak terdeteksi, baca seluruh gambar
        if not plate:
            plate, score = _ocr_plate(img)
            if plate:
                source = "full"

        detections = [{"plate": plate, "bbox": bbox, "score": round(score, 2)}] if plate else []
        return {
            "status": "success",
            "plate": plate,
            "score": round(score, 2),
            "source": source,
            "detections": detections,
            "vehicles_found": len(vehicles),
            "elapsed_ms": round((time.perf_counter() - t0) * 1000),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)