FROM python:3.10-slim

# Install dependensi sistem terbaru untuk OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Siasat: Install PyTorch versi CPU secara eksplisit terlebih dahulu sebelum library lainnya
# Pin ke torch 2.10.0: build 2.5.1 (index CPU) menghasilkan OCR rusak di mesin ini,
# sedangkan 2.11.0 dari PyPI menyeret dependensi CUDA ±2.5GB untuk linux/aarch64.
# Di 2.10.0 semua dep CUDA digate khusus x86_64 → wheel ARM64 bersih (146MB).
RUN pip install --no-cache-dir --timeout=120 --retries=5 torch==2.10.0 torchvision==0.25.0
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]