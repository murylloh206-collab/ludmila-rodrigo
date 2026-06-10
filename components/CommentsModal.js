import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return `há ${Math.floor(diff / 86400)}d`;
}

export default function CommentsModal({ supabase, postId, currentUser, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef();

  // Buscar comentários do post
  useEffect(() => {
    if (!postId || !supabase) return;

    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles:user_id(nome_convidado)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setComments(data);
      }
      setLoading(false);
    };

    fetchComments();
  }, [postId, supabase]);

  const handleSend = async () => {
    if (!text.trim() || !supabase || !currentUser) return;
    setSending(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        text: text.trim(),
      })
      .select("*, profiles:user_id(nome_convidado)")
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setText("");
      setTimeout(() => listRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 100);
    }
    setSending(false);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(74,59,92,0.5)",
        zIndex: 500, display: "flex", alignItems: "flex-end",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "24px 24px 0 0", width: "100%",
        maxWidth: 560, margin: "0 auto", display: "flex",
        flexDirection: "column", maxHeight: "70vh",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 20px 12px", borderBottom: "1px solid #F0EBF8",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 20,
            color: "#4A3B5C", margin: 0,
          }}>Comentários</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 18,
            cursor: "pointer", color: "#9B8FAF",
          }}>✕</button>
        </div>

        {/* Lista de comentários */}
        <div ref={listRef} style={{
          flex: 1, overflowY: "auto", padding: "12px 20px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {loading && (
            <p style={{ color: "#9B8FAF", fontSize: 14, textAlign: "center", marginTop: 20 }}>
              Carregando...
            </p>
          )}
          {!loading && comments.length === 0 && (
            <p style={{ color: "#9B8FAF", fontSize: 14, textAlign: "center", marginTop: 20 }}>
              Seja o primeiro a comentar! 💬
            </p>
          )}
          {comments.map((c) => {
            const name = c.profiles?.nome_convidado || "Convidado";
            const initial = name.charAt(0).toUpperCase();
            return (
              <div key={c.id} style={{ display: "flex", gap: 10 }}>
                <Avatar initials={initial} size={30} color="#C3B1E1" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#4A3B5C" }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 13, color: "#7A6A8F", lineHeight: 1.4 }}>
                    {c.text}
                  </div>
                  <div style={{ fontSize: 11, color: "#9B8FAF", marginTop: 2 }}>
                    {timeAgo(c.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px 28px", borderTop: "1px solid #F0EBF8",
          display: "flex", gap: 10,
        }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Adicione um comentário..."
            disabled={sending}
            style={{
              flex: 1, border: "1.5px solid #C3B1E1", borderRadius: 24,
              padding: "10px 16px", fontSize: 14, color: "#4A3B5C",
              outline: "none", background: "#F9F7FF", fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            style={{
              background: "#967BB6", color: "#fff", border: "none", borderRadius: "50%",
              width: 42, height: 42, cursor: "pointer", fontSize: 18, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: sending ? 0.6 : 1,
            }}
          >💜</button>
        </div>
      </div>
    </div>
  );
}
