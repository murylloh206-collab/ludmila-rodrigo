import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import FloatingHearts from "../components/FloatingHearts";
import Toast from "../components/Toast";
import Avatar from "../components/Avatar";
import { getStoredUser, clearStoredUser, loadProfile, isCasal } from "../lib/auth";

function formatTelefone(tel) {
  const nums = (tel || "").replace(/\D/g, "");
  if (nums.length === 11) return nums.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (nums.length === 10) return nums.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return tel;
}

function ParabensModal({ onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.parabensCard} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉💜</div>
        <h2 style={styles.parabensTitle}>Meus parabéns!</h2>
        <p style={styles.parabensText}>
          Que a renovação de votos de vocês seja perfeita! 🎉💜
        </p>
        <button onClick={onClose} style={styles.parabensBtn}>Obrigado(a)! 💜</button>
      </div>
    </div>
  );
}

export default function Casal() {
  const [user, setUser] = useState(null);
  const [convidados, setConvidados] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [selecionadas, setSelecionadas] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [baixando, setBaixando] = useState(false);
  const [showParabens, setShowParabens] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [aba, setAba] = useState("convidados");

  useEffect(() => {
    async function init() {
      const stored = getStoredUser();
      if (!stored?.id) {
        window.location.href = "/";
        return;
      }

      const profile = await loadProfile(supabase, stored.id);
      if (!profile || !isCasal(profile.nome_convidado, profile.telefone)) {
        window.location.href = "/app";
        return;
      }

      setUser(profile);

      if (!sessionStorage.getItem("parabens_lr")) {
        setShowParabens(true);
        sessionStorage.setItem("parabens_lr", "1");
      }

      const [convidadosRes, fotosRes] = await Promise.all([
        supabase.from("profiles").select("id, nome_convidado, telefone, avatar_url").order("nome_convidado"),
        supabase.from("posts").select("id, image_url, caption, likes_count, created_at, profiles:user_id(nome_convidado)").order("created_at", { ascending: false }),
      ]);

      if (convidadosRes.data) setConvidados(convidadosRes.data);
      if (fotosRes.data) setFotos(fotosRes.data);
      setLoading(false);
    }
    init();
  }, []);

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const toggleFoto = (id) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selecionarTodas = () => {
    if (selecionadas.size === fotos.length) {
      setSelecionadas(new Set());
    } else {
      setSelecionadas(new Set(fotos.map(f => f.id)));
    }
  };

  const baixarSelecionadas = async () => {
    if (selecionadas.size === 0) {
      showToast("Selecione ao menos uma foto");
      return;
    }

    setBaixando(true);
    const fotosParaBaixar = fotos.filter(f => selecionadas.has(f.id));

    for (let i = 0; i < fotosParaBaixar.length; i++) {
      const foto = fotosParaBaixar[i];
      try {
        const res = await fetch(foto.image_url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lr-foto-${foto.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.error("Erro ao baixar:", err);
      }
    }

    setBaixando(false);
    showToast(`${fotosParaBaixar.length} foto(s) baixada(s)!`);
  };

  const abrirWhatsApp = (telefone, nome) => {
    const nums = (telefone || "").replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá ${nome}! 💜 Lembrete do evento de Renovação de Votos da Ludmila e Rodrigo!`);
    window.open(`https://wa.me/55${nums}?text=${msg}`, "_blank");
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p style={{ color: "#4A3B5C" }}>Carregando... 💜</p>
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <FloatingHearts />
      <Toast message={toast.message} visible={toast.visible} />
      {showParabens && <ParabensModal onClose={() => setShowParabens(false)} />}

      <header style={styles.header}>
        <img src="/photo.png" alt="L&R" style={styles.logo} />
        <div>
          <h1 style={styles.headerTitle}>Painel do Casal</h1>
          <p style={styles.headerSub}>Olá, {user?.nome_convidado} 💜</p>
        </div>
        <button onClick={() => { clearStoredUser(); window.location.href = "/"; }} style={styles.logoutBtn}>
          Sair
        </button>
      </header>

      <div style={styles.tabs}>
        <button onClick={() => setAba("convidados")} style={{ ...styles.tab, ...(aba === "convidados" ? styles.tabActive : {}) }}>
          Convidados ({convidados.length})
        </button>
        <button onClick={() => setAba("fotos")} style={{ ...styles.tab, ...(aba === "fotos" ? styles.tabActive : {}) }}>
          Fotos ({fotos.length})
        </button>
      </div>

      <main style={styles.main}>
        {aba === "convidados" && (
          <div style={styles.listaConvidados}>
            {convidados.map(c => (
              <div key={c.id} style={styles.convidadoCard}>
                <Avatar
                  initials={c.nome_convidado?.charAt(0).toUpperCase() || "?"}
                  size={44}
                  color="#967BB6"
                  avatarUrl={c.avatar_url}
                />
                <div style={{ flex: 1 }}>
                  <div style={styles.convidadoNome}>{c.nome_convidado}</div>
                  <div style={styles.convidadoTel}>{formatTelefone(c.telefone)}</div>
                </div>
                <button onClick={() => abrirWhatsApp(c.telefone, c.nome_convidado)} style={styles.whatsappBtn}>
                  WhatsApp
                </button>
              </div>
            ))}
          </div>
        )}

        {aba === "fotos" && (
          <>
            <div style={styles.fotosToolbar}>
              <button onClick={selecionarTodas} style={styles.toolbarBtn}>
                {selecionadas.size === fotos.length && fotos.length > 0 ? "Desmarcar todas" : "Selecionar todas"}
              </button>
              <button onClick={baixarSelecionadas} disabled={baixando || selecionadas.size === 0} style={styles.toolbarBtnPrimary}>
                {baixando ? "Baixando..." : `Baixar selecionadas (${selecionadas.size})`}
              </button>
            </div>

            {fotos.length === 0 ? (
              <div style={styles.empty}>
                <p>Nenhuma foto publicada ainda</p>
              </div>
            ) : (
              <div style={styles.fotosGrid}>
                {fotos.map(foto => (
                  <div key={foto.id} style={styles.fotoCard}>
                    <label style={styles.fotoLabel}>
                      <input
                        type="checkbox"
                        checked={selecionadas.has(foto.id)}
                        onChange={() => toggleFoto(foto.id)}
                        style={styles.checkbox}
                      />
                      <img src={foto.image_url} alt={foto.caption || ""} style={styles.fotoImg} />
                    </label>
                    <div style={styles.fotoInfo}>
                      <span style={styles.fotoAutor}>{foto.profiles?.nome_convidado || "Convidado"}</span>
                      <span style={styles.fotoLikes}>💜 {foto.likes_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

const styles = {
  loading: { minHeight: "100vh", background: "#F5F0FF", display: "flex", alignItems: "center", justifyContent: "center" },
  header: { background: "rgba(245,240,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #EDE7F6", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 },
  logo: { width: 44, height: 44, borderRadius: "50%", border: "2px solid #967BB6", objectFit: "cover" },
  headerTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#4A3B5C", margin: 0 },
  headerSub: { fontSize: 12, color: "#9B8FAF", margin: 0 },
  logoutBtn: { marginLeft: "auto", background: "none", border: "1px solid #C3B1E1", color: "#967BB6", padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12 },
  tabs: { display: "flex", gap: 8, padding: "12px 16px", background: "#F5F0FF" },
  tab: { flex: 1, padding: "10px", border: "1px solid #EDE7F6", borderRadius: 12, background: "#fff", color: "#7A6A8F", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  tabActive: { background: "#967BB6", color: "#fff", borderColor: "#967BB6" },
  main: { maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" },
  listaConvidados: { display: "flex", flexDirection: "column", gap: 10, marginTop: 8 },
  convidadoCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 14, padding: 12, border: "1px solid #EDE7F6" },
  convidadoNome: { fontWeight: 600, color: "#4A3B5C", fontSize: 14 },
  convidadoTel: { fontSize: 12, color: "#9B8FAF", marginTop: 2 },
  whatsappBtn: { background: "#25D366", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  fotosToolbar: { display: "flex", gap: 10, margin: "12px 0", flexWrap: "wrap" },
  toolbarBtn: { background: "#fff", border: "1px solid #C3B1E1", color: "#967BB6", padding: "8px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer" },
  toolbarBtnPrimary: { background: "#967BB6", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  fotosGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  fotoCard: { background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #EDE7F6" },
  fotoLabel: { position: "relative", display: "block", cursor: "pointer" },
  checkbox: { position: "absolute", top: 8, left: 8, zIndex: 2, width: 18, height: 18, accentColor: "#967BB6" },
  fotoImg: { width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" },
  fotoInfo: { padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  fotoAutor: { fontSize: 11, color: "#4A3B5C", fontWeight: 500 },
  fotoLikes: { fontSize: 11, color: "#967BB6" },
  empty: { textAlign: "center", padding: 40, background: "#fff", borderRadius: 14, border: "1px solid #EDE7F6", color: "#7A6A8F" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(74,59,92,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  parabensCard: { background: "#fff", borderRadius: 24, padding: "40px 32px", textAlign: "center", maxWidth: 360, animation: "fadeInUp 0.5s ease" },
  parabensTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#4A3B5C", margin: "0 0 12px" },
  parabensText: { color: "#7A6A8F", fontSize: 15, lineHeight: 1.5, margin: "0 0 24px" },
  parabensBtn: { background: "#967BB6", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer" },
};
