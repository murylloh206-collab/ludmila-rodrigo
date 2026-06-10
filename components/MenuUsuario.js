import { useState, useRef, useEffect } from "react";
import Avatar from "./Avatar";

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function MenuUsuario({ user, onLogout, darkMode, onToggleDarkMode }) {
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuBg = darkMode ? "#2a2a3e" : "white";
  const textColor = darkMode ? "#E6E6FA" : "#4A3B5C";
  const borderColor = darkMode ? "#3a3a4e" : "#EDE7F6";

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <div
        onClick={() => setAberto(!aberto)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: darkMode ? "rgba(200,200,255,0.1)" : "rgba(118, 75, 162, 0.1)",
          padding: "4px 8px 4px 4px",
          borderRadius: 40,
          cursor: "pointer",
        }}
      >
        <Avatar
          initials={user?.nome_convidado?.charAt(0).toUpperCase() || "?"}
          size={36}
          color="#967BB6"
          avatarUrl={user?.avatar_url}
        />
        <span style={{ fontWeight: 500, color: textColor, fontSize: 13 }}>
          {user?.nome_convidado || "Convidado"}
        </span>
        <span style={{ fontSize: 10, color: "#967BB6" }}>▼</span>
      </div>

      {aberto && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          background: menuBg,
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          minWidth: 160,
          overflow: "hidden",
          zIndex: 1000,
          border: "1px solid " + borderColor,
        }}>
          <button
            onClick={onToggleDarkMode}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "none",
              background: menuBg,
              textAlign: "left",
              cursor: "pointer",
              fontSize: 13,
              color: textColor,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {darkMode ? <IconSun /> : <IconMoon />}
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
          <button
            onClick={() => {
              setAberto(false);
              window.location.href = "/perfil";
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "none",
              background: menuBg,
              textAlign: "left",
              cursor: "pointer",
              fontSize: 13,
              color: textColor,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <IconUser /> Meu Perfil
          </button>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "none",
              borderTop: "1px solid " + borderColor,
              background: menuBg,
              textAlign: "left",
              cursor: "pointer",
              fontSize: 13,
              color: "#e74c3c",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <IconLogout /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
