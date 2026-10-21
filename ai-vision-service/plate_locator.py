"""Pencari letak plat nomor berbasis OpenCV (tanpa model tambahan).

Cara kerja: cari bercak mirip huruf (terang-di-gelap maupun gelap-di-terang), lalu kelompokkan bercak
yang sejajar, setinggi sama, dan berdekatan menjadi satu baris plat. Pendekatan ini tahan terhadap
celah lebar antar kelompok huruf/angka ("EA 1852 SF"), plat kecil di foto jauh, dan latar yang ramai.
Hasilnya dipakai untuk memotong plat rapat sebelum OCR: lebih akurat dan jauh lebih cepat daripada
membaca seluruh separuh bawah kendaraan.
"""
import cv2
import numpy as np


def _blobs(binary, H):
    """Bercak mirip huruf: (x, y, w, h)."""
    n, _, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    out = []
    min_h = max(10, int(0.012 * H))
    max_h = int(0.22 * H)
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if h < min_h or h > max_h:
            continue
        r = w / float(h)
        if r < 0.07 or r > 1.15:
            continue
        if area < 0.18 * w * h:
            continue
        out.append((int(x), int(y), int(w), int(h)))
    return out


def _group(blobs):
    """Gabungkan bercak menjadi baris: sejajar vertikal, tinggi mirip, jarak horizontal wajar."""
    n = len(blobs)
    parent = list(range(n))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for i in range(n):
        xi, yi, wi, hi = blobs[i]
        ci = yi + hi / 2.0
        for j in range(i + 1, n):
            xj, yj, wj, hj = blobs[j]
            cj = yj + hj / 2.0
            hmax, hmin = max(hi, hj), min(hi, hj)
            if hmin / hmax < 0.72:
                continue
            if abs(ci - cj) > 0.28 * hmax:
                continue
            gap = max(xi, xj) - min(xi + wi, xj + wj)       # jarak horizontal antar tepi (negatif = tumpang tindih)
            if gap > 1.9 * hmax:
                continue
            if gap < -0.5 * min(wi, wj):                      # hampir menumpuk: bukan dua huruf berbeda
                continue
            parent[find(i)] = find(j)

    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(blobs[i])
    return list(groups.values())


def _score_group(g, W, H):
    k = len(g)
    if k < 4 or k > 11:
        return None
    xs1 = min(b[0] for b in g); ys1 = min(b[1] for b in g)
    xs2 = max(b[0] + b[2] for b in g); ys2 = max(b[1] + b[3] for b in g)
    w, h = xs2 - xs1, ys2 - ys1
    ar = w / float(h)
    if not (2.2 <= ar <= 9.5):
        return None
    hs = np.array([b[3] for b in g], float)
    rs = np.array([b[2] / float(b[3]) for b in g], float)
    # Sirip grille/pagar: semuanya sama sempit. Huruf plat punya beberapa bercak yang cukup lebar.
    if (rs >= 0.38).sum() < 3:
        return None
    uni = 1.0 - min(1.0, float(hs.std() / hs.mean()) * 3.0)
    cnt_bonus = 1.0 - min(1.0, abs(k - 7) / 4.0)             # plat Indonesia 5-8 karakter
    ar_bonus = 1.0 - min(1.0, abs(np.log(ar / 5.2)))         # barisan huruf ~ 4.5-6
    width_var = min(1.0, float(rs.std()) / 0.18)             # huruf bervariasi lebar (I, M, W, 1)
    score = 3.0 * uni + 2.5 * cnt_bonus + 1.5 * ar_bonus + 1.0 * width_var
    return score, (xs1, ys1, xs2, ys2)


def find_plates(bgr, max_candidates=4, work_width=1100):
    """Kandidat plat, urut dari yang paling mirip. Koordinat pada gambar ASLI: dict(box=(x1,y1,x2,y2), score)."""
    H0, W0 = bgr.shape[:2]
    k = min(2.0, work_width / float(W0))            # gambar kecil boleh diperbesar sampai 2x
    img = cv2.resize(bgr, None, fx=k, fy=k, interpolation=cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC) if abs(k - 1) > 0.01 else bgr
    H, W = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    cands = []
    bs = int(max(15, (W // 18) | 1))
    for inv in (cv2.THRESH_BINARY_INV, cv2.THRESH_BINARY):          # huruf gelap-di-terang, lalu terang-di-gelap
        binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, inv, bs, 12)
        blobs = _blobs(binary, H)
        if len(blobs) < 4:
            continue
        for g in _group(blobs):
            r = _score_group(g, W, H)
            if r:
                cands.append(r)

    cands.sort(key=lambda t: -t[0])
    kept = []
    for sc, b in cands:
        dup = False
        for _, kb in kept:
            ix1, iy1, ix2, iy2 = max(b[0], kb[0]), max(b[1], kb[1]), min(b[2], kb[2]), min(b[3], kb[3])
            inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
            smaller = min((b[2] - b[0]) * (b[3] - b[1]), (kb[2] - kb[0]) * (kb[3] - kb[1]))
            if smaller > 0 and inter / smaller > 0.4:
                dup = True
                break
        if not dup:
            kept.append((sc, b))
        if len(kept) >= max_candidates:
            break

    out = []
    for sc, (x1, y1, x2, y2) in kept:
        h = y2 - y1
        pad_x, pad_y = int(0.55 * h) + 4, int(0.30 * h) + 3      # margin lebar: huruf di tepi yang menyatu dengan bingkai tetap ikut terpotong
        x1, y1 = max(0, x1 - pad_x), max(0, y1 - pad_y)
        x2, y2 = min(W, x2 + pad_x), min(H, y2 + pad_y)
        out.append({"box": (int(x1 / k), int(y1 / k), int(x2 / k), int(y2 / k)), "score": round(float(sc), 2)})
    return out
