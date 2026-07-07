import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera as CameraIcon, RotateCcw, Check, X, Loader2 } from "lucide-react";
import { verifyImage } from "../lib/aiClient";

const LOCALE_NAMES = { fr: "French", en: "English", ar: "Arabic" };

function buildPrompt(locale) {
  const lang = LOCALE_NAMES[locale] || "French";
  return (
    "You are a strict verifier for a Muslim prayer reminder app. " +
    `Reply ONLY with strict JSON: {"valide":true|false,"type_detecte":"tap"|"prayer_mat"|"other","raison":"one short sentence, written in ${lang}"}. ` +
    "Does this photo clearly show, for real (not a drawing, not a screen, not an online image), either a water tap/sink/faucet (for ablution), " +
    "or an unrolled prayer mat? Be lenient about angle and lighting, strict about the real subject."
  );
}

export default function CameraModal({ open, isTest, locale, onClose, onVerified }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState("shoot"); // shoot | review | verifying | result
  const [camError, setCamError] = useState("");
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setPhase("shoot");
    setCamError("");
    setCapturedUrl(null);
    setVerifyResult(null);
  }, [open]);

  useEffect(() => {
    if (!(open && phase === "shoot")) return;
    let cancelled = false;
    setCamError("");
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCamError(t("camera.unavailable"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, phase, t]);

  useEffect(() => {
    if (!open) stopStream();
    return () => stopStream();
  }, [open]);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
  }

  function shoot() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !v.videoWidth) {
      setCamError(t("camera.streamMissing"));
      return;
    }
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    setCapturedUrl(c.toDataURL("image/jpeg", 0.72));
    stopStream();
    setPhase("review");
    if (navigator.vibrate) navigator.vibrate(30);
  }

  function retake() {
    setVerifyResult(null);
    setPhase("shoot");
  }

  function handleClose() {
    stopStream();
    onClose();
  }

  async function sendVerify() {
    setPhase("verifying");
    try {
      const r = await verifyImage({
        imageBase64: capturedUrl.split(",")[1],
        prompt: buildPrompt(locale),
        maxTokens: 300,
      });
      if (r && r.valide === true) {
        setVerifyResult({ ok: true, reason: r.raison || "" });
        setPhase("result");
        setConfettiKey((k) => k + 1);
        if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
        setTimeout(() => {
          setCapturedUrl(null); // never persisted
          onVerified(isTest);
        }, 950);
      } else {
        setVerifyResult({ ok: false, reason: (r && r.raison) || t("camera.verifyUnavailable") });
        setPhase("result");
      }
    } catch (e) {
      setVerifyResult({ ok: false, reason: e?.notConfigured ? t("ai.notConfigured") : t("camera.verifyUnavailable") });
      setPhase("result");
    }
  }

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-5"
      style={{ zIndex: 20, background: "#050B09", borderRadius: "var(--radius-xl)" }}
    >
      <div className="relative w-full" style={{ maxWidth: 336 }}>
        {phase === "shoot" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full"
            style={{ borderRadius: 18, background: "var(--bg2)", minHeight: 200 }}
          />
        )}
        {phase !== "shoot" && capturedUrl && <img src={capturedUrl} alt="" className="w-full" style={{ borderRadius: 18 }} />}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {phase === "shoot" && !camError && (
          <div
            className="absolute px-3 text-center"
            style={{
              insetInlineStart: 12,
              insetInlineEnd: 12,
              bottom: 10,
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              background: "rgba(0,0,0,0.4)",
              padding: "6px 10px",
              borderRadius: 10,
            }}
          >
            {t("camera.frameHint")}
          </div>
        )}
      </div>

      {camError && (
        <div className="mt-4 text-center" style={{ fontSize: 13, color: "var(--mut)", maxWidth: 320 }}>
          {camError}
        </div>
      )}
      {phase === "verifying" && (
        <div className="mt-4 flex items-center gap-2" style={{ color: "var(--mut)", fontSize: 13.5 }}>
          <Loader2 className="animate-spin" size={16} /> {t("camera.verifying")}
        </div>
      )}
      {phase === "result" && verifyResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 text-center"
          style={{ fontSize: 14, lineHeight: 1.5, color: verifyResult.ok ? "var(--ok)" : "var(--bad)", maxWidth: 320 }}
        >
          {verifyResult.ok ? <Check size={15} style={{ display: "inline", marginInlineEnd: 4 }} /> : <X size={15} style={{ display: "inline", marginInlineEnd: 4 }} />}
          {verifyResult.reason}
        </motion.div>
      )}

      <AnimatePresence>
        {verifyResult?.ok && (
          <div className="absolute" style={{ top: "28%", left: "50%", width: 1, height: 1, overflow: "visible" }}>
            {Array.from({ length: 18 }).map((_, i) => {
              const dx = Math.cos((i / 18) * 2 * Math.PI) * (58 + (i % 4) * 12);
              return (
                <span
                  key={confettiKey + "-" + i}
                  className="conf"
                  style={{
                    left: dx,
                    width: 6,
                    height: 10,
                    background: i % 2 ? "var(--em)" : "var(--em2)",
                    borderRadius: 2,
                    position: "absolute",
                    animationDuration: `${0.9 + (i % 3) * 0.2}s`,
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex w-full gap-3" style={{ maxWidth: 336 }}>
        {phase === "shoot" && (
          <>
            <button onClick={handleClose} className="press btn-gh flex-1">
              {t("camera.cancel")}
            </button>
            <button onClick={shoot} disabled={!!camError} className="press btn-em flex-1" style={{ opacity: camError ? 0.5 : 1 }}>
              <CameraIcon size={15} /> {t("camera.shoot")}
            </button>
          </>
        )}
        {phase === "review" && (
          <>
            <button onClick={retake} className="press btn-gh flex-1">
              <RotateCcw size={14} /> {t("camera.retake")}
            </button>
            <button onClick={sendVerify} className="press btn-em flex-1">
              {t("camera.send")}
            </button>
          </>
        )}
        {phase === "result" && !verifyResult?.ok && (
          <>
            <button onClick={handleClose} className="press btn-gh flex-1">
              {t("camera.close")}
            </button>
            <button onClick={retake} className="press btn-em flex-1">
              <RotateCcw size={14} /> {t("camera.retry")}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
