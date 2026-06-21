import { useState } from "react";
import Avatar from "./Avatar";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function CommentRow({
  comment,
  currentUserId,
  darkMode = false,
  onEdit,
  onDelete,
  compact = false,
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [saving, setSaving] = useState(false);

  const isOwner = comment.user_id === currentUserId;
  const textColor = darkMode ? "#E6E6FA" : "#4A3B5C";
  const commentColor = darkMode ? "#B0A8C0" : "#7A6A8F";
  const mutedColor = "#9B8FAF";

  const handleSave = async () => {
    if (!editText.trim() || editText.trim() === comment.text) {
      setEditing(false);
      setEditText(comment.text);
      return;
    }

    setSaving(true);
    try {
      await onEdit(comment.id, editText.trim());
      setEditing(false);
    } catch {
      setEditText(comment.text);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Excluir este comentário?")) return;
    await onDelete(comment.id);
  };

  return (
    <div className="comment-row" style={{ display: "flex", gap: compact ? 8 : 10 }}>
      <Avatar
        initials={comment.author?.charAt(0).toUpperCase() || "?"}
        size={compact ? 28 : 32}
        color="#C3B1E1"
        avatarUrl={comment.avatar_url}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: textColor }}>
            {comment.author || "Convidado"}
          </span>
          <span style={{ fontSize: 10, color: mutedColor }}>{timeAgo(comment.created_at)}</span>
          {isOwner && !editing && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => {
                  setEditText(comment.text);
                  setEditing(true);
                }}
                className="comment-action-btn"
                aria-label="Editar comentário"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="comment-action-btn comment-action-btn-danger"
                aria-label="Excluir comentário"
              >
                Excluir
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value.slice(0, 300))}
              rows={2}
              className="mobile-input"
              style={{
                width: "100%",
                border: "1.5px solid #C3B1E1",
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 14,
                color: textColor,
                resize: "none",
                fontFamily: "inherit",
                outline: "none",
                background: darkMode ? "#1a1a2e" : "#F9F7FF",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editText.trim()}
                className="btn-primary-sm"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditText(comment.text);
                }}
                className="btn-ghost-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: compact ? 13 : 14,
              color: commentColor,
              lineHeight: 1.45,
              marginTop: 4,
              wordBreak: "break-word",
            }}
          >
            {comment.text}
          </div>
        )}
      </div>
    </div>
  );
}
