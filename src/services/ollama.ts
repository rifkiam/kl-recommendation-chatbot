import type { RankedHit } from "../chroma/queryRank";

function ollamaBaseUrl(): string {
  const u = process.env.OLLAMA_URL?.trim();
  return u && u.length > 0 ? u.replace(/\/$/, "") : "http://127.0.0.1:11434";
}

export function ollamaChatModel(): string {
  const m = process.env.OLLAMA_CHAT_MODEL?.trim();
  return m && m.length > 0 ? m : "llama3.2";
}

function formatContextBlock(hits: RankedHit[]): string {
  if (hits.length === 0) {
    return "(Tidak ada dokumen relevan yang ditemukan.)";
  }
  const arr = hits
    .map((h, i) => {
      const body = (h.document ?? "").trim() || "(kosong)";
      const labelFor = (h.metadata?.for ?? "").toString().trim() || "(kosong)";
      return `${i + 1}. ${body}\nUntuk: ${labelFor}\n`;
    })
    .join("\n\n---\n\n");

  return arr;
}

/**
 * Calls Ollama `/api/chat` (non-streaming) to turn retrieved chunks into a natural reply.
 */
export async function synthesizeAnswerWithOllama(
  userMessage: string,
  hits: RankedHit[]
): Promise<string> {
  const base = ollamaBaseUrl();
  const model = ollamaChatModel();
  const context = formatContextBlock(hits);

  const system = `Namamu adalah Kila. Anda adalah asisten yang menjawab pertanyaan pengguna berdasarkan HANYA konteks yang diberikan.
Aturan:
- Jawab dalam bahasa yang sama dengan pertanyaan pengguna (biasanya Bahasa Indonesia).
- Jika konteks tidak cukup, katakan dengan jujur bahwa informasinya tidak ada dalam basis pengetahuan; jangan mengarang fakta.
- Ringkas dan natural seperti percakapan chat; hindari daftar mentah kecuali diminta.
- Jangan sekalipun menyebut "konteks", "chunk", atau "vector database".
- Jangan gunakan Markdown dalam bentuk apa pun.
- Jangan gunakan tanda bintang (*), heading, bullet list, atau formatting tebal.
- Jangan membuat label bagian seperti "Rekomendasi:", "Elaborasi:", atau format sejenis.
- Data sudah diurutkan berdasarkan relevansi dari paling relevan hingga kurang relevan.
- Pertimbangkan relevansi field 'for' pada tiap item sebelum menjawab.`;

  const user = `Konteks dari basis pengetahuan internal:\n\n${context}\n\n---\n\nPertanyaan pengguna: ${userMessage}`;

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const rawText = await res.text();
  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}: ${rawText.slice(0, 500)}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(rawText) as { message?: { content?: string } };
  } catch {
    throw new Error("Ollama: response is not valid JSON");
  }

  const content =
    typeof json === "object" &&
    json !== null &&
    "message" in json &&
    typeof (json as { message?: unknown }).message === "object" &&
    (json as { message?: { content?: unknown } }).message !== null
      ? (json as { message: { content?: unknown } }).message.content
      : undefined;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Ollama: empty or missing message.content");
  }

  return content.trim();
}
