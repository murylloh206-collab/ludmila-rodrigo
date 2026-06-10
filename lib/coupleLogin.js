export async function loginCouple({ telefone, nome } = {}) {
  const res = await fetch("/api/couple-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telefone, nome }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro ao entrar como casal");
  }

  return data.profile;
}
