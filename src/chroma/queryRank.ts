function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export const RETRIEVAL_POOL_SIZE = readPositiveInt("CHAT_RETRIEVAL_POOL", 40);
export const RESPONSE_TOP_N = readPositiveInt("CHAT_RESPONSE_TOP", 5);

export type QueryIntent =
  | "services_catalog"
  | "contact"
  | "location"
  | "pricing"
  | "general";

export type RankedHit = {
  id: string;
  document: string | null;
  distance: number | null;
  metadata: Record<string, string | number | boolean> | null;
};

type ChromaQueryBatch = {
  ids: string[][];
  documents: (string | null)[][];
  distances: (number | null)[][] | null;
  metadatas: (Record<string, string | number | boolean> | null)[][] | null;
};

const SERVICES_CATALOG =
  /apa\s+saja|layanan\s+apa|jasa\s+apa|daftar\s+layanan|daftar\s+jasa|jenis\s+layanan|macam\s+layanan|macam\s+jasa|yang\s+disediakan|yang\s+ditawarkan|layanan\s+yang|jasa\s+yang|pilihan\s+layanan|pilihan\s+jasa/i;

export function detectQueryIntent(message: string): QueryIntent {
  const q = message.trim();
  if (/hubungi|kontak|email|whatsapp|wa\b|telepon|telpon|nomer|nomor/i.test(q)) {
    return "contact";
  }
  if (/di\s+mana|alamat|lokasi|kantor|cabang|beralamat/i.test(q)) {
    return "location";
  }
  if (/biaya|harga|tarif|berapa\b|flat\s+fee|persentase\s+gaji/i.test(q)) {
    return "pricing";
  }
  if (SERVICES_CATALOG.test(q)) {
    return "services_catalog";
  }
  return "general";
}

function topicFromMetadata(
  meta: Record<string, string | number | boolean> | null
): string | undefined {
  if (!meta) return undefined;
  const t = meta.topic;
  return typeof t === "string" ? t : undefined;
}

/** Lower = better after adjustment. */
function intentDistanceAdjustment(
  intent: QueryIntent,
  topic: string | undefined
): number {
  if (intent === "services_catalog") {
    if (topic === "services") return -0.14;
    if (topic === "contact") return 0.22;
    if (topic === "company_profile") return 0.06;
    if (topic === "operations") return 0.05;
    return 0;
  }
  if (intent === "contact") {
    if (topic === "contact") return -0.18;
    return 0;
  }
  if (intent === "location") {
    if (topic === "location") return -0.18;
    return 0;
  }
  if (intent === "pricing") {
    if (topic === "pricing") return -0.18;
    if (topic === "policy") return 0.04;
    return 0;
  }
  return 0;
}

function sortKey(distance: number | null, adjustment: number): number {
  const base = distance ?? Number.POSITIVE_INFINITY;
  return base + adjustment;
}

export function rankQueryHits(
  batch: ChromaQueryBatch,
  message: string,
  topN: number = RESPONSE_TOP_N
): RankedHit[] {
  const intent = detectQueryIntent(message);
  const ids = batch.ids[0] ?? [];
  const docs = batch.documents[0] ?? [];
  const dists = batch.distances?.[0] ?? [];
  const metas = batch.metadatas?.[0] ?? [];

  const hits: RankedHit[] = ids.map((id, i) => ({
    id,
    document: docs[i] ?? null,
    distance: dists[i] ?? null,
    metadata: metas[i] ?? null,
  }));

  hits.sort((a, b) => {
    const ta = topicFromMetadata(a.metadata);
    const tb = topicFromMetadata(b.metadata);
    const ka = sortKey(a.distance, intentDistanceAdjustment(intent, ta));
    const kb = sortKey(b.distance, intentDistanceAdjustment(intent, tb));
    return ka - kb;
  });

  return hits.slice(0, topN);
}
