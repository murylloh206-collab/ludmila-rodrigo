import { useState, useEffect } from "react";

export default function Countdown({ targetDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  
  const pad = n => String(n).padStart(2, "0");
  
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[["days", "D"], ["hours", "H"], ["minutes", "M"]].map(([key, label]) => (
        <div key={key} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#967BB6", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>
            {pad(time[key])}
          </div>
          <div style={{ fontSize: 9, color: "#9B8FAF", letterSpacing: 1 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
