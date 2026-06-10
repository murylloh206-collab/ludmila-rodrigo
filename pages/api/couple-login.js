import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

const COUPLE_MEMBERS = [
  { nome: "Ludmila Zanon", telefone: "3588740000" },
  { nome: "Rodrigo Zanon", telefone: "3588055998" },
];

function normalizePhone(value) {
  return (value || "").replace(/\D/g, "");
}

function normalizeName(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findCoupleMember({ telefone, nome }) {
  const phone = normalizePhone(telefone);
  if (phone) {
    const byPhone = COUPLE_MEMBERS.find((member) => member.telefone === phone);
    if (byPhone) return byPhone;
  }

  const normalizedName = normalizeName(nome);
  return (
    COUPLE_MEMBERS.find(
      (member) => normalizeName(member.nome) === normalizedName
    ) || null
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { telefone, nome } = req.body || {};
  const member = findCoupleMember({ telefone, nome });

  if (!member) {
    return res.status(403).json({ error: "Acesso negado para o casal" });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("telefone", member.telefone)
      .maybeSingle();

    if (existing) {
      if (normalizeName(existing.nome_convidado) !== normalizeName(member.nome)) {
        const { data: updated, error: updateError } = await supabase
          .from("profiles")
          .update({ nome_convidado: member.nome })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateError) {
          return res.status(500).json({ error: updateError.message });
        }

        return res.status(200).json({ profile: updated });
      }

      return res.status(200).json({ profile: existing });
    }

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({
        telefone: member.telefone,
        nome_convidado: member.nome,
      })
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ profile: created });
  } catch (error) {
    console.error("Erro no login do casal:", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao entrar como casal",
    });
  }
}
