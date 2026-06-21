import { useState, useEffect, useRef, useCallback } from "react";
import FloatingHearts from "../components/FloatingHearts";
import Toast from "../components/Toast";
import CoupleCarousel from "../components/CoupleCarousel";
import Avatar from "../components/Avatar";
import PhotoModal from "../components/PhotoModal";
import MenuUsuario from "../components/MenuUsuario";
import { supabase } from "../lib/supabase";
import { uploadPhoto } from "../lib/uploadPhoto";
import { createPost } from "../lib/createPost";
import { createComment, updateComment, deleteComment } from "../lib/commentActions";
import CommentRow from "../components/CommentRow";

// ─── ÍCONES SVG ──────────────────────────────────────────────────────────────
const IconHeart = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#967BB6" : "none"} stroke="#967BB6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconComment = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B8FAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C3B1E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const IconPlus = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconCamera = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#967BB6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function launchConfetti(canvasRef) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.pointerEvents = "none";
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width, y: -10,
    vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2 + 3,
    color: ["#C3B1E1", "#967BB6", "#E6E6FA", "#D8C8F0", "#7A5A9E"][Math.floor(Math.random() * 5)],
    size: Math.random() * 6 + 3, rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
  }));
  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    if (++frame < 60) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  requestAnimationFrame(animate);
}

// ─── POST CARD ───────────────────────────────────────────────────────────────
function PostCard({ post, currentUserId, onLike, onComment, onDelete, onOpenPhoto, darkMode }) {
  const isOwner = post.user_id === currentUserId;
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const cardBg = darkMode ? "#2a2a3e" : "#fff";
  const cardBorder = darkMode ? "#3a3a4e" : "#EDE7F6";
  const textColor = darkMode ? "#E6E6FA" : "#4A3B5C";
  const captionColor = darkMode ? "#B0A8C0" : "#7A6A8F";

  return (
    <div style={{
      background: cardBg, borderRadius: 14, overflow: "hidden",
      border: `1px solid ${cardBorder}`, transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div 
        style={{ aspectRatio: "1/1", position: "relative", background: darkMode ? "#1a1a2e" : "#F5F0FF", cursor: "pointer" }} 
        onClick={() => onOpenPhoto(post.id)}
      >
        {!imgLoaded && (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, #EDE7F6 30%, #D8C8F0 50%, #EDE7F6 70%)", backgroundSize: "200% 100%", animationName: "shimmer", animationDuration: "1.5s", animationIterationCount: "infinite" }} />
        )}
        <img src={post.image_url} alt={post.caption} onLoad={() => setImgLoaded(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: imgLoaded ? "block" : "none" }} />
      </div>
      <div style={{ padding: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Avatar 
            initials={post.author?.nome_convidado?.charAt(0).toUpperCase() || "?"} 
            size={28} 
            color="#C3B1E1"
            avatarUrl={post.author?.avatar_url}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: textColor, flex: 1 }}>{post.author?.nome_convidado || "Convidado"}</span>
          <span style={{ fontSize: 10, color: "#9B8FAF" }}>{timeAgo(post.created_at)}</span>
          {isOwner && (
            <button onClick={() => onDelete(post.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#C3B1E1" }}>
              <IconTrash />
            </button>
          )}
        </div>
        {post.caption && (
          <p style={{ fontSize: 12, color: captionColor, margin: "0 0 8px", lineHeight: 1.4 }}>{post.caption}</p>
        )}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => onLike(post.id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
            display: "flex", alignItems: "center", gap: 6, minHeight: 44,
          }}>
            <IconHeart filled={post.liked} />
            <span style={{ fontSize: 13, color: post.liked ? "#967BB6" : "#9B8FAF" }}>{post.likes_count || 0}</span>
          </button>
          <button onClick={() => onComment(post.id)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "8px 4px",
            display: "flex", alignItems: "center", gap: 6, minHeight: 44,
          }}>
            <IconComment />
            <span style={{ fontSize: 13, color: "#9B8FAF" }}>Comentar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── UPLOAD MODAL (ATUALIZADO COM 2 BOTÕES) ────────────────────────────────
function UploadModal({ onClose, onPublish, darkMode }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const cameraInputRef = useRef();
  const galleryInputRef = useRef();

  // Função para comprimir imagem
  const compressImage = useCallback((file, maxSizeMB = 1) => {
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
  }, []);

  const blobToDataUrl = useCallback((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  const handleFile = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
    e.target.value = "";
  }, []);

  const handlePublishClick = async () => {
    if (!preview || !file) return;
    setPublishing(true);
    setError("");

    try {
      const compressed = await compressImage(file);
      const dataUrl = await blobToDataUrl(compressed);
      
      // Usa o onPublish existente
      await onPublish({ image_url: dataUrl, caption }, () => {
        setPublishing(false);
        onClose();
      });
    } catch (err) {
      console.error("Erro ao publicar:", err);
      setError(err.message || "Erro ao publicar. Tente novamente.");
      setPublishing(false);
    }
  };

  const textColor = darkMode ? "#E6E6FA" : "#4A3B5C";

  return (
    <div className="bottom-sheet" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={darkMode ? "bottom-sheet-panel dark-panel" : "bottom-sheet-panel"} style={{ 
        padding: 20, 
        paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))", 
        overflowY: "auto" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: textColor, margin: 0, fontWeight: 600 }}>
            Compartilhar momento
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: textColor, minWidth: 44, minHeight: 44 }}>
            <IconClose />
          </button>
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
                <span style={{ fontSize: 36 }}>📸</span>
                <span style={{ fontWeight: 600 }}>Tirar Foto</span>
                <span style={{ fontSize: 11, opacity: 0.85 }}>Usar a câmera</span>
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
                <span style={{ fontSize: 36 }}>🖼️</span>
                <span style={{ fontWeight: 600, color: "#4A3B5C" }}>Galeria</span>
                <span style={{ fontSize: 11, color: "#9B8FAF" }}>Escolher uma foto</span>
              </button>
            </div>

            <span style={{
              textAlign: "center", fontSize: 11, color: "#9B8FAF", marginTop: 4,
            }}>
              JPG, PNG ou HEIC • máx 10MB (comprimido para 1MB)
            </span>

            {/* Input para Câmera - com capture="environment" */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            {/* Input para Galeria - sem capture */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "1/1", position: "relative" }}>
              <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => { setPreview(null); setFile(null); setError(""); }}
                style={{
                  position: "absolute", top: 8, right: 8,
                  background: "rgba(74,59,92,0.7)", border: "none", borderRadius: "50%",
                  width: 28, height: 28, cursor: "pointer", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
            <textarea
              placeholder="Escreva uma legenda..."
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, 200))}
              rows={2}
              style={{
                border: "1.5px solid #C3B1E1", borderRadius: 10, padding: "10px 12px",
                fontSize: 13, color: textColor, resize: "none", fontFamily: "inherit",
                outline: "none", background: darkMode ? "#1a1a2e" : "#F9F7FF",
              }}
            />
            <div style={{ textAlign: "right", fontSize: 11, color: "#9B8FAF", marginTop: -6 }}>
              {caption.length}/200
            </div>
            <button
              onClick={handlePublishClick}
              disabled={publishing}
              style={{
                background: "#967BB6", color: "#fff", border: "none", borderRadius: 12,
                padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer",
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

// ─── COMMENTS MODAL ──────────────────────────────────────────────────────────
function CommentsModal({ postId, comments, currentUser, onClose, onAdd, onEdit, onDelete, darkMode }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const postComments = comments[postId] || [];
  const listRef = useRef();

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onAdd(postId, text.trim());
      setText("");
      setTimeout(() => listRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 100);
    } finally {
      setSending(false);
    }
  };

  const textColor = darkMode ? "#E6E6FA" : "#4A3B5C";
  const panelClass = darkMode ? "bottom-sheet-panel dark-panel" : "bottom-sheet-panel";

  return (
    <div className="bottom-sheet" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={panelClass} style={{ maxHeight: "min(80vh, 720px)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${darkMode ? "#3a3a4e" : "#F0EBF8"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: textColor, margin: 0 }}>Comentários</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: textColor, minWidth: 44, minHeight: 44 }}><IconClose /></button>
        </div>
        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
          {postComments.length === 0 && <p style={{ color: "#9B8FAF", fontSize: 14, textAlign: "center", marginTop: 20 }}>Seja o primeiro a comentar!</p>}
          {postComments.map(c => (
            <CommentRow
              key={c.id}
              comment={c}
              currentUserId={currentUser.id}
              darkMode={darkMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
        <div style={{ padding: "12px 16px calc(16px + env(safe-area-inset-bottom, 0px))", borderTop: `1px solid ${darkMode ? "#3a3a4e" : "#F0EBF8"}`, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Adicione um comentário..."
            disabled={sending}
            className="mobile-input"
            style={{
              flex: 1, border: "1.5px solid #C3B1E1", borderRadius: 24, padding: "12px 16px",
              fontSize: 16, color: textColor, outline: "none", background: darkMode ? "#1a1a2e" : "#F9F7FF",
              fontFamily: "inherit",
            }}
          />
          <button onClick={handleSend} disabled={sending || !text.trim()} style={{
            background: "#967BB6", color: "#fff", border: "none", borderRadius: "50%",
            width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, opacity: sending ? 0.7 : 1,
          }}>
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [showUpload, setShowUpload] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const canvasRef = useRef();
  const [loading, setLoading] = useState(true);

  // Carregar preferência do modo escuro
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, []);

  // Carregar usuário e posts do Supabase
  useEffect(() => {
    const userSalvo = localStorage.getItem("user_lr");
    if (!userSalvo) {
      window.location.href = "/";
      return;
    }
    const userData = JSON.parse(userSalvo);
    setUser(userData);
    carregarPosts(userData.id);
  }, []);

  async function carregarPosts(userId) {
    setLoading(true);
    
    // Buscar posts com dados do autor
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (id, nome_convidado, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar posts:', error);
      setPosts([]);
    } else if (postsData) {
      // Buscar likes do usuário atual
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId);
      
      const likedPostIds = new Set(likesData?.map(l => l.post_id) || []);
      
      // Buscar comentários
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles:user_id (nome_convidado, avatar_url)')
        .order('created_at', { ascending: true });
      
      const commentsByPost = {};
      commentsData?.forEach(comment => {
        if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = [];
        commentsByPost[comment.post_id].push({
          id: comment.id,
          user_id: comment.user_id,
          author: comment.profiles?.nome_convidado || 'Convidado',
          text: comment.text,
          created_at: comment.created_at,
          avatar_url: comment.profiles?.avatar_url,
        });
      });
      setComments(commentsByPost);
      
      // Formatar posts
      const formattedPosts = postsData.map(post => ({
        id: post.id,
        user_id: post.user_id,
        image_url: post.image_url,
        caption: post.caption || '',
        likes_count: post.likes_count || 0,
        created_at: post.created_at,
        liked: likedPostIds.has(post.id),
        author: {
          nome_convidado: post.profiles?.nome_convidado || 'Convidado',
          avatar_initial: post.profiles?.nome_convidado?.charAt(0).toUpperCase() || '?',
          avatar_url: post.profiles?.avatar_url
        }
      }));
      
      setPosts(formattedPosts);
    }
    
    setLoading(false);
  }

  const showToastMsg = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000);
  };

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    if (post.liked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, liked: false, likes_count: Math.max(0, (p.likes_count || 0) - 1) }
            : p
        ));
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id });
      
      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, liked: true, likes_count: (p.likes_count || 0) + 1 }
            : p
        ));
        showToastMsg("Curtido! 💜");
      }
    }
  };

  const handlePublish = async ({ image_url, caption }, onComplete) => {
    try {
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const publicUrl = await uploadPhoto(user.id, image_url, fileName);
      const newPost = await createPost(user.id, publicUrl, caption);
      
      const formattedPost = {
        id: newPost.id,
        user_id: user.id,
        image_url: publicUrl,
        caption: caption,
        likes_count: 0,
        created_at: newPost.created_at,
        liked: false,
        author: {
          nome_convidado: user.nome_convidado,
          avatar_initial: user.nome_convidado?.charAt(0).toUpperCase() || '?',
          avatar_url: user.avatar_url
        }
      };
      
      setPosts(prev => [formattedPost, ...prev]);
      launchConfetti(canvasRef);
      showToastMsg("Foto publicada! 🎉");
      
    } catch (error) {
      console.error('Erro ao publicar:', error);
      showToastMsg("Erro ao publicar foto");
    }
    
    onComplete();
  };

  const handleDelete = async (postId) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);
    
    if (error) {
      showToastMsg("Erro ao deletar");
    } else {
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToastMsg("Foto removida");
    }
  };

  const handleAddComment = async (postId, text) => {
    try {
      const newComment = await createComment(user.id, postId, text);
      const comment = {
        id: newComment.id,
        user_id: user.id,
        author: newComment.author || user.nome_convidado,
        text: newComment.text,
        created_at: newComment.created_at,
        avatar_url: newComment.avatar_url || user.avatar_url,
      };

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));

      showToastMsg("Comentário adicionado!");
    } catch (error) {
      console.error("Erro ao comentar:", error);
      showToastMsg("Erro ao comentar");
      throw error;
    }
  };

  const handleEditComment = async (commentId, text) => {
    try {
      const updated = await updateComment(user.id, commentId, text);

      setComments(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(postId => {
          next[postId] = next[postId].map(c =>
            c.id === commentId
              ? { ...c, text: updated.text, created_at: updated.created_at || c.created_at }
              : c
          );
        });
        return next;
      });

      showToastMsg("Comentário atualizado!");
    } catch (error) {
      console.error("Erro ao editar:", error);
      showToastMsg("Erro ao editar comentário");
      throw error;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(user.id, commentId);

      setComments(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(postId => {
          next[postId] = next[postId].filter(c => c.id !== commentId);
        });
        return next;
      });

      showToastMsg("Comentário excluído");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showToastMsg("Erro ao excluir comentário");
      throw error;
    }
  };

  const handleOpenPhoto = (postId) => {
    const index = posts.findIndex(p => p.id === postId);
    setSelectedPhotoIndex(index);
    setPhotoModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_lr");
    window.location.href = "/";
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    if (newDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: darkMode ? "#1a1a2e" : "#F5F0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: darkMode ? "#E6E6FA" : "#4A3B5C" }}>Carregando... 💜</p>
      </div>
    );
  }

  if (!user) return null;

  const bgColor = darkMode ? "#1a1a2e" : "#F5F0FF";
  const headerBg = darkMode ? "rgba(26,26,46,0.95)" : "rgba(245,240,255,0.95)";
  const headerBorder = darkMode ? "#3a3a4e" : "#EDE7F6";

  return (
    <>
      <style>{`
        @keyframes floatHeart { 0%,100%{transform:translateY(0) rotate(-5deg);opacity:0.07} 50%{transform:translateY(-60px) rotate(5deg);opacity:0.12} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 4px 16px rgba(150,123,182,0.4)} 50%{transform:scale(1.05);box-shadow:0 6px 24px rgba(150,123,182,0.5)} }
        * { -webkit-tap-highlight-color: transparent; }
        body { background: ${bgColor}; transition: background 0.3s ease; }
      `}</style>

      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 900 }} />
      <FloatingHearts />
      <Toast message={toast.message} visible={toast.visible} />

      <header className="app-header" style={{
        background: headerBg,
        borderBottom: `1px solid ${headerBorder}`,
      }}>
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: 8,
            transition: "opacity 0.2s",
          }}
        >
          <img 
            src="/photo.png" 
            alt="L&R Logo" 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #967BB6",
            }} 
          />
        </div>

        <MenuUsuario 
          user={user} 
          onLogout={handleLogout} 
          darkMode={darkMode} 
          onToggleDarkMode={toggleDarkMode}
        />
      </header>

      <div className="app-shell">
        <CoupleCarousel />

        <div className="feed-grid">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              onLike={handleLike}
              onComment={setCommentPostId}
              onDelete={handleDelete}
              onOpenPhoto={handleOpenPhoto}
              darkMode={darkMode}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: darkMode ? "#2a2a3e" : "#fff", borderRadius: 16, border: `1px solid ${headerBorder}` }}>
            <p style={{ color: darkMode ? "#B0A8C0" : "#7A6A8F" }}>Nenhuma foto ainda</p>
            <button onClick={() => setShowUpload(true)} style={{ marginTop: 12, background: "#967BB6", color: "white", border: "none", padding: "8px 20px", borderRadius: 24, cursor: "pointer" }}>
              Publicar primeira foto
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowUpload(true)}
        className="fab-btn"
        aria-label="Publicar foto"
      >
        <IconPlus />
      </button>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onPublish={handlePublish} darkMode={darkMode} />}
      {commentPostId && (
        <CommentsModal
          postId={commentPostId}
          comments={comments}
          currentUser={user}
          onClose={() => setCommentPostId(null)}
          onAdd={handleAddComment}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
          darkMode={darkMode}
        />
      )}
      {photoModalOpen && (
        <PhotoModal
          posts={posts.map(post => ({ ...post, comments: comments[post.id] || [] }))}
          initialIndex={selectedPhotoIndex}
          currentUserId={user.id}
          onLike={handleLike}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onClose={() => setPhotoModalOpen(false)}
          darkMode={darkMode}
        />
      )}
    </>
  );
}