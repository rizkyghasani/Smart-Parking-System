import React, { useRef, useEffect } from 'react';

const CameraStream = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        // Akses Webcam
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 }, // Resolusi lebih tinggi agar OCR tajam
                    height: { ideal: 720 },
                    facingMode: "user" 
                } 
            })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => console.error("Gagal akses kamera: ", err));
        }
    }, []);

    return (
        <div className="relative rounded-[2rem] overflow-hidden border-4 border-slate-700 shadow-2xl bg-black aspect-video">
            {/* Penting: Kita tidak butuh canvas di sini karena 
                App.jsx akan membuat canvas "gaib" (temporary) saat capture.
            */}
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover" 
            />
            
            {/* Overlay Indikator */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="bg-red-600/20 backdrop-blur-md text-red-500 text-[10px] font-bold px-3 py-1 rounded-full border border-red-600/30">
                    AI MONITORING ACTIVE
                </span>
            </div>

            {/* Efek Scanning (Opsional untuk Visual Skripsi) */}
            <div className="absolute inset-0 pointer-events-none border-[1px] border-blue-500/20">
                <div className="w-full h-[2px] bg-blue-500/40 absolute top-0 animate-scan" />
            </div>
        </div>
    );
};

export default CameraStream;