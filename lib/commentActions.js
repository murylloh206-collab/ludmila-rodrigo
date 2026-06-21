async function requestComment(method, body) {
  const res = await fetch("/api/comments", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro ao processar comentário");
  }

  return data;
}

export async function createComment(userId, postId, text) {
  const data = await requestComment("POST", { userId, postId, text });
  return data.comment;
}

export async function updateComment(userId, commentId, text) {
  const data = await requestComment("PATCH", { userId, commentId, text });
  return data.comment;
}

export async function deleteComment(userId, commentId) {
  await requestComment("DELETE", { userId, commentId });
}
