export async function uploadPhoto(userId, imageData, path) {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, imageData, path }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro ao enviar foto");
  }

  return data.publicUrl;
}
