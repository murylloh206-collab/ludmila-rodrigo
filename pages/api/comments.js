import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();

  if (req.method === "POST") {
    const { userId, postId, text } = req.body || {};

    if (!userId || !postId || !text?.trim()) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, nome_convidado, avatar_url")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        return res.status(403).json({ error: "Usuário não encontrado" });
      }

      const { data: comment, error: insertError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: userId,
          text: text.trim(),
        })
        .select("*")
        .single();

      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      return res.status(200).json({
        comment: {
          ...comment,
          author: profile.nome_convidado,
          avatar_url: profile.avatar_url,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Erro ao comentar" });
    }
  }

  if (req.method === "PATCH") {
    const { userId, commentId, text } = req.body || {};

    if (!userId || !commentId || !text?.trim()) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    try {
      const { data: existing, error: findError } = await supabase
        .from("comments")
        .select("id, user_id")
        .eq("id", commentId)
        .single();

      if (findError || !existing) {
        return res.status(404).json({ error: "Comentário não encontrado" });
      }

      if (existing.user_id !== userId) {
        return res.status(403).json({ error: "Sem permissão para editar" });
      }

      const { data: comment, error: updateError } = await supabase
        .from("comments")
        .update({ text: text.trim() })
        .eq("id", commentId)
        .select("*")
        .single();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json({ comment });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Erro ao editar" });
    }
  }

  if (req.method === "DELETE") {
    const { userId, commentId } = req.body || {};

    if (!userId || !commentId) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    try {
      const { data: existing, error: findError } = await supabase
        .from("comments")
        .select("id, user_id")
        .eq("id", commentId)
        .single();

      if (findError || !existing) {
        return res.status(404).json({ error: "Comentário não encontrado" });
      }

      if (existing.user_id !== userId) {
        return res.status(403).json({ error: "Sem permissão para excluir" });
      }

      const { error: deleteError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Erro ao excluir" });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
