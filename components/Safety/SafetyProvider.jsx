import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LifeBuoy } from "lucide-react";
import CrisisSupportModal from "./CrisisSupportModal";
import { CRISIS_EVENT } from "../../src/utils/crisisDetection";

/**
 * SafetyProvider
 * Mounts ONCE at the top of the app. It:
 *   1. exposes useSafety().openSupport() so any component can open the help modal,
 *   2. listens for the global `mindwell:crisis` event (fired by the crisis
 *      detector from anywhere — chat, community, future features) and opens the
 *      modal automatically,
 *   3. renders an always-available floating "Help" button.
 *
 * This event-driven design keeps the detector decoupled from React and means new
 * surfaces can plug into the safety net with a single function call.
 */
const SafetyContext = createContext({ openSupport: () => {}, closeSupport: () => {} });

export const useSafety = () => useContext(SafetyContext);

export const SafetyProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState("manual");

  const openSupport = useCallback((mode = "manual") => {
    setTrigger(mode);
    setOpen(true);
  }, []);
  const closeSupport = useCallback(() => setOpen(false), []);

  // Auto-open when the crisis detector fires the global event.
  useEffect(() => {
    const handler = () => openSupport("auto");
    window.addEventListener(CRISIS_EVENT, handler);
    return () => window.removeEventListener(CRISIS_EVENT, handler);
  }, [openSupport]);

  // Close on Escape for accessibility.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeSupport();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeSupport]);

  return (
    <SafetyContext.Provider value={{ openSupport, closeSupport }}>
      {children}

      {/* Always-available floating help button (bottom-left to avoid clashing
          with chat / toast UI on the bottom-right). */}
      <button
        onClick={() => openSupport("manual")}
        aria-label="Get crisis support"
        title="Need support now?"
        className="fixed bottom-5 left-5 z-[900] flex items-center gap-2 rounded-full bg-[#7C9885] text-white shadow-lg shadow-[#7C9885]/30 pl-3 pr-4 py-3 hover:bg-[#5f7a68] active:scale-95 transition"
      >
        <LifeBuoy className="h-5 w-5" />
        <span className="text-sm font-bold hidden sm:inline">Need support?</span>
      </button>

      <CrisisSupportModal open={open} onClose={closeSupport} trigger={trigger} />
    </SafetyContext.Provider>
  );
};

export default SafetyProvider;
