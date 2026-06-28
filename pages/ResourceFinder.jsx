import React, { useState } from "react";
import { Search, Sparkles, Loader2, Video, FileText, Headphones, BookOpen, ArrowUpRight, Wand2 } from "lucide-react";
import { searchResources, generateIntro } from "../src/utils/ragSearch";

/**
 * ResourceFinder
 * A semantic ("RAG") search over the wellness resource library. The user
 * describes how they feel in their own words; we embed it, rank resources by
 * cosine similarity, and let Gemini write a short personalised intro.
 */
const typeMeta = {
  video: { icon: Video, label: "Video", color: "#B0413E" },
  article: { icon: FileText, label: "Article", color: "#2D7D6F" },
  podcast: { icon: Headphones, label: "Podcast", color: "#7C5BA6" },
  book: { icon: BookOpen, label: "Book", color: "#C9871E" },
};

const examples = [
  "I keep overthinking at night and can't sleep",
  "feeling burnt out and unmotivated",
  "panic before exams",
  "I feel lonely and disconnected",
];

const ResourceFinder = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [mode, setMode] = useState(null);
  const [intro, setIntro] = useState("");
  const [searched, setSearched] = useState(false);

  const run = async (q) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setQuery(text);
    setLoading(true);
    setSearched(true);
    setIntro("");
    setResults([]);
    try {
      const { results, mode } = await searchResources(text, 5);
      setResults(results);
      setMode(mode);
      if (results.length) {
        generateIntro(text, results).then((t) => t && setIntro(t)); // non-blocking
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => { e.preventDefault(); run(); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 bg-gradient-to-b from-[#F7F9F8] to-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2D7D6F] bg-[#2D7D6F]/10 px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" /> AI Semantic Search
          </div>
          <h1 className="text-4xl font-black text-[#2D3142] tracking-tight">Find what you need</h1>
          <p className="text-[#4A4E69]/70 mt-2">
            Describe how you feel in your own words — AI finds the most relevant resources by meaning, not keywords.
          </p>
        </div>

        {/* Search box */}
        <form onSubmit={onSubmit} className="relative mb-4">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4A4E69]/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I feel anxious and can't focus..."
            className="w-full pl-14 pr-32 py-4 rounded-2xl border border-[#E3EAE6] bg-white shadow-sm focus:ring-4 focus:ring-[#2D7D6F]/10 focus:border-[#2D7D6F] outline-none text-[#2D3142]"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 bg-[#2D7D6F] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#1F5A50] disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Search
          </button>
        </form>

        {/* Example chips */}
        {!searched && (
          <div className="flex flex-wrap gap-2 justify-center">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => run(ex)}
                className="text-xs text-[#4A4E69] bg-white border border-[#E3EAE6] rounded-full px-3 py-1.5 hover:border-[#2D7D6F] hover:text-[#2D7D6F] transition"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* AI intro */}
        {intro && (
          <div className="mt-6 flex gap-3 bg-[#2D7D6F]/8 border border-[#2D7D6F]/15 rounded-2xl px-4 py-3">
            <Sparkles className="h-5 w-5 text-[#2D7D6F] shrink-0 mt-0.5" />
            <p className="text-sm text-[#2D3142] leading-relaxed italic">{intro}</p>
          </div>
        )}

        {/* Results */}
        <div className="mt-6 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 text-[#4A4E69]/60">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Searching by meaning...
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="text-center text-[#4A4E69]/60 py-10">No matches found. Try describing it differently.</p>
          )}

          {!loading && results.map((r) => {
            const meta = typeMeta[r.type] || typeMeta.article;
            const Icon = meta.icon;
            return (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-[#E3EAE6] rounded-2xl p-5 hover:shadow-lg hover:border-[#2D7D6F]/40 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
                      style={{ color: meta.color, background: meta.color + "1A" }}>
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                    {typeof r.score === "number" && (
                      <span className="text-[10px] font-bold text-[#4A4E69]/40">
                        {Math.round(r.score * 100)}% match
                      </span>
                    )}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#4A4E69]/30 group-hover:text-[#2D7D6F] transition" />
                </div>
                <h3 className="font-bold text-[#2D3142] mt-2">{r.title}</h3>
                <p className="text-sm text-[#4A4E69]/80 mt-1">{r.description}</p>
                {r.whyHelpful && (
                  <p className="text-xs text-[#2D7D6F] mt-2"><strong>Why it helps:</strong> {r.whyHelpful}</p>
                )}
                {r.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {r.tags.map((t) => (
                      <span key={t} className="text-[10px] text-[#4A4E69]/60 bg-[#F7F9F8] border border-[#E3EAE6] rounded-full px-2 py-0.5">#{t}</span>
                    ))}
                  </div>
                )}
              </a>
            );
          })}

          {!loading && searched && mode && (
            <p className="text-center text-[10px] uppercase tracking-widest text-[#4A4E69]/40 pt-2">
              {mode === "semantic" ? "Ranked by AI semantic similarity" : "Ranked by keyword match (AI offline)"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceFinder;
