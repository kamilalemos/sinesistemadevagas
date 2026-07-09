// Helpers para o novo modelo de Período baseado em datas (ISO yyyy-mm-dd).

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Converte 'yyyy-mm-dd' em Date local (evita off-by-one do fuso). */
export function parseISODate(iso?: string | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Formata Date → 'yyyy-mm-dd' local. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Formata 'yyyy-mm-dd' → 'DD/MM/YYYY'. */
export function formatDateBR(iso?: string | null): string {
  const d = parseISODate(iso);
  if (!d) return "";
  return d.toLocaleDateString("pt-BR");
}

/** Gera nome legível: "Semana de 10 a 17 de Julho" (ou entre meses/anos). */
export function formatPeriodoAuto(inicio?: string | null, fim?: string | null): string {
  const di = parseISODate(inicio);
  const df = parseISODate(fim);
  if (!di || !df) return "";

  const diaI = di.getDate();
  const diaF = df.getDate();
  const mesI = MESES_PT[di.getMonth()];
  const mesF = MESES_PT[df.getMonth()];
  const anoI = di.getFullYear();
  const anoF = df.getFullYear();

  if (anoI === anoF && di.getMonth() === df.getMonth()) {
    return `Semana de ${diaI} a ${diaF} de ${mesI}`;
  }
  if (anoI === anoF) {
    return `De ${diaI} de ${mesI} a ${diaF} de ${mesF}`;
  }
  return `${diaI}/${String(di.getMonth() + 1).padStart(2, "0")}/${anoI} a ${diaF}/${String(df.getMonth() + 1).padStart(2, "0")}/${anoF}`;
}

/** Retorna número de dias entre hoje e a data final (0 se hoje é o último dia, negativo se expirado). */
export function diasRestantes(fim?: string | null): number | null {
  const df = parseISODate(fim);
  if (!df) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  df.setHours(0, 0, 0, 0);
  const diff = Math.round((df.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

/** Valida par de datas. Retorna null se ok, mensagem se inválido. */
export function validarDatasPeriodo(inicio?: string | null, fim?: string | null): string | null {
  const di = parseISODate(inicio);
  const df = parseISODate(fim);
  if (!di || !df) return "Informe a data inicial e a data final.";
  if (df.getTime() < di.getTime()) return "A data final deve ser maior que a data inicial.";
  return null;
}

/** Rótulo final do período: usa nome informado; se vazio, gera a partir das datas. */
export function resolvePeriodoLabel(
  nome: string | undefined | null,
  inicio?: string | null,
  fim?: string | null,
): string {
  const trimmed = (nome || "").trim();
  if (trimmed) return trimmed;
  const auto = formatPeriodoAuto(inicio, fim);
  return auto || "";
}
