export const USER_STORAGE_KEY = "user_lr";

export const COUPLE_MEMBERS = [
  { nome: "Ludmila Zanon", telefone: "3588740000" },
  { nome: "Rodrigo Zanon", telefone: "3588055998" },
];

export function normalizePhone(value) {
  return (value || "").replace(/\D/g, "");
}

export function normalizeName(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getCoupleMemberByPhone(telefone) {
  const phone = normalizePhone(telefone);
  return COUPLE_MEMBERS.find((member) => member.telefone === phone) || null;
}

export function getCoupleMemberByName(nome) {
  const normalized = normalizeName(nome);
  return (
    COUPLE_MEMBERS.find((member) => normalizeName(member.nome) === normalized) ||
    null
  );
}

export function isCasal(nome, telefone) {
  if (getCoupleMemberByPhone(telefone)) return true;
  if (getCoupleMemberByName(nome)) return true;

  const normalized = normalizeName(nome);
  return (
    normalized === "ludmila zanon" ||
    normalized === "rodrigo zanon" ||
    normalized === "ludmila" ||
    normalized === "rodrigo"
  );
}

export function getRedirectPath(nome, telefone) {
  if (isCasal(nome, telefone)) return "/casal";
  return "/app";
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export async function loadProfile(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data;
}
