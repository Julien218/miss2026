import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((value) => ({ ...value, [event.target.name]: event.target.value }));
    if (state === "error") { setState("idle"); setError(""); }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || "Votre message n’a pas pu être envoyé.");
      setState("sent");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (cause) {
      setState("error");
      setError(cause instanceof Error ? cause.message : "Votre message n’a pas pu être envoyé.");
    }
  };

  return <div className="mmd-public-page">
    <SEOHead title="Contact — Miss & Mister Dour 2027" description="Contactez l'équipe Miss & Mister Dour pour une candidature, un partenariat, la presse ou toute autre demande." url="https://missetmisterdour.be/contact" />
    <section className="mmd-public-hero"><div className="mmd-container">
      <div className="mmd-public-kicker"><span>CONTACT</span><i/>PARLONS-NOUS</div>
      <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark"/>
      <h1>Une question ? <em>Écrivez-nous.</em></h1>
      <p>Candidature, partenariat, presse ou organisation : votre demande arrive directement dans le cockpit de l’équipe.</p>
    </div></section>

    <section className="mmd-section"><div className="mmd-container mmd-contact-layout">
      <form className="mmd-contact-form" onSubmit={handleSubmit}>
        <span className="mmd-overline">VOTRE MESSAGE</span><h2>Nous contacter</h2>
        {state === "sent" && <div className="mmd-form-success" role="status"><CheckCircle2/><div><strong>Message reçu.</strong><span>Votre demande a été enregistrée dans le cockpit de l’équipe.</span></div></div>}
        <div className="mmd-form-grid"><label>Nom complet<input name="name" required minLength={2} maxLength={150} autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Votre nom"/></label><label>Email<input type="email" name="email" required maxLength={320} autoComplete="email" value={formData.email} onChange={handleChange} placeholder="vous@exemple.be"/></label></div>
        <label>Sujet<select name="subject" required value={formData.subject} onChange={handleChange}><option value="">Choisir</option><option value="Candidature 2027">Candidature 2027</option><option value="Partenariat / sponsoring">Partenariat / sponsoring</option><option value="Presse">Presse</option><option value="Organisation">Organisation</option><option value="Autre">Autre</option></select></label>
        <label>Message<textarea name="message" required minLength={10} maxLength={5000} rows={7} value={formData.message} onChange={handleChange} placeholder="Votre message…"/></label>
        {state === "error" && <div className="mmd-form-submit-error" role="alert">{error}</div>}
        <button type="submit" disabled={state === "sending"}>{state === "sending" ? <><Loader2 className="animate-spin"/>Envoi…</> : <><Send/>Envoyer au cockpit</>}</button>
        <p className="mmd-form-help">Après validation, la demande est enregistrée dans les notifications administrateur. Vous pouvez aussi utiliser l’email ou le téléphone ci-contre.</p>
      </form>

      <aside className="mmd-contact-aside"><span className="mmd-overline">ÉQUIPE</span><h2>Miss & Mister <em>Dour.</em></h2><div className="mmd-contact-cards">
        <a href={`mailto:${BRANDING.contact.email}`}><Mail/><div><small>Email</small><strong>{BRANDING.contact.email}</strong></div></a>
        <a href={`tel:${BRANDING.contact.phone.replace(/\s/g,"")}`}><Phone/><div><small>Téléphone</small><strong>{BRANDING.contact.phone}</strong></div></a>
        <div><MapPin/><div><small>Organisation</small><strong>{BRANDING.contact.organizer}</strong><span>{BRANDING.contact.address}</span></div></div>
      </div><div className="mmd-contact-note"><MessageCircle/><p>La date, l’heure et le lieu précis de l’édition 2027 seront communiqués dès confirmation officielle.</p></div></aside>
    </div></section>

    <section className="mmd-section"><div className="mmd-container"><div className="mmd-section-heading"><h2>Accès <em>rapides.</em></h2></div><div className="mmd-contact-links"><Link href="/inscription-candidat">Candidater 2027 <ArrowRight/></Link><Link href="/sponsors">Devenir partenaire <ArrowRight/></Link><Link href="/press">Espace presse <ArrowRight/></Link></div></div></section>
  </div>;
}
