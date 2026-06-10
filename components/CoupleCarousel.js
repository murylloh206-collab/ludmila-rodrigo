import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function CoupleCarousel({ onOpenPhoto }) {
  const [topPhotos, setTopPhotos] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarFotosMaisCurtidas();
  }, []);

  useEffect(() => {
    if (topPhotos.length > 0) {
      const id = setInterval(() => setIdx(i => (i + 1) % topPhotos.length), 4000);
      return () => clearInterval(id);
    }
  }, [topPhotos]);

  async function carregarFotosMaisCurtidas() {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("posts")
      .select("id, image_url, likes_count, caption, profiles:user_id (nome_convidado)")
      .order("likes_count", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Erro ao carregar fotos mais curtidas:", error);
      setTopPhotos([]);
    } else if (data && data.length > 0) {
      setTopPhotos(data);
    }
    
    setLoading(false);
  }

  const handlePhotoClick = () => {
    if (topPhotos[idx] && onOpenPhoto) {
      onOpenPhoto(topPhotos[idx].id);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        borderRadius: 20, 
        overflow: "hidden", 
        marginBottom: 16,
        background: "linear-gradient(135deg, #967BB6 0%, #C3B1E1 100%)",
        padding: "40px",
        textAlign: "center"
      }}>
        <p style={{ color: "#fff" }}>Carregando fotos mais curtidas... 💜</p>
      </div>
    );
  }

  if (topPhotos.length === 0) {
    return (
      <div style={{ 
        borderRadius: 20, 
        overflow: "hidden", 
        marginBottom: 16,
        background: "linear-gradient(135deg, #967BB6 0%, #C3B1E1 100%)",
        padding: "40px",
        textAlign: "center"
      }}>
        <p style={{ color: "#fff" }}>Nenhuma foto por aqui ainda... Seja o primeiro a publicar! 💜</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
      <div 
        style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden", cursor: "pointer" }} 
        onClick={handlePhotoClick}
      >
        {topPhotos.map((photo, i) => (
          <img 
            key={i} 
            src={photo.image_url} 
            alt="" 
            style={{
              position: "absolute", 
              inset: 0, 
              width: "100%", 
              height: "100%",
              objectFit: "cover", 
              transition: "opacity 0.8s ease",
              opacity: i === idx ? 1 : 0,
            }} 
          />
        ))}
        <div style={{
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(to top, rgba(74,59,92,0.7) 0%, transparent 60%)",
          display: "flex", 
          alignItems: "flex-end", 
          padding: 20,
        }}>
          <div>
            <p style={{ color: "#E6E6FA", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, margin: 0, lineHeight: 1.4 }}>
              💜 {topPhotos[idx]?.likes_count || 0} curtidas
            </p>
            <p style={{ color: "#C3B1E1", fontSize: 12, margin: "4px 0 0" }}>
              Foto por {topPhotos[idx]?.profiles?.nome_convidado || "Alguém especial"}
            </p>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, right: 16, display: "flex", gap: 6 }}>
        {topPhotos.map((_, i) => (
          <div 
            key={i} 
            onClick={() => setIdx(i)} 
            style={{
              width: i === idx ? 20 : 6, 
              height: 6, 
              borderRadius: 3,
              background: i === idx ? "#fff" : "rgba(255,255,255,0.5)",
              transition: "all 0.3s", 
              cursor: "pointer",
            }} 
          />
        ))}
      </div>
    </div>
  );
}