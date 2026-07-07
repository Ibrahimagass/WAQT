import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ message, bottom }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 max-w-[86%] -translate-x-1/2 text-center"
          style={{
            bottom,
            zIndex: 30,
            background: "var(--card2)",
            border: "1px solid var(--line)",
            color: "var(--txt)",
            padding: "10px 16px",
            borderRadius: 999,
            fontSize: 12.5,
            boxShadow: "var(--shadow-md)",
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
