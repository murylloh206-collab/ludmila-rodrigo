export default function Toast({ message, visible }) {
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: "#967BB6", color: "#fff", padding: "12px 24px", borderRadius: 24,
      fontSize: 14, fontWeight: 500, zIndex: 1000,
      opacity: visible ? 1 : 0, transition: "all 0.3s ease",
      pointerEvents: "none", whiteSpace: "nowrap",
      boxShadow: "0 4px 20px rgba(150,123,182,0.4)",
    }}>
      {message}
    </div>
  );
}
