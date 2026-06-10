export default function Avatar({ initials, size = 32, color = "#967BB6", avatarUrl }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: `2px solid ${color}`,
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 600, color: "#fff",
      flexShrink: 0, fontFamily: "'Cormorant Garamond', serif",
    }}>
      {initials}
    </div>
  );
}
