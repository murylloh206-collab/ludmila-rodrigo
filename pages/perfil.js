import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { getStoredUser, setStoredUser, loadProfile } from "../lib/auth";
import { uploadPhoto } from "../lib/uploadPhoto";
import FloatingHearts from "../components/FloatingHearts";
import Toast from "../components/Toast";
import Avatar from "../components/Avatar";

const IconArrowBack = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A3B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#967BB6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
    <path d="M4 20h16"/>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const IconImage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#967BB6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="2.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#967BB6" stroke="#967BB6" strokeWidth="1">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconComment = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#967BB6" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A3B5C" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconCamera = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#967BB6" strokeWidth="1.5">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

function EditCaptionModal({ post, onClose, onSave }) {
  const [caption, setCaption] = useState(post.caption || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(post.id, caption);
    setSaving(false);
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3>Editar legenda</h3>
          <button onClick={onClose} style={styles.closeBtn}><IconClose /></button>
        </div>
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value.slice(0, 200))}
          placeholder="Escreva uma legenda..."
          rows={4}
          style={styles.textarea}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: "#9B8FAF", marginTop: -8 }}>{caption.length}/200</div>
        <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}

function LikesModal({ post, onClose }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("likes")
        .select("id, profiles:user_id (nome_convidado, avatar_url)")
        .eq("post_id", post.id);

      if (!error && data) setLikes(data);
      setLoading(false);
    }
    carregar();
  }, [post.id]);

  return (
    <div style={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modalContent, maxWidth: 400 }}>
        <div style={styles.modalHeader}>
          <h3>Curtidas ({post.likes_count})</h3>
          <button onClick={onClose} style={styles.closeBtn}><IconClose /></button>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {loading && <p style={{ padding: 16, color: "#9B8FAF" }}>Carregando...</p>}
          {!loading && likes.length === 0 && (
            <p style={{ padding: 16, color: "#9B8FAF", textAlign: "center" }}>Nenhuma curtida ainda</p>
          )}
          {likes.map(like => (
            <div key={like.id} style={styles.likeItem}>
              <Avatar
                initials={like.profiles?.nome_convidado?.charAt(0).toUpperCase() || "?"}
                size={36}
                color="#C3B1E1"
                avatarUrl={like.profiles?.avatar_url}
              />
              <span style={{ fontWeight: 500, color: "#4A3B5C" }}>{like.profiles?.nome_convidado || "Convidado"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentsListModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("comments")
        .select("id, text, created_at, profiles:user_id (nome_convidado, avatar_url)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (!error && data) setComments(data);
      setLoading(false);
    }
    carregar();
  }, [post.id]);

  return (
    <div style={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modalContent, maxWidth: 400 }}>
        <div style={styles.modalHeader}>
          <h3>Comentários ({post.comments_count || 0})</h3>
          <button onClick={onClose} style={styles.closeBtn}><IconClose /></button>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {loading && <p style={{ padding: 16, color: "#9B8FAF" }}>Carregando...</p>}
          {!loading && comments.length === 0 && (
            <p style={{ padding: 16, color: "#9B8FAF", textAlign: "center" }}>Nenhum comentário ainda</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} style={styles.commentItem}>
              <Avatar
                initials={comment.profiles?.nome_convidado?.charAt(0).toUpperCase() || "?"}
                size={32}
                color="#C3B1E1"
                avatarUrl={comment.profiles?.avatar_url}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#4A3B5C" }}>{comment.profiles?.nome_convidado || "Convidado"}</div>
                <div style={{ fontSize: 13, color: "#7A6A8F" }}>{comment.text}</div>
                <div style={{ fontSize: 10, color: "#9B8FAF", marginTop: 2 }}>{timeAgo(comment.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePostCard({ post, onEdit, onDelete, onViewLikes, onViewComments }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="profile-post-card" style={styles.profilePostCard}>
      <div style={styles.profilePostImage}>
        {!imgLoaded && <div style={styles.imageSkeleton} />}
        <img
          src={post.image_url}
          alt={post.caption}
          onLoad={() => setImgLoaded(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: imgLoaded ? "block" : "none" }}
        />
        <div className="post-overlay" style={styles.postOverlay}>
          <div style={styles.postStats}>
            <button onClick={() => onViewLikes(post)} style={styles.statBtn}>
              <IconHeart /> <span>{post.likes_count}</span>
            </button>
            <button onClick={() => onViewComments(post)} style={styles.statBtn}>
              <IconComment /> <span>{post.comments_count || 0}</span>
            </button>
          </div>
          <div style={styles.postActions}>
            <button onClick={() => onEdit(post)} style={styles.editBtn}><IconEdit /> Editar</button>
            <button onClick={() => onDelete(post.id)} style={styles.deleteBtn}><IconTrash /> Excluir</button>
          </div>
        </div>
      </div>
      {post.caption && (
        <div style={styles.postCaption}>
          <span style={{ fontSize: 11, color: "#7A6A8F" }}>{post.caption}</span>
        </div>
      )}
    </div>
  );
}

function AvatarModal({ user, onClose, onUpdateAvatar }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    await onUpdateAvatar(preview);
    setUploading(false);
    onClose();
  };

  return (
    <div style={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modalContent, maxWidth: 380 }}>
        <div style={styles.modalHeader}>
          <h3>Foto de perfil</h3>
          <button onClick={onClose} style={styles.closeBtn}><IconClose /></button>
        </div>
        {!preview ? (
          <div style={styles.avatarUploadArea}>
            <div style={styles.currentAvatar}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" style={styles.currentAvatarImg} />
              ) : (
                <div style={styles.currentAvatarPlaceholder}>
                  {user?.nome_convidado?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <button onClick={() => inputRef.current?.click()} style={styles.uploadBtn}>
              <IconCamera /> Escolher foto
            </button>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          </div>
        ) : (
          <div style={styles.previewArea}>
            <img src={preview} alt="preview" style={styles.previewImg} />
            <div style={styles.previewActions}>
              <button onClick={() => setPreview(null)} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={handleUpload} disabled={uploading} style={styles.confirmBtn}>
                {uploading ? "Enviando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLikes: 0, totalComments: 0 });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.profile-post-card:hover .post-overlay { opacity: 1 !important; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showToastMsg = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000);
  };

  async function carregarPostsDoUsuario(userId) {
    setLoading(true);

    const { data: postsData, error } = await supabase
      .from("posts")
      .select("id, user_id, image_url, caption, likes_count, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar posts:", error);
      setPosts([]);
      setStats({ totalLikes: 0, totalComments: 0 });
      setLoading(false);
      return;
    }

    const postIds = (postsData || []).map(p => p.id);
    let commentsCountMap = {};

    if (postIds.length > 0) {
      const { data: commentsData } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds);

      commentsData?.forEach(c => {
        commentsCountMap[c.post_id] = (commentsCountMap[c.post_id] || 0) + 1;
      });
    }

    const postsComContagem = (postsData || []).map(p => ({
      ...p,
      comments_count: commentsCountMap[p.id] || 0,
    }));

    setPosts(postsComContagem);
    setStats({
      totalLikes: postsComContagem.reduce((sum, p) => sum + (p.likes_count || 0), 0),
      totalComments: postsComContagem.reduce((sum, p) => sum + (p.comments_count || 0), 0),
    });
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const stored = getStoredUser();
      if (!stored?.id) {
        window.location.href = "/";
        return;
      }

      const profile = await loadProfile(supabase, stored.id);
      if (!profile) {
        window.location.href = "/";
        return;
      }

      setStoredUser(profile);
      setUser(profile);
      await carregarPostsDoUsuario(profile.id);
    }
    init();
  }, []);

  const handleEditCaption = async (postId, newCaption) => {
    const { error } = await supabase
      .from("posts")
      .update({ caption: newCaption })
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao editar legenda:", error);
      showToastMsg("Erro ao salvar legenda");
      return;
    }

    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, caption: newCaption } : p)));
    showToastMsg("Legenda atualizada!");
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Tem certeza que quer excluir esta foto?")) return;

    await supabase.from("likes").delete().eq("post_id", postId);
    await supabase.from("comments").delete().eq("post_id", postId);

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao excluir:", error);
      showToastMsg("Erro ao excluir foto");
      return;
    }

    setPosts(prev => {
      const updated = prev.filter(p => p.id !== postId);
      setStats({
        totalLikes: updated.reduce((sum, p) => sum + (p.likes_count || 0), 0),
        totalComments: updated.reduce((sum, p) => sum + (p.comments_count || 0), 0),
      });
      return updated;
    });
    showToastMsg("Foto excluída!");
  };

  const handleUpdateAvatar = async (dataUrl) => {
    try {
      const fileName = `avatars/${user.id}/${Date.now()}.jpg`;
      const publicUrl = await uploadPhoto(user.id, dataUrl, fileName);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, avatar_url: publicUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar perfil");

      const updatedUser = { ...user, avatar_url: publicUrl };
      setUser(updatedUser);
      setStoredUser(updatedUser);
      showToastMsg("Foto de perfil atualizada!");
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
      showToastMsg("Erro ao atualizar foto de perfil");
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Carregando... 💜</p>
      </div>
    );
  }

  return (
    <>
      <FloatingHearts />
      <Toast message={toast.message} visible={toast.visible} />

      <header style={styles.header}>
        <button onClick={() => window.location.href = "/app"} style={styles.backBtn}>
          <IconArrowBack />
        </button>
        <h1 style={styles.headerTitle}>Meu Perfil</h1>
        <div style={{ width: 40 }} />
      </header>

      <div style={styles.profileContainer}>
        <div style={styles.avatarContainer} onClick={() => setShowAvatarModal(true)}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {user?.nome_convidado?.charAt(0).toUpperCase() || "?"}
              <div style={styles.avatarEditOverlay}>
                <IconCamera />
              </div>
            </div>
          )}
        </div>

        <h2 style={styles.profileName}>{user?.nome_convidado}</h2>
        <p style={styles.profilePhone}>{user?.telefone}</p>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{posts.length}</span>
            <span style={styles.statLabel}>Fotos</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.totalLikes}</span>
            <span style={styles.statLabel}>Curtidas</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{stats.totalComments}</span>
            <span style={styles.statLabel}>Comentários</span>
          </div>
        </div>
      </div>

      <div style={styles.postsSection}>
        <div style={styles.sectionHeader}>
          <IconImage />
          <h3>Minhas Fotos</h3>
        </div>

        {posts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Você ainda não publicou nenhuma foto</p>
            <button onClick={() => window.location.href = "/app"} style={styles.emptyStateBtn}>
              Publicar agora
            </button>
          </div>
        ) : (
          <div style={styles.postsGrid}>
            {posts.map(post => (
              <ProfilePostCard
                key={post.id}
                post={post}
                onEdit={(p) => { setSelectedPost(p); setShowEditModal(true); }}
                onDelete={handleDeletePost}
                onViewLikes={(p) => { setSelectedPost(p); setShowLikesModal(true); }}
                onViewComments={(p) => { setSelectedPost(p); setShowCommentsModal(true); }}
              />
            ))}
          </div>
        )}
      </div>

      {showAvatarModal && (
        <AvatarModal user={user} onClose={() => setShowAvatarModal(false)} onUpdateAvatar={handleUpdateAvatar} />
      )}
      {showEditModal && selectedPost && (
        <EditCaptionModal
          post={selectedPost}
          onClose={() => { setShowEditModal(false); setSelectedPost(null); }}
          onSave={handleEditCaption}
        />
      )}
      {showLikesModal && selectedPost && (
        <LikesModal post={selectedPost} onClose={() => { setShowLikesModal(false); setSelectedPost(null); }} />
      )}
      {showCommentsModal && selectedPost && (
        <CommentsListModal post={selectedPost} onClose={() => { setShowCommentsModal(false); setSelectedPost(null); }} />
      )}
    </>
  );
}

const styles = {
  loadingContainer: { minHeight: "100vh", background: "#F5F0FF", display: "flex", alignItems: "center", justifyContent: "center" },
  header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(245,240,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EDE7F6", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  backBtn: { background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#4A3B5C", margin: 0 },
  profileContainer: { display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", borderBottom: "1px solid #EDE7F6" },
  avatarContainer: { position: "relative", cursor: "pointer" },
  avatar: { width: 100, height: 100, borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: "50%", background: "#967BB6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: "bold", position: "relative" },
  avatarEditOverlay: { position: "absolute", bottom: 0, right: 0, background: "#fff", borderRadius: "50%", padding: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  profileName: { fontSize: 20, fontWeight: 600, color: "#4A3B5C", marginTop: 12, marginBottom: 4 },
  profilePhone: { fontSize: 13, color: "#9B8FAF", margin: 0 },
  statsContainer: { display: "flex", gap: 32, marginTop: 20 },
  statCard: { textAlign: "center" },
  statNumber: { display: "block", fontSize: 22, fontWeight: 700, color: "#967BB6" },
  statLabel: { fontSize: 12, color: "#9B8FAF" },
  postsSection: { padding: "16px" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  postsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  profilePostCard: { background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #EDE7F6" },
  profilePostImage: { aspectRatio: "1/1", position: "relative" },
  imageSkeleton: { position: "absolute", inset: 0, background: "linear-gradient(110deg, #EDE7F6 30%, #D8C8F0 50%, #EDE7F6 70%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" },
  postOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0, transition: "opacity 0.3s", cursor: "pointer" },
  postStats: { display: "flex", gap: 20 },
  statBtn: { background: "none", border: "none", color: "white", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 },
  postActions: { display: "flex", gap: 16 },
  editBtn: { background: "rgba(150,123,182,0.9)", border: "none", color: "white", padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  deleteBtn: { background: "rgba(231,76,60,0.9)", border: "none", color: "white", padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  postCaption: { padding: "8px", borderTop: "1px solid #EDE7F6" },
  emptyState: { textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 12, border: "1px solid #EDE7F6" },
  emptyStateBtn: { background: "#967BB6", color: "white", border: "none", padding: "10px 20px", borderRadius: 24, fontSize: 14, cursor: "pointer", marginTop: 12 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modalContent: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 500, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #EDE7F6" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", padding: 4 },
  textarea: { width: "100%", padding: "12px", border: "1.5px solid #C3B1E1", borderRadius: 12, fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", marginBottom: 8, boxSizing: "border-box" },
  saveBtn: { background: "#967BB6", color: "white", border: "none", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  likeItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #EDE7F6" },
  commentItem: { display: "flex", gap: 12, padding: "12px 16px", borderBottom: "1px solid #EDE7F6" },
  avatarUploadArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "24px" },
  currentAvatar: { width: 120, height: 120, borderRadius: "50%", overflow: "hidden" },
  currentAvatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  currentAvatarPlaceholder: { width: "100%", height: "100%", background: "#967BB6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: "bold" },
  uploadBtn: { background: "#F5F0FF", border: "2px dashed #C3B1E1", borderRadius: 12, padding: "12px 24px", fontSize: 14, color: "#967BB6", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
  previewArea: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px" },
  previewImg: { width: 150, height: 150, borderRadius: "50%", objectFit: "cover" },
  previewActions: { display: "flex", gap: 12 },
  cancelBtn: { background: "#EDE7F6", border: "none", padding: "10px 20px", borderRadius: 10, cursor: "pointer" },
  confirmBtn: { background: "#967BB6", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, cursor: "pointer" },
};
