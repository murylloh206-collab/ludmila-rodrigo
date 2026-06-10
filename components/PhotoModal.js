import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";

// ─── ÍCONES SVG ──────────────────────────────────────────────────────────────
const IconHeart = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#967BB6" : "none"} stroke="#967BB6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconComment = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconSend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#967BB6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
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

export default function PhotoModal({ 
  posts, 
  initialIndex, 
  currentUserId, 
  onLike, 
  onAddComment, 
  onClose,
  darkMode = false
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [commentText, setCommentText] = useState("");
  const [touchStart, setTouchStart] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const commentsEndRef = useRef(null);

  const post = posts[currentIndex];
  const postComments = post.comments || [];

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [postComments.length]);

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStart(null);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex(i => (i > 0 ? i - 1 : i));
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex(i => (i < posts.length - 1 ? i + 1 : i));
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [posts.length, onClose]);

  const sidebarBg = darkMode ? "#1a1a2e" : "#fff";
  const textColor = darkMode ? "#E6E6FA" : "#4A3B5C";
  const secondaryText = darkMode ? "#9B8FAF" : "#7A6A8F";

  if (isDesktop) {
    return (
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={styles.modalDesktop}>
          <button onClick={onClose} style={styles.closeBtnDesktop}>
            <IconClose />
          </button>

          <div style={styles.imageArea}>
            <img src={post.image_url} alt={post.caption} style={styles.imageDesktop} />
            
            {currentIndex > 0 && (
              <button onClick={handlePrev} style={styles.navPrev}>
                <IconChevronLeft />
              </button>
            )}
            {currentIndex < posts.length - 1 && (
              <button onClick={handleNext} style={styles.navNext}>
                <IconChevronRight />
              </button>
            )}
          </div>

          <div style={{ ...styles.sidebar, background: sidebarBg }}>
            <div style={{ ...styles.postHeader, borderBottomColor: darkMode ? "#3a3a4e" : "#EDE7F6" }}>
              <Avatar initials={post.author.avatar_initial} size={40} color="#C3B1E1" avatarUrl={post.author.avatar_url} />
              <div>
                <div style={{ ...styles.authorName, color: textColor }}>{post.author.nome_convidado}</div>
                <div style={styles.postTime}>{timeAgo(post.created_at)}</div>
              </div>
            </div>

            {post.caption && (
              <div style={{ ...styles.caption, borderBottomColor: darkMode ? "#3a3a4e" : "#EDE7F6" }}>
                <Avatar initials={post.author.avatar_initial} size={28} color="#C3B1E1" avatarUrl={post.author.avatar_url} />
                <span style={{ ...styles.captionText, color: textColor }}>{post.caption}</span>
              </div>
            )}

            <div style={styles.commentsList}>
              {postComments.map(comment => (
                <div key={comment.id} style={styles.commentItem}>
                  <Avatar initials={comment.author.slice(0, 2).toUpperCase()} size={28} color="#C3B1E1" avatarUrl={comment.avatar_url} />
                  <div style={styles.commentContent}>
                    <span style={{ ...styles.commentAuthor, color: textColor }}>{comment.author}</span>
                    <span style={{ ...styles.commentText, color: secondaryText }}>{comment.text}</span>
                    <span style={styles.commentTime}>{timeAgo(comment.created_at)}</span>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            <div style={{ ...styles.actions, borderTopColor: darkMode ? "#3a3a4e" : "#EDE7F6" }}>
              <button onClick={() => onLike(post.id)} style={styles.likeBtn}>
                <IconHeart filled={post.liked} />
                <span style={{ color: post.liked ? "#967BB6" : textColor }}>
                  {post.likes_count} curtidas
                </span>
              </button>
              
              <div style={styles.commentInput}>
                <input
                  type="text"
                  placeholder="Adicione um comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  style={{
                    ...styles.input,
                    background: darkMode ? "#2a2a3e" : "#F9F7FF",
                    color: textColor,
                    borderColor: darkMode ? "#3a3a4e" : "#C3B1E1",
                  }}
                />
                <button onClick={handleSendComment} style={styles.sendBtn}>
                  <IconSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div 
        style={styles.modalMobile}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button onClick={onClose} style={styles.closeBtnMobile}>
          <IconClose />
        </button>

        <div style={styles.pageIndicator}>
          {currentIndex + 1} / {posts.length}
        </div>

        {currentIndex > 0 && (
          <button onClick={handlePrev} style={styles.navPrevMobile}>
            <IconChevronLeft />
          </button>
        )}
        {currentIndex < posts.length - 1 && (
          <button onClick={handleNext} style={styles.navNextMobile}>
            <IconChevronRight />
          </button>
        )}

        <div style={styles.imageContainer}>
          <img src={post.image_url} alt={post.caption} style={styles.imageMobile} />
        </div>

        <div style={{ ...styles.infoContainer, background: sidebarBg }}>
          <div style={{ ...styles.postHeader, borderBottomColor: darkMode ? "#3a3a4e" : "#EDE7F6" }}>
            <Avatar initials={post.author.avatar_initial} size={36} color="#C3B1E1" avatarUrl={post.author.avatar_url} />
            <div>
              <div style={{ ...styles.authorName, color: textColor }}>{post.author.nome_convidado}</div>
              <div style={styles.postTime}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          {post.caption && (
            <div style={{ ...styles.captionMobile, color: textColor }}>
              <strong>{post.author.nome_convidado}</strong> {post.caption}
            </div>
          )}

          <button onClick={() => onLike(post.id)} style={styles.likeBtnMobile}>
            <IconHeart filled={post.liked} />
            <span style={{ color: post.liked ? "#967BB6" : textColor }}>{post.likes_count} curtidas</span>
          </button>

          <div style={styles.commentsListMobile}>
            {postComments.map(comment => (
              <div key={comment.id} style={{ ...styles.commentItemMobile, borderBottomColor: darkMode ? "#3a3a4e" : "#EDE7F6" }}>
                <strong style={{ color: textColor }}>{comment.author}</strong>
                <span style={{ color: secondaryText }}>{comment.text}</span>
                <span style={styles.commentTimeMobile}>{timeAgo(comment.created_at)}</span>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>

          <div style={{ ...styles.commentInputMobile, borderTopColor: darkMode ? "#3a3a4e" : "#EDE7F6" }}>
            <input
              type="text"
              placeholder="Adicione um comentário..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
              style={{
                ...styles.inputMobile,
                background: darkMode ? "#2a2a3e" : "#F9F7FF",
                color: textColor,
                borderColor: darkMode ? "#3a3a4e" : "#C3B1E1",
              }}
            />
            <button onClick={handleSendComment} style={styles.sendBtnMobile}>
              <IconSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.95)",
    zIndex: 2000,
  },
  modalDesktop: {
    display: "flex",
    width: "100%",
    height: "100%",
    position: "relative",
  },
  closeBtnDesktop: {
    position: "absolute",
    top: 20,
    right: 20,
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  imageArea: {
    flex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    position: "relative",
  },
  imageDesktop: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  navPrev: {
    position: "absolute",
    left: 20,
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: 48,
    height: 48,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navNext: {
    position: "absolute",
    right: 20,
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: 48,
    height: 48,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: 380,
  },
  postHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px",
    borderBottom: "1px solid",
  },
  authorName: {
    fontWeight: 600,
    fontSize: 14,
  },
  postTime: {
    fontSize: 11,
    color: "#9B8FAF",
  },
  caption: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid",
  },
  captionText: {
    fontSize: 14,
    lineHeight: 1.4,
    flex: 1,
  },
  commentsList: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  commentItem: {
    display: "flex",
    gap: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: 600,
    fontSize: 13,
    marginRight: 8,
  },
  commentText: {
    fontSize: 13,
  },
  commentTime: {
    fontSize: 10,
    color: "#9B8FAF",
    display: "block",
    marginTop: 2,
  },
  actions: {
    padding: "16px",
    borderTop: "1px solid",
  },
  likeBtn: {
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    marginBottom: 12,
    fontSize: 13,
  },
  commentInput: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    border: "1.5px solid",
    borderRadius: 24,
    padding: "10px 16px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  modalMobile: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflowY: "auto",
  },
  closeBtnMobile: {
    position: "fixed",
    top: 16,
    left: 16,
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: 36,
    height: 36,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  pageIndicator: {
    position: "fixed",
    top: 16,
    right: 16,
    background: "rgba(0,0,0,0.5)",
    color: "white",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    zIndex: 10,
  },
  navPrevMobile: {
    position: "fixed",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  navNextMobile: {
    position: "fixed",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  imageContainer: {
    width: "100%",
    minHeight: "50vh",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageMobile: {
    width: "100%",
    height: "auto",
    maxHeight: "60vh",
    objectFit: "contain",
  },
  infoContainer: {
    borderRadius: "20px 20px 0 0",
    padding: "16px",
    marginTop: -10,
    position: "relative",
    zIndex: 5,
  },
  captionMobile: {
    fontSize: 14,
    padding: "12px 0",
    borderBottom: "1px solid #EDE7F6",
  },
  likeBtnMobile: {
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    padding: "12px 0",
    fontSize: 14,
  },
  commentsListMobile: {
    maxHeight: "30vh",
    overflowY: "auto",
    padding: "8px 0",
  },
  commentItemMobile: {
    fontSize: 13,
    padding: "8px 0",
    borderBottom: "1px solid",
  },
  commentTimeMobile: {
    fontSize: 10,
    color: "#9B8FAF",
    marginLeft: 8,
  },
  commentInputMobile: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    paddingTop: 12,
    borderTop: "1px solid",
  },
  inputMobile: {
    flex: 1,
    border: "1.5px solid",
    borderRadius: 24,
    padding: "10px 14px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtnMobile: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};