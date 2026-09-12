import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, Sparkles, X } from "lucide-react";
import { Link } from "wouter";
import { BRANDING } from "@/config/branding";

const PARTICLES = [
  [8, 18, 0.2, 0.72], [15, 69, 1.7, 0.42], [22, 37, 3.4, 0.58],
  [31, 82, 0.8, 0.36], [39, 22, 2.9, 0.48], [46, 58, 4.1, 0.7],
  [54, 12, 1.1, 0.52], [61, 73, 3.8, 0.4], [68, 32, 2.1, 0.7],
  [76, 86, 4.8, 0.45], [82, 16, 0.5, 0.62], [88, 61, 2.7, 0.52],
  [94, 41, 1.4, 0.36], [5, 91, 3.1, 0.48], [27, 8, 4.5, 0.58],
  [58, 91, 2.4, 0.38], [72, 52, 0.9, 0.5], [97, 78, 3.6, 0.64],
] as const;

function particleStyle([x, y, delay, opacity]: (typeof PARTICLES)[number]) {
  return {
    "--particle-x": `${x}%`,
    "--particle-y": `${y}%`,
    "--particle-delay": `${delay}s`,
    "--particle-opacity": opacity,
  } as CSSProperties;
}

/**
 * Hero immersif sans moteur 3D lourd.
 * La profondeur est pilotée par le pointeur et le scroll, avec un rendu statique
 * accessible lorsque les animations sont réduites ou WebGL indisponible.
 */
export function ImmersiveHero2027() {
  const heroRef = useRef<HTMLElement>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.82)));
      hero.style.setProperty("--mmd-pointer-x", pointerX.toFixed(3));
      hero.style.setProperty("--mmd-pointer-y", pointerY.toFixed(3));
      hero.style.setProperty("--mmd-scroll-depth", progress.toFixed(3));
    };

    const schedulePaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches || !finePointer.matches) return;
      const rect = hero.getBoundingClientRect();
      pointerX = Math.min(1, Math.max(-1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      pointerY = Math.min(1, Math.max(-1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      schedulePaint();
    };

    paint();
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", schedulePaint, { passive: true });
    window.addEventListener("resize", schedulePaint, { passive: true });

    return () => {
      hero.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", schedulePaint);
      window.removeEventListener("resize", schedulePaint);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={heroRef} className="mmd-hero mmd-immersive-hero" aria-labelledby="mmd-immersive-title">
      <div className="mmd-depth-world" aria-hidden="true">
        <div className="mmd-depth-camera">
          <img
            className="mmd-depth-stage-image"
            src="/immersive/jsinnovia-companion-stage-2027.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
          <div className="mmd-depth-stage-light" />
          <div className="mmd-depth-floor" />
          <div className="mmd-depth-orbit mmd-depth-orbit--one" />
          <div className="mmd-depth-orbit mmd-depth-orbit--two" />
          <div className="mmd-depth-particles">
            {PARTICLES.map((particle, index) => <i key={index} style={particleStyle(particle)} />)}
          </div>
        </div>
        <div className="mmd-depth-shade" />
        <div className="mmd-depth-noise" />
      </div>

      <div className="mmd-container mmd-immersive-content">
        <div className="mmd-immersive-copy">
          <div className="mmd-hero-kicker"><span>Nouvelle génération</span><i /><span>Édition 2027</span></div>
          <img className="mmd-immersive-logo" src={BRANDING.logoIdentity} alt="Miss & Mister Dour" />
          <h1 id="mmd-immersive-title" className="mmd-immersive-title">
            <span>Entrez dans</span>
            <strong>l’aventure.</strong>
          </h1>
          <p className="mmd-immersive-question">Et si cette année, c’était vous&nbsp;?</p>
          <p className="mmd-immersive-intro">Une expérience humaine, scénique et digitale où chaque personnalité peut trouver sa place.</p>
          <div className="mmd-hero-actions mmd-immersive-actions">
            <Link href="/inscription" className="mmd-primary-button mmd-large-button">Devenir candidat <ArrowRight className="h-5 w-5" /></Link>
            <Link href="/candidates" className="mmd-secondary-button mmd-large-button">Découvrir les candidats</Link>
          </div>
          <div className="mmd-immersive-signature"><Sparkles /><span>Expérience numérique propulsée par JS-Innov.IA®</span></div>
        </div>
      </div>

      <div className={`mmd-avatar-guide ${guideOpen ? "is-open" : ""}`}>
        {guideOpen && (
          <div className="mmd-avatar-guide-panel" role="region" aria-label="Guide numérique Miss & Mister Dour">
            <button type="button" className="mmd-avatar-guide-close" onClick={() => setGuideOpen(false)} aria-label="Fermer le guide"><X /></button>
            <span className="mmd-avatar-guide-label"><i /> EN LIGNE</span>
            <strong>Bienvenue dans l’édition 2027.</strong>
            <p>Je peux vous orienter vers les candidats, l’élection ou votre inscription.</p>
            <nav>
              <Link href="/inscription">Commencer mon inscription <ArrowRight /></Link>
              <Link href="/candidates">Voir les candidats <ArrowRight /></Link>
              <Link href="/about">Découvrir l’élection <ArrowRight /></Link>
            </nav>
          </div>
        )}
        <button type="button" className="mmd-avatar-guide-button" onClick={() => setGuideOpen((open) => !open)} aria-expanded={guideOpen} aria-label="Ouvrir le guide numérique">
          <span className="mmd-avatar-guide-portrait" aria-hidden="true" />
          <span><small>GUIDE NUMÉRIQUE</small><strong>Je vous accompagne</strong></span>
          <Sparkles />
        </button>
      </div>

      <a href="#experience" className="mmd-scroll-cue"><span>Explorer</span><ArrowDown /></a>
    </section>
  );
}

export function useDepthReveals() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".editorial-home");
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-depth-reveal]"));
    if (!items.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-depth-visible"));
      return;
    }

    root.classList.add("mmd-depth-booted");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-depth-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: 0.08 });

    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      root.classList.remove("mmd-depth-booted");
    };
  }, []);
}
