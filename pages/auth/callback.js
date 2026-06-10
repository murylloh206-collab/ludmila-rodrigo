import { useEffect } from "react";
import { useRouter } from "next/router";
import { getStoredUser, getRedirectPath } from "../../lib/auth";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    if (stored?.nome_convidado) {
      router.replace(getRedirectPath(stored.nome_convidado, stored.telefone));
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #F5F0FF 0%, #E8E0F5 100%)",
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💜</div>
        <p style={{ fontSize: 18, color: "#4A3B5C" }}>Redirecionando...</p>
      </div>
    </div>
  );
}
