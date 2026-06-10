import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { userId, image_url, caption } = req.body || {};

  if (!userId || !image_url) {
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

    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        image_url,
        caption: caption || "",
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ post: newPost });
  } catch (error) {
    console.error("Erro ao criar post:", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao publicar foto",
    });
  }
}
