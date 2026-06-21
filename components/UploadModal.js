import { useState, useRef, useCallback } from "react";
import { uploadPhoto } from "../lib/uploadPhoto";
import { createPost } from "../lib/createPost";

const IconCamera = ({ color = "#967BB6", size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconGallery = ({ color = "#967BB6", size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

async function compressImage(file, maxSizeMB = 1) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
                quality -= 0.1;
                tryCompress();
              } else {
                resolve(blob);
              }
            },
            "image/jpeg",
            quality
          );
        };
        tryCompress();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function UploadModal({ userId, onClose, onPublished }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const cameraInputRef = useRef();
  const galleryInputRef = useRef();

  const handleFile = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
    // Reset o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  }, []);

  const handlePublish = async () => {
    if (!file || !userId) return;
    setPublishing(true);
    setError("");

    try {
      const compressed = await compressImage(file);
      const dataUrl = await blobToDataUrl(compressed);
      const fileName = `${userId}/${Date.now()}.jpg`;
      const publicUrl = await uploadPhoto(userId, dataUrl, fileName);
      await createPost(userId, publicUrl, caption.trim());
      onPublished();
    } catch (err) {
      console.error("Erro ao publicar:", err);
      setError(err.message || "Erro ao publicar. Tente novamente.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(74,59,92,0.5)",
        zIndex: 500, display: "flex", alignItems: "flex-end", padding: 0,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0", width: "100%",
        maxWidth: 560, margin: "0 auto", padding: 24, paddingBottom: 40,
        maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 20,
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 22,
            color: "#4A3B5C", margin: 0, fontWeight: 700,
          }}>Compartilhar momento</h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", color: "#9B8FAF", padding: 4,
          }}>✕</button>
        </div>

        {error && (
          <div style={{
            background: "#FFF0F0", color: "#D32F2F", padding: "10px 14px",
            borderRadius: 10, fontSize: 13, marginBottom: 16,
          }}>{error}</div>
        )}

        {!preview ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{
              textAlign: "center", color: "#9B8FAF", fontSize: 13,
              margin: "0 0 4px 0", fontFamily: "inherit",
            }}>
              Escolha como deseja adicionar sua foto
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              {/* Botão Câmera */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  flex: 1, background: "linear-gradient(135deg, #967BB6, #7A6A8F)",
                  border: "none", borderRadius: 16,
                  padding: "28px 16px", cursor: "pointer", color: "#fff", fontSize: 15,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 15px rgba(150,123,182,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(150,123,182,0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(150,123,182,0.3)";
                }}
              >
                <IconCamera color="#fff" />
                <span style={{ fontWeight: 600 }}>Tirar Foto</span>
                <span style={{ fontSize: 11, opacity: 0.85 }}>
                  Usar a câmera
                </span>
              </button>

              {/* Botão Galeria */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                style={{
                  flex: 1, background: "#F5F0FF", border: "2px solid #C3B1E1",
                  borderRadius: 16,
                  padding: "28px 16px", cursor: "pointer", color: "#7A6A8F", fontSize: 15,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 2px 10px rgba(195,177,225,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(195,177,225,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(195,177,225,0.2)";
                }}
              >
                <IconGallery />
                <span style={{ fontWeight: 600, color: "#4A3B5C" }}>Galeria</span>
                <span style={{ fontSize: 11, color: "#9B8FAF" }}>
                  Escolher uma foto
                </span>
              </button>
            </div>

            <span style={{
              textAlign: "center", fontSize: 11, color: "#9B8FAF", marginTop: 4,
            }}>
              JPG, PNG ou HEIC • máx 10MB (comprimido para 1MB)
            </span>

            {/* Input para Câmera - com capture="environment" */}
            <input
              ref={cameraInputRef} type="file" accept="image/*" capture="environment"
              onChange={handleFile} style={{ display: "none" }}
            />
            {/* Input para Galeria - sem capture, abre o seletor de arquivos/galeria */}
            <input
              ref={galleryInputRef} type="file" accept="image/*"
              onChange={handleFile} style={{ display: "none" }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              borderRadius: 16, overflow: "hidden", aspectRatio: "1/1",
              position: "relative",
            }}>
              <img src={preview} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover",
              }} />
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                style={{
                  position: "absolute", top: 10, right: 10,
                  background: "rgba(74,59,92,0.7)", border: "none", borderRadius: "50%",
                  width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
            <textarea
              placeholder="Escreva uma legenda..."
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 200))}
              rows={3}
              style={{
                border: "1.5px solid #C3B1E1", borderRadius: 12, padding: "12px 14px",
                fontSize: 14, color: "#4A3B5C", resize: "none", fontFamily: "inherit",
                outline: "none", background: "#F9F7FF",
              }}
            />
            <div style={{ textAlign: "right", fontSize: 12, color: "#9B8FAF", marginTop: -8 }}>
              {caption.length}/200
            </div>
            <button
              onClick={handlePublish}
              disabled={publishing}
              style={{
                background: "#967BB6", color: "#fff", border: "none", borderRadius: 14,
                padding: "15px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Cormorant Garamond', serif", letterSpacing: 0.5,
                opacity: publishing ? 0.8 : 1, transition: "all 0.2s",
              }}
            >
              {publishing ? "Publicando..." : "💜 Publicar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
