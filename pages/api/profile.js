import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { userId, avatar_url } = req.body || {};

  if (!userId || !avatar_url) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ error: "Usuário não encontrado" });
    }

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ profile: updated });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao atualizar perfil",
    });
  }
}
