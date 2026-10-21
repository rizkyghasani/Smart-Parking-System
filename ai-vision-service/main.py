import os
# [perf] Harus diatur SEBELUM torch dimuat:
#  - jumlah thread PyTorch dibatasi (default: jumlah core, maks 4). YOLO dan OCR sekarang bergantian
#    lewat infer_lock, jadi tidak ada dua pekerjaan berat yang berebut CPU
#  - sembunyikan banjir peringatan "NNPACK Unsupported hardware" (ratusan baris per frame)
_THREADS = os.getenv("TORCH_THREADS") or str(min(4, os.cpu_count() or 2))
os.environ.setdefault("OMP_NUM_THREADS", _THREADS)
os.environ.setdefault("MKL_NUM_THREADS", _THREADS)
os.environ.setdefault("TORCH_CPP_LOG_LEVEL", "ERROR")

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
from plate_locator import find_plates

# Workaround: oneDNN/mkldnn gagal di CPU VPS ("could not create a primitive")
import torch
torch.backends.mkldnn.enabled = False
torch.set_num_threads(int(_THREADS))
try:
    torch.backends.nnpack.set_flags(False)   # CPU ini tidak mendukung NNPACK
except Exception:
    pass

# 1. SETUP LOGGING & APP
logging.getLogger("ppocr").setLevel(logging.ERROR)
app = FastAPI()

# CORS: di produksi browser memanggil lewat domain yang sama (/ai), jadi CORS tidak diperlukan.
# Default "*" dipertahankan untuk dev. Di produksi isi CORS_ORIGINS=https://domain-anda (pisahkan koma).
_cors = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=_cors, allow_methods=["*"], allow_headers=["*"])

# 2. LOAD MODELS
# Gunakan GPU jika tersedia (Mac M1 menggunakan CPU untuk EasyOCR biasanya lebih stabil)
model = YOLO("yolov8n.pt")
reader = easyocr.Reader(['en'], gpu=False) 

# 3. GLOBAL STATE & QUEUE
# [perf] Parameter yang bisa disetel lewat environment tanpa mengubah kode
YOLO_IMGSZ = int(os.getenv("YOLO_IMGSZ", "320"))            # ukuran masukan YOLO (640 = bawaan, lebih berat)
OCR_MAX_WIDTH = int(os.getenv("OCR_MAX_WIDTH", "800"))      # potongan plat diperkecil bila lebih lebar dari ini
OCR_MIN_WIDTH = int(os.getenv("OCR_MIN_WIDTH", "640"))      # potongan kecil diperbesar sampai selebar ini
OCR_CANVAS = int(os.getenv("OCR_CANVAS", "800"))            # batas sisi terpanjang untuk detektor teks EasyOCR
OCR_COOLDOWN = float(os.getenv("OCR_COOLDOWN", "1.5"))      # jeda minimum antar percobaan OCR dari video (detik)
DETECT_BUDGET = float(os.getenv("DETECT_BUDGET", "20"))     # batas waktu /detect-image (detik)
# Satu pekerjaan berat (YOLO atau OCR) dalam satu waktu; frame video yang datang saat sibuk dibuang
# (bukan diantre). Foto unggahan menunggu gilirannya.
infer_lock = threading.Lock()

# EasyOCR tidak aman dipanggil bersamaan dari dua thread (worker video + endpoint upload).
ocr_lock = threading.Lock()
ocr_queue = Queue(maxsize=1)
ocr_results = {
    "text": "",
    "last_time": 0,
    "last_try": 0
}

# Bisa dioverride lewat env var (misal di docker-compose: http://backend:8000/api/parking/validate)
LARAVEL_API_URL = os.getenv("LARAVEL_API_URL", "http://127.0.0.1:8000/api/parking/validate")
# Kode slot yang dilaporkan ke Laravel (sebelumnya hardcode "1A", default tetap sama).
AI_SLOT_CODE = os.getenv("AI_SLOT_CODE", "1A")
# Timeout panggilan ke Laravel (detik). Sebelumnya 0.2; dinaikkan sedikit untuk php-fpm di produksi.
LARAVEL_TIMEOUT = float(os.getenv("LARAVEL_TIMEOUT", "1.0"))
# Shared secret opsional. Kalau diisi, dikirim sebagai header X-Internal-Token
# dan harus cocok dengan AI_SHARED_SECRET di backend.
AI_SHARED_SECRET = os.getenv("AI_SHARED_SECRET", "")

# 4. FILTER PLAT INDONESIA
_PLAT_RE = re.compile(r'\b([A-Z]{1,2})\s*((?:\d\s*){1,4})\s*([A-Z]{1,3})\b')

def filter_plat_indonesia(text):
    # Tanda baca (titik, strip, koma) dianggap spasi. Angka yang terpecah ("159 9") disatukan.
    text = re.sub(r'[^A-Z0-9 ]', ' ', text.upper())
    match = _PLAT_RE.search(text)
    if match:
        digits = re.sub(r'\s', '', match.group(2))
        if 1 <= len(digits) <= 4:
            return f"{match.group(1)} {digits} {match.group(3)}"
    return _koreksi_ambigu(text)


def _koreksi_ambigu(text):
    """Cadangan: bagian angka yang terbaca sebagai huruf mirip (S->5, O->0, I->1, ...) diperbaiki."""
    for tok in re.findall(r'[A-Z0-9]{4,8}', text.replace(' ', '')):
        m = re.match(r'^([A-Z]{1,2})([A-Z0-9]{1,4}?)([A-Z]{1,3})$', tok)
        if not m:
            continue
        mid = ''.join(_TO_DIGIT.get(ch, ch) for ch in m.group(2))
        if mid.isdigit() and any(ch.isdigit() for ch in m.group(2)):
            return f"{m.group(1)} {mid} {m.group(3)}"
    return ""

# 4b. PEMBACA PLAT: cari letak plat -> potong rapat -> perbesar -> OCR
ALLOW = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
LOCATE_MAX = int(os.getenv("LOCATE_MAX", "3"))          # jumlah kandidat letak plat yang dibaca
FAST_ACCEPT = float(os.getenv("FAST_ACCEPT", "0.75"))      # video: terima hasil pertama bila skor segini
CROP_OCR_WIDTH = int(os.getenv("CROP_OCR_WIDTH", "480"))  # potongan plat diperbesar sampai selebar ini


def _ocr_text(gray, raw_log):
    """Satu kali OCR pada gambar abu-abu. Mengembalikan (plat, skor 0..1)."""
    with ocr_lock:
        res = reader.readtext(gray, allowlist=ALLOW, detail=1, paragraph=False, canvas_size=OCR_CANVAS)
    # urutkan per baris (atas ke bawah, kiri ke kanan)
    res = sorted(res, key=lambda r: (round(r[0][0][1] / 40), r[0][0][0]))
    text = " ".join(r[1] for r in res).upper()
    raw_log.append(text)
    # coba seluruh teks, tiap potongan, dan gabungan 2-3 potongan berdekatan
    cands = [text] + [r[1].upper() for r in res]
    for i in range(len(res) - 1):
        cands.append((res[i][1] + " " + res[i + 1][1]).upper())
        if i + 2 < len(res):
            cands.append((res[i][1] + " " + res[i + 1][1] + " " + res[i + 2][1]).upper())
    for c in cands:
        plate = filter_plat_indonesia(c)
        if plate:
            conf = float(np.mean([r[2] for r in res])) if res else 0.0
            return plate, conf
    return "", 0.0


_TO_DIGIT = {'O': '0', 'Q': '0', 'D': '0', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'G': '6', 'B': '8'}
_TO_LETTER = {'0': 'O', '1': 'I', '5': 'S', '8': 'B', '6': 'G', '2': 'Z'}


def _vote(cands):
    """cands: [(plat 'B 1599 JT', skor)]. Pilih per posisi karakter (suara berbobot skor) di antara
    hasil yang formatnya sama, lalu ambil format yang total bobotnya terbesar."""
    groups = {}
    for plate, conf in cands:
        pre, dig, suf = plate.split(" ")
        groups.setdefault((len(pre), len(dig), len(suf)), []).append((plate.replace(" ", ""), conf + 0.05))
    best_key = max(groups, key=lambda k: sum(c for _, c in groups[k]))
    items = groups[best_key]
    chars = []
    for i in range(sum(best_key)):
        tally = {}
        for p, c in items:
            tally[p[i]] = tally.get(p[i], 0.0) + c
        chars.append(max(tally, key=tally.get))
    n1, n2, _ = best_key
    plate = "".join(chars[:n1]) + " " + "".join(chars[n1:n1 + n2]) + " " + "".join(chars[n1 + n2:])
    conf = max(c for _, c in items) - 0.05
    return plate, conf


def _variants(gray):
    """Beberapa versi gambar plat untuk OCR (hasilnya digabung dengan voting)."""
    yield gray
    yield cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(gray)
    blur = cv2.GaussianBlur(gray, (0, 0), 2.0)
    yield cv2.addWeighted(gray, 1.8, blur, -0.8, 0)                       # dipertajam
    yield cv2.threshold(cv2.GaussianBlur(gray, (3, 3), 0), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    big = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    yield big


def _read_plate_crop(crop_bgr, raw_log, fast=False):
    """Baca satu potongan plat: beberapa versi gambar -> OCR tiap versi -> voting per karakter."""
    if crop_bgr is None or crop_bgr.size == 0:
        return "", 0.0
    gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    w = gray.shape[1]
    if w < CROP_OCR_WIDTH:
        k = min(5.0, CROP_OCR_WIDTH / max(w, 1))
        gray = cv2.resize(gray, None, fx=k, fy=k, interpolation=cv2.INTER_CUBIC)
    found = []
    for n_var, img in enumerate(_variants(gray)):
        if fast and n_var >= 2:
            break
        plate, conf = _ocr_text(img, raw_log)
        if plate:
            found.append((plate, conf))
            if fast and conf >= FAST_ACCEPT:   # video: frame berikutnya ikut mengonfirmasi, tak perlu voting
                break
            if len(found) >= 2 and found[-1][0] == found[-2][0]:   # dua hasil sama berturut-turut: cukup
                break
    if not found:
        return "", 0.0
    return _vote(found)


def locate_and_read(img_bgr, raw_log, deadline=None, prefer_box=None, fast=False):
    """Cari kandidat plat di gambar lalu baca satu per satu. Mengembalikan (plat, skor, kotak)."""
    try:
        cands = find_plates(img_bgr, max_candidates=LOCATE_MAX + 2)
    except Exception as e:
        print(f"[locator] galat: {e}")
        return "", 0.0, None
    if prefer_box is not None:   # kandidat yang berada di bagian bawah kendaraan diutamakan
        px1, py1, px2, py2 = prefer_box
        low_y = py1 + 0.4 * (py2 - py1)
        for c in cands:
            x1, y1, x2, y2 = c["box"]
            cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
            if px1 <= cx <= px2 and low_y <= cy <= py2 + 0.1 * (py2 - py1):
                c["score"] += 2.0
        cands.sort(key=lambda c: -c["score"])
    for c in cands[:(2 if fast else LOCATE_MAX)]:
        if deadline is not None and time.perf_counter() > deadline:
            break
        x1, y1, x2, y2 = c["box"]
        plate, conf = _read_plate_crop(img_bgr[y1:y2, x1:x2], raw_log, fast=fast)
        if plate:
            return plate, conf, c["box"]
    return "", 0.0, None


# 5. OCR THREAD WORKER
def ocr_worker():
    while True:
        if not ocr_queue.empty():
            roi = ocr_queue.get()
            try:
                # [perf] OCR memegang infer_lock: selama OCR berjalan, frame video dijawab "busy"
                # (bukan diproses bersamaan), sehingga YOLO tidak melambat 30x karena berebut CPU.
                with infer_lock:
                    raw_log = []
                    # 1) cari letak plat -> potong rapat -> OCR (akurat untuk plat kecil/jauh)
                    final_text, _, _ = locate_and_read(roi, raw_log, fast=True)
                    # 2) cadangan: baca seluruh potongan seperti sebelumnya
                    if not final_text:
                        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                        if gray.shape[1] > OCR_MAX_WIDTH:
                            k = OCR_MAX_WIDTH / gray.shape[1]
                            gray = cv2.resize(gray, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
                        final_text, _ = _ocr_text(gray, raw_log)

                if final_text:
                    ocr_results["text"] = final_text
                    ocr_results["last_time"] = time.time()
                    
                    # Langsung tembak ke Laravel jika ketemu plat
                    try:
                        headers = {"X-Internal-Token": AI_SHARED_SECRET} if AI_SHARED_SECRET else {}
                        requests.post(LARAVEL_API_URL,
                                     json={"slot_code": AI_SLOT_CODE, "detected_plate": final_text},
                                     headers=headers,
                                     timeout=LARAVEL_TIMEOUT)
                        print(f"📡 Terdeteksi & Dikirim: {final_text}")
                    except:
                        pass
            except Exception as e:
                print(f"OCR Error: {e}")
            ocr_results["last_try"] = time.time()
            ocr_queue.task_done()
        else:
            time.sleep(0.01)

# Jalankan thread OCR
threading.Thread(target=ocr_worker, daemon=True).start()

# 6. ENDPOINT UNTUK FASTAPI
@app.get("/health")
def health():
    # Dipakai healthcheck Docker. Model sudah dimuat saat modul ini diimpor.
    return {"status": "ok"}


@app.post("/process-frame")
def process_frame(file: UploadFile = File(...)):
    # [perf] Fungsi biasa (bukan async) -> dijalankan di threadpool, event loop tidak terblokir.
    t0 = time.perf_counter()
    if not infer_lock.acquire(blocking=False):
        # Frame sebelumnya masih diproses: buang frame ini agar antrean tidak menumpuk.
        return {"status": "busy", "detections": [], "vehicles_found": 0}
    try:
        contents = file.file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None: return {"status": "error"}

        # Auto Reset jika sudah 4 detik tidak ada plat baru
        if time.time() - ocr_results["last_time"] > 4:
            ocr_results["text"] = ""

        # YOLO DETEKSI KENDARAAN
        results = model(frame, imgsz=YOLO_IMGSZ, verbose=False)[0]
        detections = []
        vehicle_bbox = None

        for box in results.boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]

            if label in ["car", "motorcycle", "bus", "truck"]:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                vehicle_bbox = [x1, y1, x2, y2]
                
                # Crop area bawah mobil (asumsi plat di sana). Diambil dari frame resolusi penuh.
                vh, vw = y2 - y1, x2 - x1
                plate_roi = frame[y1 + int(vh * 0.5):y2, x1:x2]

                # Kirim ke Queue OCR jika kosong, dan ada jeda sejak percobaan terakhir
                now = time.time()
                if ocr_queue.empty() and (now - ocr_results["last_time"] > 1.0) \
                        and (now - ocr_results["last_try"] > OCR_COOLDOWN):
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
    finally:
        infer_lock.release()


# 7. DETEKSI DARI GAMBAR YANG DIUNGGAH (satu kali, sinkron)  [v4: pencari plat]
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
MAX_SIDE = 1600   # foto HP besar diperkecil sampai sisi terpanjang ini (plat kecil tetap terbaca)


def _gray_sized(img):
    """Abu-abu, diperbesar bila kecil, diperkecil bila besar (biaya OCR sebanding dengan luas)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    w = gray.shape[1]
    if w < OCR_MIN_WIDTH:
        k = min(4.0, OCR_MIN_WIDTH / max(w, 1))
        gray = cv2.resize(gray, None, fx=k, fy=k, interpolation=cv2.INTER_CUBIC)
    elif w > OCR_MAX_WIDTH:
        k = OCR_MAX_WIDTH / w
        gray = cv2.resize(gray, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    return gray


@app.post("/detect-image")
def detect_image(file: UploadFile = File(...)):
    """Deteksi plat dari satu foto (unggahan). Tidak mengirim apa pun ke Laravel;
    hasilnya hanya dikembalikan ke pemanggil."""
    t0 = time.perf_counter()
    raw_log = []
    # Foto unggahan menunggu giliran (satu inferensi dalam satu waktu), bukan dibuang.
    with infer_lock:
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

            deadline = t0 + DETECT_BUDGET

            # Kendaraan (dipakai untuk memprioritaskan kandidat plat di bagian bawahnya dan sebagai bbox)
            res = model(img, imgsz=max(YOLO_IMGSZ, 416), verbose=False)[0]
            vehicles = []
            for box in res.boxes:
                if model.names[int(box.cls[0])] in ["car", "motorcycle", "bus", "truck"]:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    vehicles.append(((x2 - x1) * (y2 - y1), [x1, y1, x2, y2]))
            vehicles.sort(reverse=True)
            bbox = vehicles[0][1] if vehicles else None

            # 1) Cari letak plat di seluruh gambar -> potong rapat -> OCR (tidak bergantung pada YOLO)
            plate, score, plate_box = locate_and_read(img, raw_log, deadline=t0 + DETECT_BUDGET * 0.45, prefer_box=bbox)
            source = "pencari-plat" if plate else "none"

            # 2) Cadangan: baca potongan besar seperti sebelumnya
            if not plate:
                crops = []
                if bbox:
                    x1, y1, x2, y2 = bbox
                    crops.append(("separuh-bawah", img[y1 + int((y2 - y1) * 0.5):y2, x1:x2]))
                crops.append(("seluruh-gambar", img))
                for name, crop in crops:
                    if crop is None or crop.size == 0 or time.perf_counter() > deadline:
                        continue
                    plate, score = _ocr_text(_gray_sized(crop), raw_log)
                    if plate:
                        source = name
                        break

            detections = [{"plate": plate, "bbox": bbox, "plate_box": list(plate_box) if plate_box else None,
                           "score": round(score, 2)}] if plate else []
            out = {
                "status": "success",
                "plate": plate,
                "score": round(score, 2),
                "source": source,
                "detections": detections,
                "vehicles_found": len(vehicles),
                "elapsed_ms": round((time.perf_counter() - t0) * 1000),
            }
            if not plate:
                out["raw_text"] = [t for t in raw_log if t][:6]
            print(f"[detect-image] plat={plate or '-'} sumber={source} kendaraan={len(vehicles)} "
                  f"waktu={out['elapsed_ms']}ms raw={raw_log[:3]}")
            return out
        except Exception as e:
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)