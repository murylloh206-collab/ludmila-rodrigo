import { useState } from "react";
import Avatar from "./Avatar";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return `há ${Math.floor(diff / 86400)}d`;
}

export default function PostCard({ post, currentUserId, onLike, onComment, onDelete }) {
  const isOwner = post.user_id === currentUserId;
  const [imgLoaded, setImgLoaded] = useState(false);

  const authorName = post.profiles?.nome_convidado || "Convidado";
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #EDE7F6", transition: "transform 0.2s, box-shadow 0.2s",
        animationName: "fadeInUp", animationDuration: "0.4s", animationFillMode: "both",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(150,123,182,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ aspectRatio: "1/1", position: "relative", background: "#F5F0FF" }}>
        {!imgLoaded && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(110deg, #EDE7F6 30%, #D8C8F0 50%, #EDE7F6 70%)",
            backgroundSize: "200% 100%",
            animationName: "shimmer", animationDuration: "1.5s",
            animationIterationCount: "infinite",
          }} />
        )}
        <img
          src={post.image_url}
          alt={post.caption || ""}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            display: imgLoaded ? "block" : "none",
          }}
        />
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Avatar initials={authorInitial} size={26} color="#C3B1E1" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#4A3B5C", flex: 1 }}>
            {authorName}
          </span>
          <span style={{ fontSize: 10, color: "#9B8FAF" }}>{timeAgo(post.created_at)}</span>
          {isOwner && (
            <button
              onClick={() => onDelete(post.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 2, color: "#C3B1E1", fontSize: 14, lineHeight: 1,
              }}
            >🗑</button>
          )}
        </div>
        {post.caption && (
          <p style={{
            fontSize: 12, color: "#7A6A8F", margin: "0 0 8px", lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {post.caption}
          </p>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => onLike(post.id)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", gap: 4,
              color: post.liked ? "#967BB6" : "#9B8FAF",
              fontSize: 12, fontWeight: post.liked ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            <span style={{
              fontSize: 16,
              transform: post.liked ? "scale(1.2)" : "scale(1)",
              transition: "transform 0.2s", display: "inline-block",
            }}>
              {post.liked ? "💜" : "🤍"}
            </span>
            {post.likes_count}
          </button>
          <button
            onClick={() => onComment(post.id)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", gap: 4,
              color: "#9B8FAF", fontSize: 12,
            }}
          >
            💬 Comentar
          </button>
        </div>
      </div>
    </div>
  );
}
