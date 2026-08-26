import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useProgress } from "@react-three/drei";
import { CSSProperties, ErrorInfo, lazy, MutableRefObject, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import ExperienceErrorBoundary from "../experience/ExperienceErrorBoundary";

const ArchitecturalScene = lazy(() => import("../experience/ArchitecturalScene"));
type RenderState = "loading" | "ready" | "failed";

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

function supportsWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { powerPreference: "high-performance" });
    const supported = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

function stringifyLoaderError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try { return JSON.stringify(error); } catch { return String(error); }
}

function PremiumLoader({ state }: { state: RenderState }) {
  const { progress } = useProgress();
  const value = state === "ready" || state === "failed" ? 100 : Math.min(99, Math.max(3, Math.round(progress)));
  return <div className="experience-loader" aria-live="polite"><div><strong>BEKTAS</strong><span>IMMOBILIEN · WIESBADEN</span><div className="loader-track" style={{ "--load-progress": `${value}%` } as CSSProperties}><i /></div><small>{String(value).padStart(2, "0")} / 100</small></div></div>;
}

function Debug3DOverlay({
  webglAvailable,
  renderState,
  rendererCreated,
  sceneMounted,
  firstFrame,
  contextLostCount,
  latestError,
  optionalAssetErrors,
}: {
  webglAvailable: boolean;
  renderState: RenderState;
  rendererCreated: boolean;
  sceneMounted: boolean;
  firstFrame: boolean;
  contextLostCount: number;
  latestError: string | null;
  optionalAssetErrors: string[];
}) {
  const { progress, active, loaded, total, errors } = useProgress();
  const loaderErrors = errors.map(stringifyLoaderError);
  const shell: CSSProperties = {
    position: "fixed", zIndex: 10000, top: 88, left: 12, width: "min(390px, calc(100vw - 24px))",
    maxHeight: "calc(100dvh - 110px)", overflow: "auto", padding: "14px 16px", borderRadius: 8,
    background: "rgba(6, 9, 8, .92)", border: "1px solid rgba(255,255,255,.22)", color: "#f5f2e9",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 11, lineHeight: 1.45,
    boxShadow: "0 14px 45px rgba(0,0,0,.35)", pointerEvents: "none",
  };
  const ok = (value: boolean) => value ? "YES" : "NO";
  return <div style={shell}>
    <strong style={{ display: "block", marginBottom: 8, letterSpacing: ".08em" }}>BEKTAS 3D DEBUG</strong>
    <div>WebGL2 context: {ok(webglAvailable)}</div>
    <div>Renderer created: {ok(rendererCreated)}</div>
    <div>Scene mounted: {ok(sceneMounted)}</div>
    <div>First rendered frame: {ok(firstFrame)}</div>
    <div>Render state: {renderState}</div>
    <div>Asset progress: {Math.round(progress)}% ({loaded}/{total}) {active ? "ACTIVE" : "IDLE"}</div>
    <div>Context lost count: {contextLostCount}</div>
    <div style={{ marginTop: 8 }}>Latest fatal error: {latestError || "none"}</div>
    <div>Loader errors: {loaderErrors.length ? loaderErrors.join(" | ") : "none"}</div>
    <div>Optional asset errors: {optionalAssetErrors.length ? optionalAssetErrors.join(" | ") : "none"}</div>
  </div>;
}

export default function ExperiencePage() {
  const progress = useRef(0) as MutableRefObject<number>;
  const recoveryTimer = useRef(0);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(() => !document.hidden);
  const mobile = useMediaQuery("(max-width: 700px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const debug3d = useMemo(() => new URLSearchParams(window.location.search).get("debug3d") === "1", []);
  const webglAvailable = useMemo(supportsWebGL2, []);
  const [renderState, setRenderState] = useState<RenderState>(() => webglAvailable ? "loading" : "failed");
  const [failureReason, setFailureReason] = useState<string | null>(() => webglAvailable ? null : "WebGL 2 ist in diesem Browser nicht verfügbar.");
  const [rendererCreated, setRendererCreated] = useState(false);
  const [sceneMounted, setSceneMounted] = useState(false);
  const [firstFrame, setFirstFrame] = useState(false);
  const [contextLostCount, setContextLostCount] = useState(0);
  const [latestError, setLatestError] = useState<string | null>(() => webglAvailable ? null : "WebGL2 context creation failed");
  const [optionalAssetErrors, setOptionalAssetErrors] = useState<string[]>([]);
  const staticFallback = renderState === "failed";
  const loaded = renderState === "ready" || renderState === "failed";

  const clearRecoveryTimer = useCallback(() => {
    clearTimeout(recoveryTimer.current);
    recoveryTimer.current = 0;
  }, []);

  const handleRendererCreated = useCallback(() => {
    setRendererCreated(true);
  }, []);

  const handleSceneMounted = useCallback(() => {
    setSceneMounted(true);
  }, []);

  const handleSceneReady = useCallback(() => {
    clearRecoveryTimer();
    setFirstFrame(true);
    setRenderState("ready");
    setFailureReason(null);
  }, [clearRecoveryTimer]);

  const handleOptionalAssetError = useCallback((message: string) => {
    setOptionalAssetErrors((current) => current.includes(message) ? current : [...current, message].slice(-4));
  }, []);

  const handleContextLost = useCallback(() => {
    clearRecoveryTimer();
    setContextLostCount((value) => value + 1);
    setLatestError("WebGL context lost; waiting for browser restoration");
    console.warn("Bektas immersive renderer: WebGL context lost; waiting for browser restoration");
    recoveryTimer.current = window.setTimeout(() => {
      const message = "WebGL context was not restored within 15 seconds";
      console.error(`Bektas immersive renderer: ${message}`);
      setLatestError(message);
      setFailureReason("Die 3D-Darstellung konnte nicht automatisch wiederhergestellt werden.");
      setRenderState("failed");
    }, 15000);
  }, [clearRecoveryTimer]);

  const handleContextRestored = useCallback(() => {
    clearRecoveryTimer();
    setLatestError(null);
    console.info("Bektas immersive renderer: WebGL context restored");
  }, [clearRecoveryTimer]);

  const handleRendererError = useCallback((error: Error, info: ErrorInfo) => {
    const detail = `${error.name || "Error"}: ${error.message || String(error)}`;
    console.error("Bektas immersive renderer unrecoverable error", error, info?.componentStack ?? "");
    clearRecoveryTimer();
    setLatestError(detail);
    setFailureReason("Die 3D-Darstellung wurde sicher beendet. Die Inhalte bleiben vollständig verfügbar.");
    setRenderState("failed");
  }, [clearRecoveryTimer]);

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
      lenis.destroy();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("orientationchange", onViewportResize);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
      document.documentElement.style.removeProperty("--exp-progress");
      document.title = "Bektas Immobilien Wiesbaden — Immobilien. Persönlich gedacht.";
    };
  }, [reduced]);

  return <div className={`immersive ${loaded ? "is-loaded" : ""} ${reduced ? "is-reduced" : ""} ${staticFallback ? "is-fallback" : ""}`}>
    <div className="experience-bg" />
    {staticFallback ? <div className="experience-static-fallback" role="img" aria-label="Zeitgenössische Residenz in einer natürlichen Landschaft" /> : <ExperienceErrorBoundary onError={handleRendererError}><Suspense fallback={null}><ArchitecturalScene progress={progress} mobile={mobile} visible={visible} onRendererCreated={handleRendererCreated} onSceneMounted={handleSceneMounted} onReady={handleSceneReady} onContextLost={handleContextLost} onContextRestored={handleContextRestored} onOptionalAssetError={handleOptionalAssetError} /></Suspense></ExperienceErrorBoundary>}
    <div className="experience-noise" />
    <header className="experience-header"><a href="/" className="exp-logo"><strong>BEKTAS</strong><span>IMMOBILIEN</span></a><div className="exp-mode"><i /> Interactive Experience</div><a href="/" className="exp-back"><ArrowLeft /> Klassische Website</a></header>
    <aside className="chapter-nav" aria-label="Kapitel">{chapters.map((_, i) => <a key={i} href={`#chapter-${i + 1}`} className={active === i ? "active" : ""}><span>0{i + 1}</span><i /></a>)}</aside>
    <div className="experience-progress"><span /></div>
    <div className="experience-scroll"><ArrowDown /><span>Scroll to explore</span></div>
    {staticFallback && failureReason && <div className="experience-recovery-note" role="status"><span>Architekturansicht gesichert</span><p>{failureReason}</p></div>}
    {debug3d && <Debug3DOverlay webglAvailable={webglAvailable} renderState={renderState} rendererCreated={rendererCreated} sceneMounted={sceneMounted} firstFrame={firstFrame} contextLostCount={contextLostCount} latestError={latestError} optionalAssetErrors={optionalAssetErrors} />}
    <main className="experience-story">
      {chapters.map((chapter, i) => <section id={`chapter-${i + 1}`} className={`experience-chapter chapter-${i + 1} ${active === i ? "is-active" : ""}`} key={chapter.number}><div className="chapter-copy"><p><span>{chapter.number}</span>{chapter.kicker}</p><h1>{chapter.title}</h1><div className="chapter-body"><i /><p>{chapter.body}</p></div>{i === 3 && <a href="/#bewertung">Bewertung starten <ArrowUpRight /></a>}</div></section>)}
      <section className="experience-finale"><div className="finale-image"><img src="/images/hero-residence.webp" alt="Zeitgenössische Immobilie bei Nacht" /></div><div className="finale-copy"><span>Ihre nächste Entscheidung</span><h2>Beginnt mit einem<br /><em>persönlichen Gespräch.</em></h2><div><a href="tel:+491777170385">+49 177 717 03 85</a><a href="mailto:info@bektas-immobilien-wiesbaden.de">Kontakt aufnehmen <ArrowUpRight /></a></div><a className="experience-credits" href="/experience/credits.txt" target="_blank" rel="noreferrer">3D Assets &amp; Credits</a></div></section>
    </main>
    <PremiumLoader state={renderState} />
  </div>;
}
