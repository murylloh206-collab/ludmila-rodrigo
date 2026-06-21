import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "./env";

function getJwtRole(key) {
  try {
    const payload = key.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
    return decoded.role || null;
  } catch {
    return null;
  }
}

function assertServiceRoleKey(serviceKey) {
  const anonKey = getSupabaseAnonKey();

  if (anonKey && serviceKey === anonKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY está igual à chave anon. No Supabase, use Settings > API > service_role."
    );
  }

  const role = getJwtRole(serviceKey);
  if (role && role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY inválida (role "${role}"). Use a service_role key do Supabase.`
    );
  }
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();

  if (!url || !serviceKey) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor (Vercel > Settings > Environment Variables)."
    );
  }

  assertServiceRoleKey(serviceKey);

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isRlsError(message) {
  return typeof message === "string" && message.includes("row-level security");
}

export function formatServerSupabaseError(error) {
  if (isRlsError(error?.message || error)) {
    return (
      "Permissão negada no Supabase (RLS). Confira se SUPABASE_SERVICE_ROLE_KEY está configurada na Vercel " +
      "e execute o script supabase/fix-rls.sql no SQL Editor do Supabase."
    );
  }

  return error?.message || "Erro interno no Supabase";
}
