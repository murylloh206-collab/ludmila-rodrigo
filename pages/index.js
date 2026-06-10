import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import FloatingHearts from "../components/FloatingHearts";
import {
  getRedirectPath,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  loadProfile,
  getCoupleMemberByPhone,
  getCoupleMemberByName,
  normalizePhone,
} from "../lib/auth";
import { loginCouple } from "../lib/coupleLogin";

export default function Login() {
  const [fase, setFase] = useState("telefone");
  const [telefone, setTelefone] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const verificarSessao = async () => {
      const stored = getStoredUser();
      if (!stored?.id) return;

      const profile = await loadProfile(supabase, stored.id);
      if (profile) {
        setStoredUser(profile);
        window.location.href = getRedirectPath(profile.nome_convidado, profile.telefone);
      } else {
        clearStoredUser();
      }
    };
    verificarSessao();
  }, []);

  function formatTelefone(value) {
    const apenasNumeros = value.replace(/\D/g, "");
    if (apenasNumeros.length <= 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  async function entrarComPerfil(profile) {
    setStoredUser(profile);
    window.location.href = getRedirectPath(profile.nome_convidado, profile.telefone);
  }

  async function entrarComoCasal(member) {
    setLoading(true);
    setMensagem("Entrando...");

    try {
      const profile = await loginCouple({
        telefone: member.telefone,
        nome: member.nome,
      });
      await entrarComPerfil(profile);
    } catch (error) {
      console.error("Erro ao entrar como casal:", error);
      setMensagem("Erro: " + error.message);
      setLoading(false);
    }
  }

  async function verificarTelefone() {
    const entrada = telefone.trim();
    const telefoneLimpo = normalizePhone(entrada);
    const coupleByName = getCoupleMemberByName(entrada);

    if (coupleByName && telefoneLimpo.length < 10) {
      await entrarComoCasal(coupleByName);
      return;
    }

    if (telefoneLimpo.length < 10) {
      setMensagem("Digite um número válido (com DDD)");
      return;
    }

    setLoading(true);
    setMensagem("Verificando...");

    const coupleMember = getCoupleMemberByPhone(telefoneLimpo);
    if (coupleMember) {
      await entrarComoCasal(coupleMember);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("telefone", telefoneLimpo)
      .maybeSingle();

    if (data) {
      await entrarComPerfil(data);
    } else {
      setFase("nome");
    }

    setLoading(false);
  }

  async function salvarNome() {
    if (!nome.trim()) {
      setMensagem("Digite seu nome");
      return;
    }

    setLoading(true);
    setMensagem("Salvando...");

    const telefoneLimpo = normalizePhone(telefone);
    const coupleByPhone = getCoupleMemberByPhone(telefoneLimpo);
    const coupleByName = getCoupleMemberByName(nome);

    if (coupleByPhone) {
      await entrarComoCasal(coupleByPhone);
      return;
    }

    if (coupleByName) {
      await entrarComoCasal(coupleByName);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        telefone: telefoneLimpo,
        nome_convidado: nome.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erro detalhado:", error);
      setMensagem("Erro: " + error.message);
    } else if (data) {
      await entrarComPerfil(data);
    }

    setLoading(false);
  }

  if (fase === "telefone") {
    return (
      <div style={styles.container}>
        <FloatingHearts />
        <div style={styles.card}>
          <div style={styles.logoArea}>
            <h1 style={styles.titulo}>💜 L&R</h1>
            <p style={styles.subtitulo}>Renovação dos Votos</p>
            <p style={styles.data}>15 de Junho de 2026</p>
          </div>

          <input
            type="text"
            placeholder="📱 Telefone ou nome completo do casal"
            style={styles.input}
            value={telefone}
            onChange={(e) => {
              const value = e.target.value;
              if (/[a-zA-ZÀ-ÿ]/.test(value)) {
                setTelefone(value);
              } else {
                setTelefone(formatTelefone(value));
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && verificarTelefone()}
          />

          <button
            style={styles.botao}
            onClick={verificarTelefone}
            disabled={loading}
          >
            {loading ? "Verificando..." : "💜 Entrar no Evento"}
          </button>

          <p style={styles.ajuda}>
           
          </p>
          {mensagem && <p style={styles.mensagem}>{mensagem}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <FloatingHearts />
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <h1 style={styles.titulo}>💜 L&R</h1>
          <p style={styles.subtitulo}>Renovação dos Votos</p>
          <p style={styles.data}>Como você quer aparecer?</p>
        </div>

        <input
          type="text"
          placeholder="Ex: Ana Silva"
          style={styles.input}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && salvarNome()}
        />

        <button
          style={styles.botao}
          onClick={salvarNome}
          disabled={loading}
        >
          {loading ? "Salvando..." : "💜 Começar"}
        </button>

        {mensagem && <p style={styles.mensagem}>{mensagem}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #F5F0FF 0%, #E8E0F5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  card: {
    background: "white",
    borderRadius: 24,
    padding: 40,
    width: "100%",
    maxWidth: 400,
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(150,123,182,0.15)",
    position: "relative",
    zIndex: 1,
  },
  logoArea: {
    marginBottom: 30,
  },
  titulo: {
    fontSize: 36,
    color: "#4A3B5C",
    marginBottom: 5,
    fontFamily: "'Cormorant Garamond', serif",
  },
  subtitulo: {
    color: "#967BB6",
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  data: {
    color: "#9B8FAF",
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 16,
    border: "2px solid #C3B1E1",
    borderRadius: 12,
    marginBottom: 15,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  botao: {
    width: "100%",
    padding: "14px",
    fontSize: 16,
    fontWeight: "bold",
    background: "#967BB6",
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  ajuda: {
    fontSize: 12,
    color: "#9B8FAF",
    marginTop: 15,
  },
  mensagem: {
    marginTop: 15,
    fontSize: 13,
    color: "#e74c3c",
  },
};
