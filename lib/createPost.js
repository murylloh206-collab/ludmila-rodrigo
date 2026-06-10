export async function createPost(userId, image_url, caption) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, image_url, caption: caption || "" }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro ao publicar foto");
  }

  return data.post;
}
