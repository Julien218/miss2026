import { Link } from "wouter";
import { ArrowRight, Handshake, Sparkles } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";
import { FOUNDING_PARTNERS, HISTORICAL_SPONSORS } from "@/data/sponsors";

function SponsorMonogram({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="grid h-11 w-11 place-items-center rounded-full border border-[#d9b978]/25 bg-black text-[11px] font-bold tracking-[.08em] text-[#d9b978]">
      {letters || "MMD"}
    </span>
  );
}

export default function Sponsors() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Sponsors & Partenaires — Miss & Mister Dour 2027"
        description="Découvrez les partenaires de Miss & Mister Dour et les entreprises qui ont accompagné les précédentes éditions."
        url="https://missetmisterdour.be/sponsors"
        tags={["sponsors Miss Mister Dour", "partenaires Dour", "sponsor événement Dour"]}
      />

      <header className="hidden" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden px-4 py-24 md:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(217,185,120,.13),transparent_34%),radial-gradient(circle_at_82%_65%,rgba(111,72,47,.12),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl">
            <span className="mmd-page-kicker">08 · Partenaires</span>
            <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[.94] tracking-[-.055em] md:text-7xl lg:text-8xl">
                  Ceux qui font vivre <em className="font-light text-[#d9b978]">l’aventure.</em>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-white/55 md:text-lg">
                  Miss & Mister Dour grandit grâce aux partenaires qui partagent une même envie :
                  créer une expérience locale forte, visible et mémorable.
                </p>
              </div>

              <div className="rounded-[28px] border border-[#d9b978]/18 bg-white/[.035] p-6 md:p-8">
                <Handshake className="h-7 w-7 text-[#d9b978]" />
                <h2 className="mt-6 text-2xl font-semibold">Devenir partenaire 2027</h2>
                <p className="mt-3 text-sm leading-7 text-white/50">
                  Visibilité digitale, présence événementielle et activations peuvent être adaptées au partenariat.
                </p>
                <Link
                  href="/contact"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#d9b978] px-5 py-3 text-xs font-bold uppercase tracking-[.08em] text-black"
                >
                  Nous contacter <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="mmd-page-kicker">Écosystème</span>
                <h2 className="mt-5 text-3xl font-semibold md:text-5xl">Organisation & expérience</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-white/45">
                L’événement reste la marque centrale. La technologie accompagne l’expérience sans prendre sa place.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <article className="relative overflow-hidden rounded-[30px] border border-[#d9b978]/20 bg-white/[.04] p-8 md:p-10">
                <div className="absolute right-[-30px] top-[-20px] h-36 w-36 rounded-full bg-[#d9b978]/10 blur-3xl" />
                <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="h-24 w-auto max-w-[220px] object-contain object-left" />
                <span className="mt-8 block text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b978]">Organisation</span>
                <strong className="mt-2 block text-2xl">STARLIGHT ASBL</strong>
              </article>

              <article className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[.025] p-8 md:p-10">
                <div className="grid h-20 w-20 place-items-center rounded-2xl border border-[#d9b978]/20 bg-black text-2xl font-bold text-[#d9b978]">JS</div>
                <span className="mt-8 block text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b978]">Expérience digitale</span>
                <strong className="mt-2 block text-2xl">JS-Innov.IA®</strong>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[.018] px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
              <div>
                <span className="mmd-page-kicker">Mémoire · édition 2026</span>
                <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-5xl">
                  Nos partenaires ne disparaissent pas avec une nouvelle édition.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-white/48 lg:justify-self-end">
                Ce répertoire a été restauré depuis l’ancienne version du site. Les anciens logos seront
                réassociés lorsqu’ils sont disponibles dans le stockage public ; les noms restent déjà
                conservés et visibles dans l’histoire de l’événement.
              </p>
            </div>

            <div className="mt-12 mmd-sponsor-wall">
              {HISTORICAL_SPONSORS.map((sponsor) => (
                <article key={sponsor.name} className="mmd-sponsor-tile group">
                  <div className="flex w-full flex-col items-center justify-center gap-3 text-center">
                    <SponsorMonogram name={sponsor.name} />
                    <strong className="text-xs font-semibold leading-5 text-[#141414] md:text-sm">{sponsor.name}</strong>
                    <span className="text-[9px] font-bold uppercase tracking-[.16em] text-black/35">Partenaire 2026</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:py-28">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-[#d9b978]/22 bg-[linear-gradient(135deg,rgba(217,185,120,.12),rgba(255,255,255,.025))] p-8 md:p-14">
            <Sparkles className="h-6 w-6 text-[#d9b978]" />
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[.22em] text-[#d9b978]">Édition 2027</span>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] md:text-6xl">
                  Associez votre image à une expérience qui vit avant, pendant et après l’événement.
                </h2>
              </div>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d9b978]/45 px-6 text-xs font-bold uppercase tracking-[.08em] text-[#f5efe5] hover:bg-[#d9b978] hover:text-black"
              >
                Parler du partenariat <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
