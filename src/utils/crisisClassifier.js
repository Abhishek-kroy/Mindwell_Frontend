// crisisClassifier.js
// -----------------------------------------------------------------------------
// AI second-pass for the Crisis SOS Safety Net.
//
// The on-device keyword detector (crisisDetection.js) is instant and always
// available, but literal — it can miss euphemism, sarcasm or indirect phrasing.
// This module asks Google's Gemini for a nuanced risk classification of the same
// text. It is used as a NON-BLOCKING second opinion: the keyword check still
// fires the support modal instantly, and Gemini can escalate borderline cases a
// moment later. If the API key is missing or the call fails, this silently
// returns null and the system falls back to the keyword result.
//
// NOTE: like the existing Test/Resource Gemini calls in this app, this runs
// client-side with VITE_GEMINI_API_KEY. For production, proxy it through the
// backend so the key is never exposed.
// -----------------------------------------------------------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";

const VALID_LEVELS = ["none", "elevated", "crisis"];

/**
 * Ask Gemini to classify self-harm / crisis risk in a message.
 * @param {string} text
 * @returns {Promise<{level:'none'|'elevated'|'crisis', reason:string}|null>}
 */
export async function classifyWithGemini(text) {
  try {
    const clean = String(text || "").trim();
    if (clean.length < 3) return null; // nothing meaningful to classify

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) return null; // no key -> fall back to keyword detector

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a safety classifier for a mental-health app.
Read the user's message and rate the risk of self-harm or a suicidal crisis.
Respond with STRICT JSON only - no prose, no markdown:
{"level":"none|elevated|crisis","reason":"max 12 words"}

Definitions:
- "crisis": explicit or strongly implied intent/desire to die, suicidal thoughts, or active self-harm.
- "elevated": significant hopelessness, worthlessness or severe distress, but no explicit intent.
- "none": no notable self-harm risk.

Be cautious: if you are unsure between two levels, choose the higher one.
Classify only; do not reply to the user.

Message: """${clean}"""`;

    const result = await model.generateContent(prompt);
    const raw = (await result.response).text();

    // Strip markdown fences and isolate the JSON object.
    const jsonText = raw.replace(/```json|```/gi, "").trim();
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    if (!VALID_LEVELS.includes(parsed.level)) return null;

    return { level: parsed.level, reason: String(parsed.reason || "").slice(0, 120) };
  } catch (err) {
    // Network/quota/parse errors must never break the user flow — fall back.
    if (typeof console !== "undefined") console.warn("Gemini crisis classify failed:", err?.message);
    return null;
  }
}
