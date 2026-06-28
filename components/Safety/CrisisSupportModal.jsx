import React, { useState } from "react";
import { Phone, X, HeartHandshake, Wind, ShieldAlert, ExternalLink, ChevronRight } from "lucide-react";
import {
  EMERGENCY,
  INDIA_HELPLINES,
  INTERNATIONAL_HELPLINES,
  GROUNDING_STEPS,
  PROFESSIONAL_CTA,
} from "../../src/utils/crisisResources";

/**
 * CrisisSupportModal
 * A calm, non-alarming overlay that connects a user in distress with immediate
 * human help. Deliberately warm (not red / scary) — colours follow MindWell's
 * palette. Shown either manually (floating SOS button) or automatically when the
 * crisis detector flags a message.
 */
const HelplineRow = ({ h }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E3EAE6] bg-white px-4 py-3">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-[#2D3142] truncate">{h.name}</p>
        {h.hours === "24x7" && (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            24×7
          </span>
        )}
      </div>
      {h.note && <p className="text-xs text-[#4A4E69]/70 mt-0.5">{h.note}</p>}
      {(h.hours && h.hours !== "24x7") && (
        <p className="text-xs text-[#4A4E69]/60 mt-0.5">{h.hours}</p>
      )}
    </div>
    {h.url ? (
      <a
        href={h.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#7C9885] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5f7a68] transition"
      >
        Open <ExternalLink className="h-3.5 w-3.5" />
      </a>
    ) : (
      <a
        href={`tel:${h.tel}`}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#7C9885] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5f7a68] transition"
      >
        <Phone className="h-3.5 w-3.5" /> {h.number}
      </a>
    )}
  </div>
);

const CrisisSupportModal = ({ open, onClose, trigger = "manual" }) => {
  const [showGrounding, setShowGrounding] = useState(false);
  const [showIntl, setShowIntl] = useState(false);

  if (!open) return null;
  const isAuto = trigger === "auto";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crisis support"
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-[#2D3142]/50 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[#F7F9F8] rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#7C9885] to-[#5f7a68] text-white px-6 pt-6 pb-5 rounded-t-3xl">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 p-2 rounded-full bg-white/15 hover:bg-white/25 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">You're not alone</h2>
              <p className="text-white/85 text-sm">Support is available right now.</p>
            </div>
          </div>
          {isAuto && (
            <p className="mt-4 text-sm bg-white/15 rounded-2xl px-4 py-3 leading-relaxed">
              It sounds like you might be going through something really hard. You matter,
              and talking to someone can help. Here are people who want to listen.
            </p>
          )}
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Emergency */}
          <a
            href={`tel:${EMERGENCY.tel}`}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#B0413E] text-white px-4 py-3.5 hover:bg-[#933532] transition"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold leading-tight">In immediate danger? Call {EMERGENCY.number}</p>
                <p className="text-white/85 text-xs">{EMERGENCY.note}</p>
              </div>
            </div>
            <Phone className="h-5 w-5 shrink-0" />
          </a>

          {/* India helplines */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A4E69]/60 mb-2">
              Free helplines — India
            </p>
            <div className="space-y-2">
              {INDIA_HELPLINES.map((h) => (
                <HelplineRow key={h.name} h={h} />
              ))}
            </div>
          </div>

          {/* Grounding exercise */}
          <div className="rounded-2xl border border-[#E3EAE6] bg-white overflow-hidden">
            <button
              onClick={() => setShowGrounding((s) => !s)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 font-semibold text-[#2D3142]">
                <Wind className="h-4.5 w-4.5 text-[#7C9885]" /> Try a 60-second grounding exercise
              </span>
              <ChevronRight className={`h-4 w-4 text-[#4A4E69]/40 transition-transform ${showGrounding ? "rotate-90" : ""}`} />
            </button>
            {showGrounding && (
              <ol className="px-4 pb-4 space-y-2">
                {GROUNDING_STEPS.map((g) => (
                  <li key={g.sense} className="flex gap-3 text-sm">
                    <span className="font-bold text-[#7C9885] shrink-0 w-16">{g.sense}</span>
                    <span className="text-[#4A4E69]">{g.text}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* International toggle */}
          <div>
            <button
              onClick={() => setShowIntl((s) => !s)}
              className="text-sm font-semibold text-[#7C9885] hover:underline"
            >
              {showIntl ? "Hide" : "Outside India? Show international lines"}
            </button>
            {showIntl && (
              <div className="space-y-2 mt-2">
                {INTERNATIONAL_HELPLINES.map((h) => (
                  <HelplineRow key={h.name} h={h} />
                ))}
              </div>
            )}
          </div>

          {/* Professional CTA */}
          <a
            href={PROFESSIONAL_CTA.href}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-[#7C9885] text-[#5f7a68] font-bold px-4 py-3 hover:bg-[#7C9885]/10 transition"
          >
            {PROFESSIONAL_CTA.label} <ChevronRight className="h-4 w-4" />
          </a>

          <p className="text-[11px] text-[#4A4E69]/50 text-center leading-relaxed pb-2">
            MindWell is a supportive companion, not a substitute for professional or
            emergency care. If you can, reach out to someone you trust too.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrisisSupportModal;
