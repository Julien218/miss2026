import { Link } from "wouter";
import { ArrowRight, Copyright, Download, FileText, Image, Mail, Newspaper } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const PRESS_EMAIL = "presse@miss-mister-dour.be";

export default function Press() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Presse — Miss & Mister Dour 2027"
        description="Ressources officielles, logo, galerie et contact presse de Miss & Mister Dour 2027."
        url="https://missetmisterdour.be/press"
        tags={["presse Miss Dour", "Miss Mister Dour 2027", "accréditation presse Dour"]}
      />

      <header className="hidden" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden px-4 py-24 md:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(217,185,120,.12),transparent_34%),radial-gradient(circle_at_82%_70%,rgba(105,69,47,.1),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl">
            <span className="mmd-page-kicker">Presse & médias</span>
            <div className="mt-7 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[.94] tracking-[-.055em] md:text-7xl lg:text-8xl">
                  Les ressources <em className="font-light text-[#d9b978]">officielles.</em>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-white/52">
                  Logos, images et informations utiles pour présenter Miss & Mister Dour avec une identité cohérente.
                </p>
              </div>
              <div className="rounded-[28px] border border-[#d9b978]/18 bg-white/[.03] p-7">
                <Newspaper className="h-7 w-7 text-[#d9b978]" />
                <span className="mt-6 block text-[10px] font-bold uppercase tracking-[.2em] text-[#d9b978]">Contact média</span>
                <a href={`mailto:${PRESS_EMAIL}`} className="mt-3 block break-all text-lg font-semibold text-white hover:text-[#d9b978]">
                  {PRESS_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[.018] px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <span className="mmd-page-kicker">Kit presse</span>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <a
                href={BRANDING.logoIdentity}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[28px] border border-[#d9b978]/18 bg-[#111214] p-7 hover:border-[#d9b978]/40"
              >
                <Image className="h-7 w-7 text-[#d9b978]" />
                <h2 className="mt-8 text-2xl font-semibold">Logo officiel</h2>
                <p className="mt-3 text-sm leading-7 text-white/45">Identité Miss & Mister Dour utilisée sur l’ensemble de l’expérience 2027.</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#d9b978]">
                  Ouvrir le fichier <Download className="h-4 w-4" />
                </span>
              </a>

              <Link
                href="/gallery"
                className="group rounded-[28px] border border-white/10 bg-[#111214] p-7 hover:border-[#d9b978]/35"
              >
                <Image className="h-7 w-7 text-[#d9b978]" />
                <h2 className="mt-8 text-2xl font-semibold">Galerie officielle</h2>
                <p className="mt-3 text-sm leading-7 text-white/45">Portraits, backstage et moments approuvés accessibles dans la galerie connectée.</p>
                <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#d9b978]">
                  Explorer <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <article className="rounded-[28px] border border-white/10 bg-[#111214] p-7">
                <FileText className="h-7 w-7 text-[#d9b978]" />
                <h2 className="mt-8 text-2xl font-semibold">Dossier 2027</h2>
                <p className="mt-3 text-sm leading-7 text-white/45">Le dossier presse 2027 sera publié ici dès validation de la programmation et des informations officielles.</p>
                <span className="mt-8 inline-flex rounded-full border border-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[.12em] text-white/35">
                  En préparation
                </span>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 py-18 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div className="grid min-h-[360px] place-items-center rounded-[30px] border border-[#d9b978]/18 bg-[#0d0d0e] p-8">
              <img
                src={BRANDING.logoIdentity}
                alt="Logo officiel Miss & Mister Dour"
                className="w-full max-w-[330px] object-contain drop-shadow-[0_0_28px_rgba(217,185,120,.16)]"
              />
            </div>
            <div className="lg:pl-8">
              <span className="mmd-page-kicker">Usage de la marque</span>
              <h2 className="mt-5 text-4xl font-semibold leading-[1] tracking-[-.045em] md:text-6xl">Un logo. Une identité. <span className="text-[#d9b978]">Aucune déformation.</span></h2>
              <div className="mt-7 space-y-4 text-sm leading-7 text-white/48">
                <p>Le logo peut être utilisé pour une publication rédactionnelle consacrée à l’événement, en conservant ses proportions, ses couleurs et son intégrité.</p>
                <p>Pour un usage commercial, une campagne sponsorisée ou une modification graphique, une validation préalable de l’organisation reste nécessaire.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[.018] px-4 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 rounded-[30px] border border-white/10 bg-[#111214] p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:p-9">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-[#d9b978]/20 bg-[#d9b978]/7">
                <Mail className="h-5 w-5 text-[#d9b978]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d9b978]">Interview · information · accréditation</span>
                <h2 className="mt-2 text-2xl font-semibold">Une demande média ?</h2>
                <p className="mt-2 text-sm text-white/42">Précisez votre média, le sujet et votre échéance afin que l’équipe puisse vous répondre efficacement.</p>
              </div>
              <a href={`mailto:${PRESS_EMAIL}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d9b978] px-6 text-[10px] font-bold uppercase tracking-[.1em] text-black">
                Écrire à la presse
              </a>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-start gap-4 rounded-[24px] border border-white/8 bg-white/[.02] p-6 text-sm leading-7 text-white/42">
              <Copyright className="mt-1 h-5 w-5 flex-none text-[#d9b978]" />
              <p>
                © {currentYear} Miss & Mister Dour. Les textes, images, vidéos et éléments graphiques restent soumis aux droits de leurs propriétaires et partenaires respectifs. Les ressources fournies ici sont destinées à une utilisation rédactionnelle conforme.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 md:pb-32">
          <div className="mx-auto max-w-6xl rounded-[34px] border border-[#d9b978]/20 bg-[linear-gradient(135deg,rgba(217,185,120,.11),rgba(255,255,255,.02))] p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <span className="mmd-page-kicker">Miss & Mister Dour 2027</span>
                <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-.045em] md:text-6xl">Raconter l’événement avec les bonnes ressources.</h2>
              </div>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[#d9b978]/35 px-6 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#d9b978] hover:bg-[#d9b978] hover:text-black">
                Contact général <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
