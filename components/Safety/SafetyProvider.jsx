import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

      <CrisisSupportModal open={open} onClose={closeSupport} trigger={trigger} />
    </SafetyContext.Provider>
  );
};

export default SafetyProvider;
