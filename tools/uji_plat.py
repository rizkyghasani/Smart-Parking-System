#!/usr/bin/env python3
"""Uji massal pembacaan plat dari folder foto (cocok untuk tabel akurasi di skripsi).

Pakai:
    python3 uji_plat.py FOLDER [URL]
    python3 uji_plat.py ~/foto-uji http://localhost:8001/detect-image
    python3 uji_plat.py ~/foto-uji https://dijkstraparking.my.id/ai/detect-image

Nama file memuat plat yang seharusnya, mis. "EA1852SF_depan.jpg" atau "B1970SSW.png"
(awalan sebelum garis bawah/spasi/titik pertama; huruf besar-kecil dan spasi diabaikan).
Hanya memakai pustaka standar Python.
"""
import json, mimetypes, os, re, sys, time, urllib.request, uuid

folder = os.path.expanduser(sys.argv[1]) if len(sys.argv) > 1 else "."
url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8001/detect-image"
EXT = (".jpg", ".jpeg", ".png", ".webp")


def norm(s):
    return re.sub(r"[^A-Z0-9]", "", (s or "").upper())


def post_image(path):
    boundary = uuid.uuid4().hex
    data = open(path, "rb").read()
    ctype = mimetypes.guess_type(path)[0] or "image/jpeg"
    body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{os.path.basename(path)}\"\r\n"
            f"Content-Type: {ctype}\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read()), time.time() - t0


files = sorted(f for f in os.listdir(folder) if f.lower().endswith(EXT))
if not files:
    sys.exit(f"Tidak ada gambar di {folder}")

print(f"{'file':34} {'seharusnya':11} {'terbaca':11} {'ok':3} {'skor':5} {'detik':6} sumber")
benar = 0
for f in files:
    expect = norm(re.split(r"[_ .\-(]", f)[0])
    try:
        res, dt = post_image(os.path.join(folder, f))
        got = res.get("plate", "")
        ok = bool(expect) and norm(got) == expect
        benar += ok
        print(f"{f[:34]:34} {expect or '-':11} {got or '-':11} {'YA' if ok else 'tdk':3} {res.get('score', 0):<5} {dt:<6.1f} {res.get('source', res.get('message', ''))}")
    except Exception as e:
        print(f"{f[:34]:34} {expect or '-':11} GALAT: {e}")
print(f"\nAkurasi: {benar}/{len(files)} = {100.0 * benar / len(files):.0f}%")
