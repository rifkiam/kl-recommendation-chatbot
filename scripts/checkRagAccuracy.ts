/**
 * CI / local gate: calls retrieveRankedChunks (same path as POST /api/chat).
 */
import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import { RESPONSE_TOP_N } from "../src/chroma/queryRank";
import { retrieveRankedChunks } from "../src/services/chat";

type GoldenCase = {
  id?: string;
  query: string;
  anyOfIds: string[];
};

type GoldenFile = {
  threshold?: number;
  description?: string;
  cases: GoldenCase[];
};

function readGolden(): GoldenFile {
  const p = path.join(__dirname, "rag-golden.json");
  const raw = fs.readFileSync(p, "utf-8");
  const data = JSON.parse(raw) as GoldenFile;
  if (!Array.isArray(data.cases) || data.cases.length === 0) {
    throw new Error("rag-golden.json: missing or empty cases[]");
  }
  for (const c of data.cases) {
    if (!c.query || !Array.isArray(c.anyOfIds) || c.anyOfIds.length === 0) {
      throw new Error(`Invalid case: ${JSON.stringify(c)}`);
    }
  }
  return data;
}

function envNumber(name: string, fallback: number): number {
  const v = process.env[name]?.trim();
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

async function main(): Promise<void> {
  const golden = readGolden();
  const threshold =
    envNumber("RAG_ACCURACY_MIN", golden.threshold ?? 0.75) ?? 0.75;
  const topN = envNumber("RAG_EVAL_TOP_N", RESPONSE_TOP_N);

  if (!process.env.CHROMA_URL?.trim()) {
    process.env.CHROMA_URL = "http://127.0.0.1:8000";
  }

  let passed = 0;
  const rows: string[] = [];

  for (const c of golden.cases) {
    const ranked = await retrieveRankedChunks(c.query, { topN });
    const gotIds = ranked.map((h) => h.id);
    const ok = c.anyOfIds.some((id) => gotIds.includes(id));
    if (ok) passed += 1;
    const label = c.id ?? c.query.slice(0, 40);
    rows.push(
      `${ok ? "PASS" : "FAIL"}  ${label}  |  expect one of [${c.anyOfIds.join(", ")}]  |  got [${gotIds.join(", ")}]`
    );
  }

  const rate = passed / golden.cases.length;
  console.log("--- RAG golden retrieval ---");
  if (golden.description) console.log(golden.description);
  console.log(`Cases: ${golden.cases.length}, passed: ${passed}, rate: ${(rate * 100).toFixed(1)}%, min: ${(threshold * 100).toFixed(0)}%`);
  rows.forEach((r) => console.log(r));

  if (rate + 1e-9 < threshold) {
    console.error(
      `\nAccuracy ${(rate * 100).toFixed(1)}% is below required ${(threshold * 100).toFixed(0)}%.`
    );
    process.exit(1);
  }
  console.log("\nRAG accuracy check OK.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
