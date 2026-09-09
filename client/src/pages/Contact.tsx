import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

const SUBJECT_LABELS: Record<string, string> = {
  candidature: "Candidature 2027",
  partenariat: "Partenariat / Sponsoring",
  presse: "Demande presse",
  technique: "Question technique",
  autre: "Autre demande",
};

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [handoffReady, setHandoffReady] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const subjectLabel = SUBJECT_LABELS[formData.subject] || "Contact";
    const subject = encodeURIComponent(`[Miss & Mister Dour] ${subjectLabel} — ${formData.name}`);
    const body = encodeURIComponent(
      `Nom : ${formData.name}\nEmail : ${formData.email}\nSujet : ${subjectLabel}\n\n${formData.message}`
    );

    setHandoffReady(true);
    window.location.href = `mailto:${BRANDING.contact.email}?subject=${subject}&body=${body}`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setHandoffReady(false);
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Contact — Miss & Mister Dour 2027"
        description="Candidature, partenariat, presse ou question : contactez l’équipe Miss & Mister Dour."
        url="https://missetmisterdour.be/contact"
        tags={["contact Miss Mister Dour", "sponsor Dour", "candidature 2027"]}
      />

      <header className="hidden" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden px-4 py-24 md:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(217,185,120,.12),transparent_34%),radial-gradient(circle_at_84%_70%,rgba(106,70,48,.1),transparent_32%)]" />
          <div className="relative mx-auto max-w-6xl">
            <span className="mmd-page-kicker">Contact</span>
            <div className="mt-7 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[.94] tracking-[-.055em] md:text-7xl lg:text-8xl">
                  Parlons de la prochaine <em className="font-light text-[#d9b978]">étape.</em>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-white/52">
                  Une candidature, un partenariat, une demande presse ou une question : choisissez le bon sujet et préparez votre message.
                </p>
              </div>
              <MessageCircle className="hidden h-20 w-20 text-[#d9b978]/30 lg:block lg:justify-self-end" />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[.018] px-4 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-[30px] border border-[#d9b978]/18 bg-[#111214] p-6 md:p-9">
              <span className="mmd-page-kicker">Votre message</span>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Préparer la demande</h2>
              <p className="mt-3 text-sm leading-7 text-white/42">
                À l’envoi, votre application de messagerie s’ouvrira avec le message prérempli. Rien n’est annoncé comme envoyé tant que vous ne l’avez pas réellement expédié.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2 text-xs font-medium text-white/55">
                    Nom complet
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Votre nom"
                      className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/25"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-medium text-white/55">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="votre@email.com"
                      className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/25"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-xs font-medium text-white/55">
                  Sujet
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="candidature">Candidature 2027</option>
                    <option value="partenariat">Partenariat / Sponsoring</option>
                    <option value="presse">Demande presse</option>
                    <option value="technique">Question technique</option>
                    <option value="autre">Autre</option>
                  </select>
                </label>

                <label className="grid gap-2 text-xs font-medium text-white/55">
                  Message
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={7}
                    placeholder="Votre message…"
                    className="resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white placeholder:text-white/25"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d9b978] px-6 text-[10px] font-bold uppercase tracking-[.1em] text-black"
                >
                  Ouvrir ma messagerie <Send className="h-4 w-4" />
                </button>

                {handoffReady && (
                  <p className="text-xs leading-6 text-[#d9b978]">
                    Votre messagerie a été appelée avec le message prérempli. Vérifiez-le puis envoyez-le depuis votre application email.
                  </p>
                )}
              </form>
            </div>

            <div className="grid content-start gap-4">
              <article className="rounded-[26px] border border-white/10 bg-[#111214] p-6">
                <Mail className="h-5 w-5 text-[#d9b978]" />
                <span className="mt-6 block text-[9px] font-bold uppercase tracking-[.18em] text-white/35">Email</span>
                <a href={`mailto:${BRANDING.contact.email}`} className="mt-2 block break-all text-lg font-semibold text-white hover:text-[#d9b978]">
                  {BRANDING.contact.email}
                </a>
              </article>

              <article className="rounded-[26px] border border-white/10 bg-[#111214] p-6">
                <Phone className="h-5 w-5 text-[#d9b978]" />
                <span className="mt-6 block text-[9px] font-bold uppercase tracking-[.18em] text-white/35">Téléphone</span>
                <a href={`tel:${BRANDING.contact.phone.replace(/\s/g, "")}`} className="mt-2 block text-lg font-semibold text-white hover:text-[#d9b978]">
                  {BRANDING.contact.phone}
                </a>
              </article>

              <article className="rounded-[26px] border border-white/10 bg-[#111214] p-6">
                <MapPin className="h-5 w-5 text-[#d9b978]" />
                <span className="mt-6 block text-[9px] font-bold uppercase tracking-[.18em] text-white/35">Organisation</span>
                <strong className="mt-2 block text-lg">{BRANDING.contact.organizer}</strong>
                <p className="mt-2 text-sm leading-6 text-white/42">{BRANDING.contact.address}</p>
              </article>

              <Link
                href="/sponsors"
                className="group rounded-[26px] border border-[#d9b978]/20 bg-[linear-gradient(145deg,rgba(217,185,120,.09),rgba(255,255,255,.02))] p-6"
              >
                <Sparkles className="h-5 w-5 text-[#d9b978]" />
                <span className="mt-6 block text-[9px] font-bold uppercase tracking-[.18em] text-[#d9b978]">Partenariat</span>
                <strong className="mt-2 block text-xl">Découvrir l’espace sponsors</strong>
                <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-white/45 group-hover:text-[#d9b978]">
                  Voir les partenaires <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-18 md:py-24">
          <div className="mx-auto max-w-4xl">
            <span className="mmd-page-kicker">Questions fréquentes</span>
            <div className="mt-8 grid gap-3">
              <details className="group rounded-[22px] border border-white/10 bg-white/[.025] p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">Comment devenir candidat ?</summary>
                <p className="mt-4 text-sm leading-7 text-white/45">
                  Utilisez la <Link href="/inscription-candidat" className="text-[#d9b978]">page d’inscription 2027</Link>. Les dates officielles seront affichées dès validation par le comité.
                </p>
              </details>
              <details className="group rounded-[22px] border border-white/10 bg-white/[.025] p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">Comment devenir sponsor ?</summary>
                <p className="mt-4 text-sm leading-7 text-white/45">
                  Consultez l’<Link href="/sponsors" className="text-[#d9b978]">espace partenaires</Link>, puis sélectionnez « Partenariat / Sponsoring » dans le formulaire ci-dessus.
                </p>
              </details>
              <details className="group rounded-[22px] border border-white/10 bg-white/[.025] p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">Où et quand aura lieu l’édition 2027 ?</summary>
                <p className="mt-4 text-sm leading-7 text-white/45">
                  La date, l’heure et le lieu seront publiés uniquement après confirmation officielle. Le site n’affiche plus les anciennes informations 2026 comme si elles étaient encore actuelles.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
