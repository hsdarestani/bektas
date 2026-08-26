import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useProgress } from "@react-three/drei";
import { CSSProperties, lazy, MutableRefObject, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";

const ArchitecturalScene = lazy(() => import("../experience/ArchitecturalScene"));

const chapters = [
  { number: "01", kicker: "Eine neue Perspektive", title: <>Immobilien<br /><em>neu erleben.</em></>, body: "Architektur ist mehr als Fläche. Sie ist Licht, Material, Lage und das Gefühl, angekommen zu sein." },
  { number: "02", kicker: "Kaufen & Verkaufen", title: <>Werte erkennen.<br /><em>Chancen gestalten.</em></>, body: "Mit regionaler Marktkenntnis, klarer Strategie und einer Präsentation, die dem Charakter Ihrer Immobilie gerecht wird." },
  { number: "03", kicker: "Mieten & Vermieten", title: <>Menschen und Räume.<br /><em>Passend verbunden.</em></>, body: "Von der qualifizierten Auswahl bis zum sicheren Abschluss begleiten wir beide Seiten persönlich und transparent." },
  { number: "04", kicker: "Immobilienbewertung", title: <>Was heute zählt.<br /><em>Fundiert bewertet.</em></>, body: "Eine präzise Marktanalyse macht aus einer Vermutung eine belastbare Grundlage für Ihre nächste Entscheidung." },
  { number: "05", kicker: "Wiesbaden · Rhein-Main", title: <>Hier kennen wir<br /><em>den Markt.</em></>, body: "Lokale Expertise bedeutet, die feinen Unterschiede zwischen Lage, Nachfrage und Potenzial zu verstehen." },
];

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2", { powerPreference: "high-performance" }) || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function PremiumLoader({ loaded, staticFallback }: { loaded: boolean; staticFallback: boolean }) {
  const { progress } = useProgress();
  const value = loaded || staticFallback ? 100 : Math.max(3, Math.round(progress));
  return <div className="experience-loader" aria-live="polite"><div><strong>BEKTAS</strong><span>IMMOBILIEN · WIESBADEN</span><div className="loader-track" style={{ "--load-progress": `${value}%` } as CSSProperties}><i /></div><small>{String(value).padStart(2, "0")} / 100</small></div></div>;
}

export default function ExperiencePage() {
  const progress = useRef(0) as MutableRefObject<number>;
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 700px)").matches;
  const weak = useMemo(() => {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    return memory <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
  }, []);
  const webgl = useMemo(supportsWebGL, []);
  const staticFallback = reduced || !webgl || weak;
  const handleSceneReady = useCallback(() => window.setTimeout(() => setLoaded(true), 220), []);

  useEffect(() => {
    document.title = "3D Experience — Bektas Immobilien Wiesbaden";
    const lenis = new Lenis({ duration: reduced ? 0 : 1.15, smoothWheel: !reduced });
    let rafId = 0;
    function raf(time: number) { lenis.raf(time); rafId = requestAnimationFrame(raf); }
    rafId = requestAnimationFrame(raf);
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty("--exp-progress", String(Math.max(.02, progress.current)));
      setActive(Math.min(4, Math.floor(progress.current * 5.2)));
    };
    lenis.on("scroll", update); update();
    const timer = staticFallback ? window.setTimeout(() => setLoaded(true), 380) : 0;
    return () => { cancelAnimationFrame(rafId); if (timer) clearTimeout(timer); lenis.destroy(); document.documentElement.style.removeProperty("--exp-progress"); document.title = "Bektas Immobilien Wiesbaden — Immobilien. Persönlich gedacht."; };
  }, [reduced, staticFallback]);

  return <div className={`immersive ${loaded ? "is-loaded" : ""} ${reduced ? "is-reduced" : ""} ${staticFallback ? "is-fallback" : ""}`}>
    <div className="experience-bg" />
    {staticFallback ? <div className="experience-static-fallback" role="img" aria-label="Zeitgenössische Residenz in einer natürlichen Landschaft" /> : <Suspense fallback={null}><ArchitecturalScene progress={progress} mobile={mobile} weak={weak} onReady={handleSceneReady} /></Suspense>}
    <div className="experience-noise" />
    <header className="experience-header"><a href="/" className="exp-logo"><strong>BEKTAS</strong><span>IMMOBILIEN</span></a><div className="exp-mode"><i /> Interactive Experience</div><a href="/" className="exp-back"><ArrowLeft /> Klassische Website</a></header>
    <aside className="chapter-nav" aria-label="Kapitel">{chapters.map((_, i) => <a key={i} href={`#chapter-${i + 1}`} className={active === i ? "active" : ""}><span>0{i + 1}</span><i /></a>)}</aside>
    <div className="experience-progress"><span /></div>
    <div className="experience-scroll"><ArrowDown /><span>Scroll to explore</span></div>
    <main className="experience-story">
      {chapters.map((chapter, i) => <section id={`chapter-${i + 1}`} className={`experience-chapter chapter-${i + 1} ${active === i ? "is-active" : ""}`} key={chapter.number}><div className="chapter-copy"><p><span>{chapter.number}</span>{chapter.kicker}</p><h1>{chapter.title}</h1><div className="chapter-body"><i /><p>{chapter.body}</p></div>{i === 3 && <a href="/#bewertung">Bewertung starten <ArrowUpRight /></a>}</div></section>)}
      <section className="experience-finale"><div className="finale-image"><img src="/images/hero-residence.webp" alt="Zeitgenössische Immobilie bei Nacht" /></div><div className="finale-copy"><span>Ihre nächste Entscheidung</span><h2>Beginnt mit einem<br /><em>persönlichen Gespräch.</em></h2><div><a href="tel:+491777170385">+49 177 717 03 85</a><a href="mailto:info@bektas-immobilien-wiesbaden.de">Kontakt aufnehmen <ArrowUpRight /></a></div><a className="experience-credits" href="/experience/credits.txt" target="_blank" rel="noreferrer">3D Assets &amp; Credits</a></div></section>
    </main>
    <PremiumLoader loaded={loaded} staticFallback={staticFallback} />
  </div>;
}
