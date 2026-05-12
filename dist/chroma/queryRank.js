"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESPONSE_TOP_N = exports.RETRIEVAL_POOL_SIZE = void 0;
exports.detectQueryIntent = detectQueryIntent;
exports.rankQueryHits = rankQueryHits;
function readPositiveInt(name, fallback) {
    const raw = process.env[name]?.trim();
    if (!raw)
        return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
exports.RETRIEVAL_POOL_SIZE = readPositiveInt("CHAT_RETRIEVAL_POOL", 40);
exports.RESPONSE_TOP_N = readPositiveInt("CHAT_RESPONSE_TOP", 5);
const SERVICES_CATALOG = /apa\s+saja|layanan\s+apa|jasa\s+apa|daftar\s+layanan|daftar\s+jasa|jenis\s+layanan|macam\s+layanan|macam\s+jasa|yang\s+disediakan|yang\s+ditawarkan|layanan\s+yang|jasa\s+yang|pilihan\s+layanan|pilihan\s+jasa/i;
function detectQueryIntent(message) {
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
function topicFromMetadata(meta) {
    if (!meta)
        return undefined;
    const t = meta.topic;
    return typeof t === "string" ? t : undefined;
}
/** Lower = better after adjustment. */
function intentDistanceAdjustment(intent, topic) {
    if (intent === "services_catalog") {
        if (topic === "services")
            return -0.14;
        if (topic === "contact")
            return 0.22;
        if (topic === "company_profile")
            return 0.06;
        if (topic === "operations")
            return 0.05;
        return 0;
    }
    if (intent === "contact") {
        if (topic === "contact")
            return -0.18;
        return 0;
    }
    if (intent === "location") {
        if (topic === "location")
            return -0.18;
        return 0;
    }
    if (intent === "pricing") {
        if (topic === "pricing")
            return -0.18;
        if (topic === "policy")
            return 0.04;
        return 0;
    }
    return 0;
}
function sortKey(distance, adjustment) {
    const base = distance ?? Number.POSITIVE_INFINITY;
    return base + adjustment;
}
function rankQueryHits(batch, message, topN = exports.RESPONSE_TOP_N) {
    const intent = detectQueryIntent(message);
    const ids = batch.ids[0] ?? [];
    const docs = batch.documents[0] ?? [];
    const dists = batch.distances?.[0] ?? [];
    const metas = batch.metadatas?.[0] ?? [];
    const hits = ids.map((id, i) => ({
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
