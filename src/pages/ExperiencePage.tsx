import { ArrowDown, ArrowLeft, ArrowUpRight, RotateCcw } from "lucide-react";
import { useProgress } from "@react-three/drei";
import { CSSProperties, lazy, MutableRefObject, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import ExperienceErrorBoundary from "../experience/ExperienceErrorBoundary";

const ArchitecturalScene = lazy(() => import("../experience/ArchitecturalScene"));
type RenderState = "loading" | "ready" | "recovering" | "failed";

const chapters = [
  { number: "01", kicker: "Eine neue Perspektive", title: <>Immobilien<br /><em>neu erleben.</em></>, body: "Architektur ist mehr als Fläche. Sie ist Licht, Material, Lage und das Gefühl, angekommen zu sein." },
  { number: "02", kicker: "Kaufen & Verkaufen", title: <>Werte erkennen.<br /><em>Chancen gestalten.</em></>, body: "Mit regionaler Marktkenntnis, klarer Strategie und einer Präsentation, die dem Charakter Ihrer Immobilie gerecht wird." },
  { number: "03", kicker: "Mieten & Vermieten", title: <>Menschen und Räume.<br /><em>Passend verbunden.</em></>, body: "Von der qualifizierten Auswahl bis zum sicheren Abschluss begleiten wir beide Seiten persönlich und transparent." },
  { number: "04", kicker: "Immobilienbewertung", title: <>Was heute zählt.<br /><em>Fundiert bewertet.</em></>, body: "Eine präzise Marktanalyse macht aus einer Vermutung eine belastbare Grundlage für Ihre nächste Entscheidung." },
  { number: "05", kicker: "Wiesbaden · Rhein-Main", title: <>Hier kennen wir<br /><em>den Markt.</em></>, body: "Lokale Expertise bedeutet, die feinen Unterschiede zwischen Lage, Nachfrage und Potenzial zu verstehen." },
];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function PremiumLoader({ state, onAssetError }: { state: RenderState; onAssetError: (error: Error) => void }) {
  const { progress, errors } = useProgress();
  const value = state === "ready" ? 100 : state === "recovering" ? 86 : Math.min(99, Math.max(3, Math.round(progress)));
  useEffect(() => {
    if (errors.length) onAssetError(new Error(`3D asset loading failed: ${errors.join(", ")}`));
  }, [errors, onAssetError]);
  return <div className="experience-loader" aria-live="polite"><div><strong>BEKTAS</strong><span>{state === "recovering" ? "GRAFIK WIRD WIEDERHERGESTELLT" : "IMMOBILIEN · WIESBADEN"}</span><div className="loader-track" style={{ "--load-progress": `${value}%` } as CSSProperties}><i /></div><small>{String(value).padStart(2, "0")} / 100</small></div></div>;
}

export default function ExperiencePage() {
  const progress = useRef(0) as MutableRefObject<number>;
  const recoveryTimer = useRef(0);
  const retryTimer = useRef(0);
  const rendererInitTimer = useRef(0);
  const rendererCreatedAttempt = useRef(-1);
  const automaticRetries = useRef(0);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(() => !document.hidden);
  const mobile = useMediaQuery("(max-width: 700px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const webglAvailable = useMemo(() => typeof window.WebGL2RenderingContext !== "undefined", []);
  const [renderState, setRenderState] = useState<RenderState>(() => webglAvailable ? "loading" : "failed");
  const [sceneAttempt, setSceneAttempt] = useState(0);
  const [recoveryEpoch, setRecoveryEpoch] = useState(0);
  const [failureReason, setFailureReason] = useState<string | null>(() => webglAvailable ? null : "WebGL 2 ist in diesem Browser nicht verfügbar.");
  const staticFallback = renderState === "failed";
  const loaded = renderState === "ready" || renderState === "failed";

  const clearRecoveryTimer = useCallback(() => {
    clearTimeout(recoveryTimer.current);
    recoveryTimer.current = 0;
  }, []);

  const handleSceneReady = useCallback(() => {
    clearRecoveryTimer();
    setRenderState("ready");
    setFailureReason(null);
  }, [clearRecoveryTimer]);

  const handleRendererCreated = useCallback(() => {
    rendererCreatedAttempt.current = sceneAttempt;
    clearTimeout(rendererInitTimer.current);
  }, [sceneAttempt]);

  const handleContextLost = useCallback(() => {
    clearRecoveryTimer();
    setRenderState("recovering");
    recoveryTimer.current = window.setTimeout(() => {
      setFailureReason("Die 3D-Darstellung konnte nicht automatisch wiederhergestellt werden.");
      setRenderState("failed");
    }, 8000);
  }, [clearRecoveryTimer]);

  const handleContextRestored = useCallback(() => {
    clearRecoveryTimer();
    setRenderState("loading");
    setRecoveryEpoch((value) => value + 1);
  }, [clearRecoveryTimer]);

  const handleRendererError = useCallback((error: Error) => {
    console.error("Bektas immersive renderer recovered from an error", error);
    clearRecoveryTimer();
    clearTimeout(retryTimer.current);
    if (webglAvailable && automaticRetries.current < 1) {
      automaticRetries.current += 1;
      setRenderState("recovering");
      retryTimer.current = window.setTimeout(() => {
        setSceneAttempt((value) => value + 1);
        setRecoveryEpoch((value) => value + 1);
        setRenderState("loading");
      }, 700);
      return;
    }
    setFailureReason("Die 3D-Darstellung wurde sicher beendet. Die Inhalte bleiben vollständig verfügbar.");
    setRenderState("failed");
  }, [clearRecoveryTimer, webglAvailable]);

  const retryRenderer = useCallback(() => {
    automaticRetries.current = 0;
    setFailureReason(null);
    setSceneAttempt((value) => value + 1);
    setRecoveryEpoch((value) => value + 1);
    setRenderState("loading");
  }, []);

  useEffect(() => {
    if (renderState !== "loading" || !webglAvailable || rendererCreatedAttempt.current === sceneAttempt) return;
    clearTimeout(rendererInitTimer.current);
    rendererInitTimer.current = window.setTimeout(() => {
      if (rendererCreatedAttempt.current !== sceneAttempt) {
        handleRendererError(new Error("WebGL renderer initialization timed out"));
      }
    }, 4000);
    return () => clearTimeout(rendererInitTimer.current);
  }, [handleRendererError, renderState, sceneAttempt, webglAvailable]);

  useEffect(() => {
    document.title = "3D Experience — Bektas Immobilien Wiesbaden";
    const lenis = new Lenis({ duration: reduced ? 0 : 1.15, smoothWheel: !reduced });
    let rafId = 0;
    let resizeRaf = 0;
    function raf(time: number) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    const update = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const max = document.documentElement.scrollHeight - viewportHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty("--exp-progress", String(Math.max(.02, progress.current)));
      setActive(Math.min(4, Math.floor(progress.current * 5.2)));
    };
    const onViewportResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(update);
    };
    const onVisibility = () => {
      const nextVisible = !document.hidden;
      setVisible(nextVisible);
      if (nextVisible) { lenis.start(); update(); } else { lenis.stop(); }
    };

    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", update);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("orientationchange", onViewportResize);
    window.visualViewport?.addEventListener("resize", onViewportResize);
    update();
    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      clearTimeout(recoveryTimer.current);
      clearTimeout(retryTimer.current);
      clearTimeout(rendererInitTimer.current);
      lenis.destroy();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("orientationchange", onViewportResize);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
      document.documentElement.style.removeProperty("--exp-progress");
      document.title = "Bektas Immobilien Wiesbaden — Immobilien. Persönlich gedacht.";
    };
  }, [reduced]);

  return <div className={`immersive ${loaded ? "is-loaded" : ""} ${reduced ? "is-reduced" : ""} ${staticFallback ? "is-fallback" : ""} ${renderState === "recovering" ? "is-recovering" : ""}`}>
    <div className="experience-bg" />
    {staticFallback ? <div className="experience-static-fallback" role="img" aria-label="Zeitgenössische Residenz in einer natürlichen Landschaft" /> : <ExperienceErrorBoundary resetKey={sceneAttempt} onError={handleRendererError}><Suspense fallback={null}><ArchitecturalScene key={sceneAttempt} progress={progress} mobile={mobile} visible={visible} recoveryEpoch={recoveryEpoch} onRendererCreated={handleRendererCreated} onReady={handleSceneReady} onContextLost={handleContextLost} onContextRestored={handleContextRestored} /></Suspense></ExperienceErrorBoundary>}
    <div className="experience-noise" />
    <header className="experience-header"><a href="/" className="exp-logo"><strong>BEKTAS</strong><span>IMMOBILIEN</span></a><div className="exp-mode"><i /> Interactive Experience</div><a href="/" className="exp-back"><ArrowLeft /> Klassische Website</a></header>
    <aside className="chapter-nav" aria-label="Kapitel">{chapters.map((_, i) => <a key={i} href={`#chapter-${i + 1}`} className={active === i ? "active" : ""}><span>0{i + 1}</span><i /></a>)}</aside>
    <div className="experience-progress"><span /></div>
    <div className="experience-scroll"><ArrowDown /><span>Scroll to explore</span></div>
    {staticFallback && failureReason && <div className="experience-recovery-note" role="status"><span>Architekturansicht gesichert</span><p>{failureReason}</p>{webglAvailable && <button type="button" onClick={retryRenderer}><RotateCcw /> 3D erneut starten</button>}</div>}
    <main className="experience-story">
      {chapters.map((chapter, i) => <section id={`chapter-${i + 1}`} className={`experience-chapter chapter-${i + 1} ${active === i ? "is-active" : ""}`} key={chapter.number}><div className="chapter-copy"><p><span>{chapter.number}</span>{chapter.kicker}</p><h1>{chapter.title}</h1><div className="chapter-body"><i /><p>{chapter.body}</p></div>{i === 3 && <a href="/#bewertung">Bewertung starten <ArrowUpRight /></a>}</div></section>)}
      <section className="experience-finale"><div className="finale-image"><img src="/images/hero-residence.webp" alt="Zeitgenössische Immobilie bei Nacht" /></div><div className="finale-copy"><span>Ihre nächste Entscheidung</span><h2>Beginnt mit einem<br /><em>persönlichen Gespräch.</em></h2><div><a href="tel:+491777170385">+49 177 717 03 85</a><a href="mailto:info@bektas-immobilien-wiesbaden.de">Kontakt aufnehmen <ArrowUpRight /></a></div><a className="experience-credits" href="/experience/credits.txt" target="_blank" rel="noreferrer">3D Assets &amp; Credits</a></div></section>
    </main>
    <PremiumLoader state={renderState} onAssetError={handleRendererError} />
  </div>;
}
