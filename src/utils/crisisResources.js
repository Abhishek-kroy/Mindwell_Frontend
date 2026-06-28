// crisisResources.js
// -----------------------------------------------------------------------------
// Centralised, easy-to-update directory of crisis / mental-health support lines
// surfaced by the Crisis SOS Safety Net.
//
// IMPORTANT (operational safety): Helpline numbers can change. Verify every
// entry against the provider's official website before each production release.
// Sources used for the India list below: provider sites + Wikipedia
// "List of suicide crisis lines" (verified for this build).
// -----------------------------------------------------------------------------

// The single most important action in an active emergency.
export const EMERGENCY = {
  label: "Emergency services (India)",
  number: "112",
  tel: "112",
  note: "Call if you or someone else is in immediate physical danger.",
};

// India-first, because MindWell's primary audience is Indian students.
export const INDIA_HELPLINES = [
  {
    name: "Tele MANAS (Govt. of India)",
    number: "14416",
    tel: "14416",
    hours: "24x7",
    languages: "20+ languages",
    note: "National tele mental-health programme. Also: 1-800-891-4416.",
  },
  {
    name: "KIRAN Mental Health Helpline",
    number: "1800-599-0019",
    tel: "18005990019",
    hours: "24x7",
    languages: "13 languages",
    note: "Govt. of India toll-free helpline for distress & suicidal thoughts.",
  },
  {
    name: "Vandrevala Foundation",
    number: "+91 99996 66555",
    tel: "+919999666555",
    hours: "24x7",
    languages: "Multiple",
    note: "Free counselling & crisis intervention (call + WhatsApp).",
  },
  {
    name: "AASRA",
    number: "+91 22 2754 6669",
    tel: "+912227546669",
    hours: "24x7",
    languages: "English, Hindi",
    note: "Confidential emotional support for those in distress.",
  },
  {
    name: "iCall (TISS)",
    number: "+91 91529 87821",
    tel: "+919152987821",
    hours: "Mon–Sat, 10am–8pm",
    languages: "English, Hindi & more",
    note: "Email & phone counselling by trained professionals.",
  },
];

// International fallback so the feature is useful for any user.
export const INTERNATIONAL_HELPLINES = [
  { name: "USA & Canada — 988 Suicide & Crisis Lifeline", number: "988", tel: "988", hours: "24x7" },
  { name: "UK & ROI — Samaritans", number: "116 123", tel: "116123", hours: "24x7" },
  { name: "Find a helpline in your country", number: "findahelpline.com", url: "https://findahelpline.com", hours: "Directory" },
];

// A short, evidence-informed grounding exercise the user can do right now.
// (5-4-3-2-1 sensory grounding — widely used for acute anxiety / panic.)
export const GROUNDING_STEPS = [
  { sense: "5 — See",   text: "Name 5 things you can see around you right now." },
  { sense: "4 — Touch", text: "Notice 4 things you can physically feel (your feet, the chair, your breath)." },
  { sense: "3 — Hear",  text: "Listen for 3 sounds, near or far." },
  { sense: "2 — Smell", text: "Find 2 things you can smell — or 2 smells you like." },
  { sense: "1 — Taste", text: "Notice 1 thing you can taste, or take a slow sip of water." },
];

// Where MindWell can route the user to a real professional inside the product.
export const PROFESSIONAL_CTA = {
  label: "Talk to a professional on MindWell",
  href: "/add-request",
};
