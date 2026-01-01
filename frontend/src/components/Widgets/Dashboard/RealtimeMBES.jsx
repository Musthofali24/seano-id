import React, { useState, useEffect, useRef } from "react";
import Plot from "react-plotly.js";

const RealtimeMBES = () => {
  // --- KONFIGURASI SIMULASI ---
  const N_BEAMS = 1000; // Jumlah titik ke samping (lebar sapuan sonar)
  const HISTORY_LENGTH = 100; // Seberapa panjang jejak ke belakang yang disimpan
  const UPDATE_RATE = 100; // Update setiap 100ms (10 FPS)

  // State untuk menyimpan data matriks Z (Kedalaman)
  // Bentuk datanya adalah 2D Array: [ [baris1], [baris2], ... ]
  const [zData, setZData] = useState([]);

  // Ref untuk menyimpan data sementara agar tidak trigger render berlebihan
  const dataBuffer = useRef([]);

  // Fungsi Helper: Membuat 1 baris data dummy (simulasi 1 ping sonar)
  const generatePingLine = (t) => {
    const row = [];
    for (let i = 0; i < N_BEAMS; i++) {
      // 1. Bentuk dasar laut (Large Scale Terrain) - Gunung/Lembah
      // Menggunakan kombinasi Sinus untuk membuat kontur yang tidak monoton
      const x = i / N_BEAMS; // Normalisasi 0..1
      const largeScale =
        Math.sin(x * Math.PI * 2 + t / 50) * 15 + // Gelombang besar bergerak lambat
        Math.cos(x * Math.PI * 5) * 5; // Gelombang sedang statis relatif

      // 2. Detail permukaan (Small Scale Texture) - Bebatuan/Pasir
      const smallScale = Math.sin(x * Math.PI * 20 + t / 10) * 2;

      // 3. Noise Sensor (Interferensi acak)
      const noise = (Math.random() - 0.5) * 1.5;

      const baseDepth = 60; // Kedalaman rata-rata

      row.push(baseDepth + largeScale + smallScale + noise);
    }
    return row;
  };

  // --- LOGIC REALTIME ---
  useEffect(() => {
    // 1. Inisialisasi Data Awal (Layar kosong/datar dulu)
    const initialData = [];
    for (let i = 0; i < HISTORY_LENGTH; i++) {
      initialData.push(new Array(N_BEAMS).fill(60));
    }
    dataBuffer.current = initialData;
    setZData(initialData);

    let tick = 0;

    // 2. Loop Interval (Simulasi Data Masuk dari WebSocket/Serial)
    const interval = setInterval(() => {
      tick++;

      // Buat data baru (1 baris ping sonar)
      const newRow = generatePingLine(tick);

      // --- ALGORITMA FIFO (First In First Out) ---
      // Ambil buffer saat ini
      const currentData = [...dataBuffer.current];

      // Hapus baris paling tua (paling belakang)
      currentData.shift();

      // Masukkan baris baru di depan (posisi kapal)
      currentData.push(newRow);

      // Update Buffer & State
      dataBuffer.current = currentData;
      setZData(currentData);
    }, UPDATE_RATE);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 className="text-xl font-bold mb-2">
        Real-time MBES 3D Waterfall (High Res)
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Simulasi: {N_BEAMS} beams x {HISTORY_LENGTH} history steps | Update:{" "}
        {UPDATE_RATE}ms
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <Plot
          data={[
            {
              z: zData,
              type: "surface",
              colorscale: "Jet", // Ganti warna biar lebih kontras kayak sonar asli
              cmin: 30,
              cmax: 90,

              // Optimasi Rendering:
              contours: {
                z: {
                  show: true,
                  usecolormap: true,
                  highlightcolor: "limegreen",
                  project: { z: true },
                },
              },
            },
          ]}
          layout={{
            title: "Live Bathymetry Feed",
            autosize: true,
            // Hapus width/height hardcoded agar mengikuti container
            margin: { l: 0, r: 0, b: 0, t: 30 },
            scene: {
              camera: {
                eye: { x: 1.8, y: 1.8, z: 1.8 },
              },
              xaxis: { title: "" }, // Sembunyikan label biar bersih
              yaxis: { title: "" },
              zaxis: { title: "Depth (m)", range: [20, 100] },
            },
          }}
          useResizeHandler={true} // Agar responsif
          style={{ width: "100%", height: "100%" }} // Full size
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
};

export default RealtimeMBES;
