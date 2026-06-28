// ragSearch.js
// -----------------------------------------------------------------------------
// A small Retrieval-Augmented Generation (RAG) engine for wellness resources.
//
// Pipeline:
//   1. RETRIEVE - turn every resource and the user's query into embedding
//      vectors (Google text-embedding-004), then rank resources by COSINE
//      SIMILARITY to the query. This finds semantically relevant items even when
//      the user's words don't literally match the resource text.
//   2. (AUGMENTED) GENERATION happens in the page: the top matches are handed to
//      Gemini to write a short, personalised explanation.
//
// Resilience: corpus vectors are cached in localStorage (computed once). If the
// embeddings API is unavailable, everything falls back to a keyword scorer so the
// finder still works.
//
// NOTE: runs client-side with VITE_GEMINI_API_KEY, matching the app's other
// Gemini calls. For production, proxy embedding calls through the backend.
// -----------------------------------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resources } from "../resources";

const EMBED_MODEL = "text-embedding-004";
const CACHE_KEY = "mw_resource_embeddings_v1";

// Flatten the mood-keyed resources object into a single searchable list.
export function buildCorpus() {
  const list = [];
  for (const [mood, items] of Object.entries(resources || {})) {
    (items || []).forEach((r, i) => {
      list.push({
        id: `${mood}-${i}`,
        mood,
        title: r.title,
        type: r.type,
        url: r.url,
        description: r.description,
        tags: r.tags || [],
        whyHelpful: r.whyHelpful || "",
        // the text we actually embed / search over
        doc: [r.title, r.description, (r.tags || []).join(" "), r.whyHelpful, mood]
          .filter(Boolean)
          .join(". "),
      });
    });
  }
  return list;
}

function getClient() {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

// Embed a single piece of text -> number[] (or null on failure).
export async function embedText(text) {
  try {
    const genAI = getClient();
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: EMBED_MODEL });
    const res = await model.embedContent(String(text || "").slice(0, 2000));
    return res?.embedding?.values || null;
  } catch (e) {
    console.warn("embedText failed:", e?.message);
    return null;
  }
}

// Embed the whole corpus in one batched call (falls back to per-item).
export async function embedCorpus(corpus) {
  const genAI = getClient();
  if (!genAI) return null;
  const model = genAI.getGenerativeModel({ model: EMBED_MODEL });
  try {
    const res = await model.batchEmbedContents({
      requests: corpus.map((c) => ({ content: { parts: [{ text: c.doc.slice(0, 2000) }] } })),
    });
    const embs = res?.embeddings;
    if (embs && embs.length === corpus.length) return embs.map((e) => e.values);
    throw new Error("batch size mismatch");
  } catch (e) {
    console.warn("batchEmbed failed, trying per-item:", e?.message);
    const out = [];
    for (const c of corpus) {
      const v = await embedText(c.doc);
      if (!v) return null;
      out.push(v);
    }
    return out;
  }
}

// Load corpus vectors from cache, or compute + cache them once.
export async function getCorpusVectors(corpus) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && cached.n === corpus.length && Array.isArray(cached.vectors)) {
      return cached.vectors;
    }
  } catch (_) {}
  const vectors = await embedCorpus(corpus);
  if (vectors) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ n: corpus.length, vectors }));
    } catch (_) {}
  }
  return vectors;
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

// Plain keyword overlap score — the fallback when embeddings aren't available.
function keywordScore(query, item) {
  const q = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const hay = item.doc.toLowerCase();
  let s = 0;
  q.forEach((w) => { if (hay.includes(w)) s += 1; });
  return s / (q.length || 1);
}

/**
 * Main entry: rank resources for a query.
 * @returns {Promise<{mode:'semantic'|'keyword', results:Array}>}
 */
export async function searchResources(query, topK = 5) {
  const corpus = buildCorpus();
  const queryVec = await embedText(query);

  if (queryVec) {
    const vectors = await getCorpusVectors(corpus);
    if (vectors) {
      const scored = corpus.map((item, i) => ({ ...item, score: cosineSimilarity(queryVec, vectors[i]) }));
      scored.sort((a, b) => b.score - a.score);
      return { mode: "semantic", results: scored.slice(0, topK) };
    }
  }

  // Fallback: keyword search.
  const scored = corpus
    .map((item) => ({ ...item, score: keywordScore(query, item) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return { mode: "keyword", results: scored.slice(0, topK) };
}

// The "generation" half of RAG: a short, warm intro grounded in the top hits.
export async function generateIntro(query, topResults) {
  try {
    const genAI = getClient();
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const titles = topResults.map((r) => `- ${r.title} (${r.type})`).join("\n");
    const prompt = `A user searched our wellness library for: "${query}".
These are the top matching resources:
${titles}

Write 1-2 warm, encouraging sentences telling the user why these picks may help them.
Plain text only, no markdown, no lists.`;
    const res = await model.generateContent(prompt);
    return (await res.response).text().trim();
  } catch (e) {
    console.warn("generateIntro failed:", e?.message);
    return null;
  }
}
