export default function FloatingHearts() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 8.3) % 100}%`,
          animationName: "floatHeart",
          animationDuration: `${8 + (i % 5) * 2}s`,
          animationDelay: `${i * 1.2}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          fontSize: `${12 + (i % 3) * 6}px`,
          opacity: 0.07,
          bottom: "-20px",
        }}>💜</div>
      ))}
    </div>
  );
}
