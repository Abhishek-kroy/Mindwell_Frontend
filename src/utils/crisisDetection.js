import { classifyWithGemini } from "./crisisClassifier";
// crisisDetection.js
// -----------------------------------------------------------------------------
// Lightweight, client-side first-pass detector for language that may indicate a
// user is in acute distress or at risk of self-harm. It runs instantly in the
// browser (no network, no cost) so MindWell can respond even when the heavier
// ML moderation service is offline.
//
// DESIGN CHOICE — bias toward recall, not precision.
// In a crisis context a false negative (missing a real cry for help) is far more
// costly than a false positive (showing support resources to someone who didn't
// strictly need them). So thresholds are intentionally cautious. Borderline
// cases resolve toward "show help".
//
// This is a SAFETY NET, not a diagnosis. It can be upgraded later by sending the
// same text to Gemini or a trained classifier for a second opinion.
// -----------------------------------------------------------------------------

// Tier 1 — explicit, high-risk intent. Any single match => "crisis".
// English + a few Roman-Hindi (Hinglish) terms, since MindWell is Hinglish-first.
const CRISIS_PATTERNS = [
  "kill myself", "killing myself", "kill me", "end my life", "end it all",
  "want to die", "wanna die", "wish i was dead", "wish i were dead",
  "better off dead", "don't want to live", "dont want to live", "no reason to live",
  "no point in living", "tired of living", "can't go on", "cant go on",
  "take my life", "ending my life", "ending it tonight", "suicidal", "suicide",
  "self harm", "self-harm", "harm myself", "hurt myself", "cut myself",
  "cutting myself", "overdose", "slit my", "hang myself", "jump off",
  // Roman-Hindi
  "marna chahta", "marna chahti", "mar jaun", "mar jana chahta",
  "jeena nahi chahta", "jeena nahi chahti", "khudkushi", "atmahatya",
];

// Tier 2 — distress / hopelessness. Needs 2+ matches (or 1 + a crisis hint)
// to raise an "elevated" flag, to keep noise down.
const ELEVATED_PATTERNS = [
  "hopeless", "worthless", "i hate myself", "hate my life", "give up",
  "giving up", "can't take it anymore", "cant take it anymore", "no way out",
  "everyone would be better without me", "better without me", "i'm a burden",
  "im a burden", "nothing matters", "empty inside", "numb", "can't cope",
  "cant cope", "breaking down", "falling apart",
];

// Normalise text so simple obfuscation (extra spaces, repeated chars, casing,
// punctuation) doesn't slip past the matcher.
function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")   // drop digits/punctuation, keep apostrophes
    .replace(/(.)\1{2,}/g, "$1$1") // "diiiie" -> "diie"
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Analyse a piece of text.
 * @returns {{ level: 'none'|'elevated'|'crisis', matches: string[] }}
 */
export function detectCrisis(text) {
  const norm = " " + normalize(text) + " ";
  if (norm.trim().length === 0) return { level: "none", matches: [] };

  const crisisMatches = CRISIS_PATTERNS.filter((p) => norm.includes(" " + p) || norm.includes(p));
  if (crisisMatches.length > 0) {
    return { level: "crisis", matches: crisisMatches };
  }

  const elevatedMatches = ELEVATED_PATTERNS.filter((p) => norm.includes(p));
  if (elevatedMatches.length >= 2) {
    return { level: "elevated", matches: elevatedMatches };
  }

  return { level: "none", matches: [] };
}

// Custom DOM event the SafetyProvider listens for. Using an event keeps the
// detector fully decoupled from React - any module (chat hook, community page,
// future features) can trigger the safety net with a single call.
export const CRISIS_EVENT = "mindwell:crisis";

function fireCrisisEvent(detail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CRISIS_EVENT, { detail: { ...detail, at: Date.now() } }));
  }
}

/**
 * HYBRID detection. Runs the instant on-device keyword check first (so help is
 * NEVER gated behind a network call), then asks Gemini for a smarter second
 * opinion to catch subtle phrasing the keyword list misses. The Gemini pass is
 * non-blocking and silently falls back to the keyword result on any failure.
 *
 * @param {string} text    the user's message / post
 * @param {string} source  where it came from, e.g. 'chat' | 'community'
 * @param {object} options { alertOnElevated?: boolean }
 * @returns {{ level:'none'|'elevated'|'crisis', matches:string[] }} keyword result (sync)
 */
export function checkAndAlertCrisis(text, source = "unknown", options = {}) {
  const local = detectCrisis(text);
  const localAlert =
    local.level === "crisis" || (options.alertOnElevated && local.level === "elevated");

  // 1) Instant, on-device result. Surface help immediately, no waiting.
  if (localAlert) {
    fireCrisisEvent({ ...local, source, detectedBy: "keyword" });
    return local; // already alerting; no need for the AI pass
  }

  // 2) Smarter async second opinion from Gemini for cases the keyword list
  //    can't catch (euphemism, sarcasm, indirect phrasing).
  classifyWithGemini(text)
    .then((ai) => {
      if (!ai) return;
      const aiAlert =
        ai.level === "crisis" || (options.alertOnElevated && ai.level === "elevated");
      if (aiAlert) {
        fireCrisisEvent({ level: ai.level, matches: [], reason: ai.reason, source, detectedBy: "gemini" });
      }
    })
    .catch(() => {});

  return local;
}
