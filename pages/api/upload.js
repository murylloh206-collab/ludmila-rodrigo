import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

function parseDataUrl(imageData) {
  const match = imageData.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;

  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function isAllowedPath(userId, path) {
  return path.startsWith(`${userId}/`) || path.startsWith(`avatars/${userId}/`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { userId, imageData, path } = req.body || {};

  if (!userId || !imageData || !path) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  if (!isAllowedPath(userId, path)) {
    return res.status(403).json({ error: "Caminho não permitido" });
  }

  const parsed = parseDataUrl(imageData);
  if (!parsed) {
    return res.status(400).json({ error: "Imagem inválida" });
  }

  if (parsed.buffer.length > 10 * 1024 * 1024) {
    return res.status(400).json({ error: "Imagem muito grande (máx. 10MB)" });
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

    const { error: uploadError } = await supabase.storage
      .from("event-photos")
      .upload(path, parsed.buffer, {
        contentType: parsed.mime,
        upsert: path.startsWith("avatars/"),
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("event-photos")
      .getPublicUrl(path);

    return res.status(200).json({ publicUrl });
  } catch (error) {
    console.error("Erro no upload:", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao enviar foto",
    });
  }
}
