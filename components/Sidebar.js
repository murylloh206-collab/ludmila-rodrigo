export default function Sidebar({ posts }) {
  const topPosts = [...posts].sort((a, b) => b.likes_count - a.likes_count).slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #EDE7F6" }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 16,
          color: "#4A3B5C", margin: "0 0 12px", fontWeight: 700,
        }}>💜 Mais curtidas</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topPosts.map((p) => (
            <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <img src={p.image_url} alt="" style={{
                width: 48, height: 48, borderRadius: 10, objectFit: "cover",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: "#4A3B5C",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {p.profiles?.nome_convidado || "Convidado"}
                </div>
                <div style={{ fontSize: 11, color: "#9B8FAF" }}>
                  💜 {p.likes_count} curtidas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #EDE7F6" }}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 16,
          color: "#4A3B5C", margin: "0 0 12px", fontWeight: 700,
        }}>🌸 Próximos passos</h3>
        {[["📸", "Compartilhe suas fotos!"], ["💜", "Curta os momentos"], ["💬", "Deixe um comentário"], ["🥂", "Celebre o amor!"]].map(([icon, text]) => (
          <div key={text} style={{
            display: "flex", gap: 8, alignItems: "center",
            marginBottom: 8, fontSize: 13, color: "#7A6A8F",
          }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
