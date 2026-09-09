import { Link } from "wouter";
import { ArrowRight, Crown, Heart, Sparkles, Users } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const VALUES = [
  {
    title: "Présence",
    text: "Mettre en lumière une personnalité, une histoire et une manière d’être — pas seulement une image.",
    icon: Crown,
  },
  {
    title: "Humain",
    text: "Créer des rencontres, des souvenirs et une aventure qui continue bien au-delà d’une soirée.",
    icon: Heart,
  },
  {
    title: "Collectif",
    text: "Réunir candidats, bénévoles, partenaires, public et acteurs locaux autour d’un même événement.",
    icon: Users,
  },
];

const TIMELINE = [
  {
    year: "2002",
    title: "Les premières éditions",
    text: "Miss & Mister Dour s’inscrit dans une histoire locale portée par STARLIGHT ASBL et par l’envie de créer un rendez-vous fédérateur à Dour.",
  },
  {
    year: "2002—2025",
    title: "Une histoire qui se construit",
    text: "Les éditions, les candidats et les partenaires se succèdent. Cette mémoire fait désormais partie intégrante de l’expérience digitale du concours.",
  },
  {
    year: "2026",
    title: "Le virage connecté",
    text: "Le site, les profils, la galerie et les outils numériques deviennent un prolongement de l’événement et de sa communauté.",
  },
  {
    year: "2027",
    title: "Digital Experience",
    text: "Une nouvelle direction éditoriale : plus immersive, plus mobile, plus cohérente, tout en gardant l’humain au centre.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="À propos — Miss & Mister Dour 2027"
        description="Découvrez l’histoire, les valeurs et la vision de Miss & Mister Dour, événement porté par STARLIGHT ASBL à Dour."
        url="https://missetmisterdour.be/about"
        tags={["Miss Mister Dour", "STARLIGHT ASBL", "Dour", "histoire", "édition 2027"]}
      />

      <header className="hidden" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden px-4 py-24 md:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(217,185,120,.12),transparent_34%),radial-gradient(circle_at_85%_72%,rgba(106,70,48,.1),transparent_32%)]" />
          <div className="relative mx-auto max-w-6xl">
            <span className="mmd-page-kicker">02 · L’histoire</span>
            <div className="mt-7 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[.94] tracking-[-.055em] md:text-7xl lg:text-8xl">
                  Plus qu’une élection. <em className="font-light text-[#d9b978]">Une aventure humaine.</em>
                </h1>
              </div>
              <p className="max-w-xl text-base leading-8 text-white/50 lg:justify-self-end">
                Miss & Mister Dour est un rendez-vous qui met des personnalités en lumière et rassemble une communauté autour d’une expérience locale, scénique et digitale.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[.018] px-4 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[.85fr_1.15fr] md:items-center">
            <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-[#d9b978]/18 bg-[#0d0d0e] p-8 md:min-h-[460px]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(217,185,120,.15),transparent_34%)]" />
              <div className="relative flex h-full min-h-[300px] items-center justify-center">
                <img
                  src={BRANDING.logoIdentity}
                  alt="Logo officiel Miss & Mister Dour"
                  className="w-full max-w-[330px] object-contain drop-shadow-[0_0_30px_rgba(217,185,120,.17)]"
                />
              </div>
            </div>

            <div className="md:pl-8">
              <span className="mmd-page-kicker">Identité</span>
              <h2 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-.045em] md:text-6xl">
                Dour dans le nom. <span className="text-[#d9b978]">L’humain dans l’expérience.</span>
              </h2>
              <div className="mt-7 space-y-5 text-sm leading-7 text-white/50 md:text-base md:leading-8">
                <p>
                  Le concours ne se limite pas au moment du couronnement. Il commence avec une candidature, se construit au fil des rencontres et laisse derrière lui des images, des liens et des souvenirs.
                </p>
                <p>
                  La plateforme digitale sert cette histoire : elle rassemble les profils, la galerie, les archives et les partenaires sans transformer l’événement en simple produit technologique.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-18 md:py-24">
          <div className="mx-auto max-w-6xl">
            <span className="mmd-page-kicker">Nos valeurs</span>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {VALUES.map(({ title, text, icon: Icon }, index) => (
                <article key={title} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[.025] p-7 md:p-8">
                  <span className="absolute right-5 top-4 text-5xl font-semibold text-white/[.025]">0{index + 1}</span>
                  <Icon className="h-6 w-6 text-[#d9b978]" />
                  <h3 className="mt-8 text-2xl font-semibold">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/46">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[.018] px-4 py-18 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-[.7fr_1.3fr] md:items-end">
              <div>
                <span className="mmd-page-kicker">Mémoire</span>
                <h2 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-.045em] md:text-6xl">Une histoire qui ne s’efface pas.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/45 md:justify-self-end">
                Les anciennes éditions ont leur place dans le site 2027. Les palmarès seront complétés à partir des archives officielles, sans inventer les informations manquantes.
              </p>
            </div>

            <div className="mt-12 grid gap-3">
              {TIMELINE.map((entry) => (
                <article key={entry.year} className="grid gap-5 rounded-[24px] border border-white/8 bg-[#111214] p-6 md:grid-cols-[180px_1fr] md:items-center md:p-7">
                  <strong className="text-3xl tracking-[-.04em] text-[#d9b978] md:text-4xl">{entry.year}</strong>
                  <div>
                    <h3 className="text-xl font-semibold md:text-2xl">{entry.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-white/43">{entry.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <a href="/#archives" className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#d9b978]">
              Voir le palmarès sur l’accueil <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="px-4 py-18 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[30px] border border-[#d9b978]/18 bg-[linear-gradient(145deg,rgba(217,185,120,.08),rgba(255,255,255,.02))] p-8 md:p-10">
                <Sparkles className="h-6 w-6 text-[#d9b978]" />
                <span className="mt-8 block text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b978]">Organisation</span>
                <h2 className="mt-3 text-3xl font-semibold">STARLIGHT ASBL</h2>
                <p className="mt-4 text-sm leading-7 text-white/48">
                  L’organisation porte l’événement, sa programmation, son parcours humain et ses relations avec les candidats et partenaires.
                </p>
              </article>
              <article className="rounded-[30px] border border-white/10 bg-white/[.025] p-8 md:p-10">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-[#d9b978]/18 bg-black text-sm font-bold text-[#d9b978]">JS</div>
                <span className="mt-8 block text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b978]">Expérience digitale</span>
                <h2 className="mt-3 text-3xl font-semibold">JS-Innov.IA®</h2>
                <p className="mt-4 text-sm leading-7 text-white/48">
                  La technologie accompagne la navigation, les contenus et les outils du projet avec une présence volontairement discrète au service de l’événement.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 pt-8 md:pb-32">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-[#d9b978]/22 bg-[linear-gradient(135deg,rgba(217,185,120,.12),rgba(255,255,255,.02))] p-8 md:p-14">
            <span className="mmd-page-kicker">Édition 2027</span>
            <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <h2 className="max-w-4xl text-4xl font-semibold leading-[1] tracking-[-.045em] md:text-6xl">La prochaine histoire est encore à écrire.</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/inscription-candidat" className="rounded-full bg-[#d9b978] px-6 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-black">Candidater</Link>
                <Link href="/candidates" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-6 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-white/65 hover:border-[#d9b978]/35 hover:text-[#d9b978]">Découvrir <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
