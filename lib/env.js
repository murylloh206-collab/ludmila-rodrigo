function firstDefined(...values) {
  return values.find((value) => value != null && value !== "");
}

export function getSupabaseUrl() {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_URL
  );
}

export function getSupabaseAnonKey() {
  return firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.VITE_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY
  );
}

export function getSupabaseServiceRoleKey() {
  return firstDefined(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SERVICE_KEY
  );
}
