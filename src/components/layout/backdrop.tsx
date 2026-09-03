"use client";

import { motion } from "framer-motion";

export function Backdrop() {
  return (
    <div className="app-backdrop" aria-hidden="true">
      <motion.div
        className="orb"
        style={{ width: 420, height: 420, left: "-6%", top: "8%", background: "hsl(214 100% 50% / 0.35)" }}
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb"
        style={{ width: 360, height: 360, right: "-4%", top: "22%", background: "hsl(199 89% 48% / 0.3)" }}
        animate={{ y: [0, -26, 0], x: [0, -18, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb"
        style={{ width: 300, height: 300, left: "40%", bottom: "-6%", background: "hsl(224 76% 45% / 0.28)" }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
