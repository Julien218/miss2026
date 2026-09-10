import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const DRAFT_KEY = "mmd_candidate_2027_draft_v1";
const TOTAL_STEPS = 4;

type Category = "miss" | "mister" | "";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  category: Category;
  photo: File | null;
  photoPreview: string;
  bio: string;
  motivation: string;
  interests: string;
  profession: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  acceptRules: boolean;
  acceptMedia: boolean;
  acceptNewsletter: boolean;
  acceptCGU: boolean;
};

const EMPTY: FormState = {
  firstName: "", lastName: "", email: "", phone: "", birthDate: "", city: "", category: "",
  photo: null, photoPreview: "", bio: "", motivation: "", interests: "", profession: "",
  instagram: "", facebook: "", tiktok: "", linkedin: "",
  acceptRules: false, acceptMedia: false, acceptNewsletter: false, acceptCGU: false,
};

const STEP_LABELS = ["Vous", "Votre histoire", "Vos réseaux", "Validation"];

function ageFromDate(value: string) {
  if (!value) return -1;
  const birth = new Date(`${value}T00:00:00`);
  const today = new Date();
  if (Number.isNaN(birth.getTime())) return -1;
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Impossible de lire la photo"));
    reader.readAsDataURL(file);
  });
}

export default function CandidateRegistration() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<FormState>;
      setForm((current) => ({
        ...current,
        ...saved,
        photo: null,
        photoPreview: "",
        acceptRules: false,
        acceptMedia: false,
        acceptCGU: false,
      }));
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const { photo: _photo, photoPreview: _preview, acceptRules: _rules, acceptMedia: _media, acceptCGU: _cgu, ...draft } = form;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [form]);

  const progress = `${Math.round((step / TOTAL_STEPS) * 100)}%`;
  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Votre candidature";
  const interests = useMemo(
    () => form.interests.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20),
    [form.interests]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, photo: "Choisissez un fichier image." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, photo: "La photo ne peut pas dépasser 5 Mo." }));
      return;
    }
    if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
    update("photo", file);
    update("photoPreview", URL.createObjectURL(file));
  };

  useEffect(() => () => {
    if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
  }, [form.photoPreview]);

  function validate(targetStep = step) {
    const next: Record<string, string> = {};
    if (targetStep === 1) {
      if (form.firstName.trim().length < 2) next.firstName = "Prénom requis.";
      if (form.lastName.trim().length < 2) next.lastName = "Nom requis.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Adresse email invalide.";
      if (!/^(\+32|0)[0-9]{8,9}$/.test(form.phone.replace(/[\s./-]/g, ""))) next.phone = "Numéro belge invalide.";
      const age = ageFromDate(form.birthDate);
      if (age < 18 || age > 35) next.birthDate = "L’inscription est ouverte de 18 à 35 ans.";
      if (form.city.trim().length < 2) next.city = "Ville requise.";
      if (!form.category) next.category = "Choisissez Miss ou Mister.";
    }
    if (targetStep === 2) {
      if (!form.photo) next.photo = "Ajoutez votre photo principale.";
      if (form.bio.trim().length < 100 || form.bio.trim().length > 500) next.bio = "Votre présentation doit contenir entre 100 et 500 caractères.";
      if (form.motivation.trim().length < 50) next.motivation = "Expliquez votre motivation en au moins 50 caractères.";
      if (form.profession.trim().length < 2) next.profession = "Indiquez votre profession ou vos études.";
    }
    if (targetStep === 4) {
      if (!form.acceptRules) next.acceptRules = "Le règlement doit être accepté.";
      if (!form.acceptMedia) next.acceptMedia = "L’autorisation média est requise pour participer.";
      if (!form.acceptCGU) next.acceptCGU = "Les CGU et la politique de confidentialité doivent être acceptées.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const nextStep = () => {
    if (!validate(step)) return;
    setStep((value) => Math.min(TOTAL_STEPS, value + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previousStep = () => {
    setErrors({});
    setStep((value) => Math.max(1, value - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!validate(4) || !form.photo) return;
    setSubmitting(true);
    setErrors({});
    try {
      const photoBase64 = await fileToDataUrl(form.photo);
      const response = await fetch("/api/public/candidate-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/[\s./-]/g, ""),
          birthDate: form.birthDate,
          city: form.city.trim(),
          category: form.category,
          photoBase64,
          photoFilename: form.photo.name || "photo.jpg",
          bio: form.bio.trim(),
          motivation: form.motivation.trim(),
          interests,
          profession: form.profession.trim(),
          instagram: form.instagram.trim(),
          facebook: form.facebook.trim(),
          tiktok: form.tiktok.trim(),
          linkedin: form.linkedin.trim(),
          acceptRules: form.acceptRules,
          acceptMedia: form.acceptMedia,
          acceptNewsletter: form.acceptNewsletter,
          acceptCGU: form.acceptCGU,
          consentVersion: "v1.0",
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || "La candidature n’a pas pu être envoyée.");
      localStorage.removeItem(DRAFT_KEY);
      navigate("/inscription-merci");
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Impossible d’envoyer la candidature." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mmd-public-page mmd-registration-page">
      <SEOHead
        title="Candidature 2027 — Miss & Mister Dour"
        description="Envoyez votre candidature officielle pour Miss & Mister Dour 2027. Parcours sécurisé, photo, présentation et validation en ligne."
        url="https://missetmisterdour.be/inscription-candidat"
        tags={["candidature Miss Dour 2027", "inscription Mister Dour 2027", "concours Dour Hainaut"]}
      />

      <section className="mmd-registration-hero">
        <div className="mmd-container mmd-registration-hero-grid">
          <div>
            <div className="mmd-public-kicker"><span>2027</span><i />CANDIDATURE</div>
            <h1>Votre histoire commence <em>ici.</em></h1>
            <p>Quatre étapes simples. Votre dossier reste privé jusqu’à validation par l’équipe Miss & Mister Dour.</p>
          </div>
          <div className="mmd-registration-trust">
            <ShieldCheck />
            <div><strong>Dossier sécurisé</strong><span>Photo stockée sur l’infrastructure média du concours · validation humaine avant publication</span></div>
          </div>
        </div>
      </section>

      <section className="mmd-registration-stage">
        <div className="mmd-container mmd-registration-layout">
          <aside className="mmd-registration-progress" aria-label={`Étape ${step} sur ${TOTAL_STEPS}`}>
            <Link href="/" className="mmd-registration-back"><ArrowLeft /> Retour</Link>
            <div className="mmd-progress-track"><i style={{ width: progress }} /></div>
            <strong>{String(step).padStart(2, "0")} / 04</strong>
            <nav>{STEP_LABELS.map((label, index) => <button type="button" key={label} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-done" : ""} disabled={index + 1 > step} onClick={() => index + 1 < step && setStep(index + 1)}><span>{step > index + 1 ? <Check /> : String(index + 1).padStart(2, "0")}</span>{label}</button>)}</nav>
            <small>Votre brouillon texte est conservé sur cet appareil jusqu’à l’envoi.</small>
          </aside>

          <div className="mmd-registration-card">
            <AnimatePresence mode="wait">
              {step === 1 && <motion.div key="step-1" className="mmd-registration-step" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <header><UserRound /><div><span>ÉTAPE 01</span><h2>Faisons connaissance.</h2><p>Ces informations servent uniquement à identifier et contacter le candidat.</p></div></header>
                <div className="mmd-form-two"><Field label="Prénom" error={errors.firstName}><input autoComplete="given-name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></Field><Field label="Nom" error={errors.lastName}><input autoComplete="family-name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></Field></div>
                <div className="mmd-form-two"><Field label="Email" error={errors.email} icon={<Mail />}><input type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field><Field label="Téléphone" error={errors.phone} icon={<Phone />}><input type="tel" inputMode="tel" autoComplete="tel" placeholder="0470 00 00 00" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field></div>
                <div className="mmd-form-two"><Field label="Date de naissance" error={errors.birthDate}><input type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} /></Field><Field label="Ville" error={errors.city} icon={<MapPin />}><input autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} /></Field></div>
                <fieldset className={`mmd-choice-field ${errors.category ? "has-error" : ""}`}><legend>Je candidate dans la catégorie</legend><div><button type="button" className={form.category === "miss" ? "is-active" : ""} onClick={() => update("category", "miss")}>Miss</button><button type="button" className={form.category === "mister" ? "is-active" : ""} onClick={() => update("category", "mister")}>Mister</button></div>{errors.category && <small>{errors.category}</small>}</fieldset>
              </motion.div>}

              {step === 2 && <motion.div key="step-2" className="mmd-registration-step" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <header><Sparkles /><div><span>ÉTAPE 02</span><h2>Ce qui vous rend unique.</h2><p>Présentez votre personnalité. Le texte pourra être retravaillé avec vous avant publication.</p></div></header>
                <label className={`mmd-photo-upload ${form.photoPreview ? "has-photo" : ""} ${errors.photo ? "has-error" : ""}`}>
                  <input type="file" accept="image/*" onChange={handlePhoto} />
                  {form.photoPreview ? <img src={form.photoPreview} alt="Aperçu de votre photo" /> : <div><Camera /><strong>Ajouter votre photo principale</strong><span>JPG, PNG, WebP ou photo mobile · 5 Mo maximum</span></div>}
                  <span className="mmd-photo-action"><Upload /> {form.photoPreview ? "Changer la photo" : "Choisir une photo"}</span>
                  {errors.photo && <small>{errors.photo}</small>}
                </label>
                <Field label="Profession ou études" error={errors.profession}><input value={form.profession} onChange={(e) => update("profession", e.target.value)} /></Field>
                <Field label="Votre présentation" hint={`${form.bio.length}/500`} error={errors.bio}><textarea rows={5} maxLength={500} placeholder="Qui êtes-vous, ce qui vous anime, ce que vous aimez…" value={form.bio} onChange={(e) => update("bio", e.target.value)} /></Field>
                <Field label="Pourquoi souhaitez-vous participer ?" error={errors.motivation}><textarea rows={4} value={form.motivation} onChange={(e) => update("motivation", e.target.value)} /></Field>
                <Field label="Centres d’intérêt" hint="séparés par des virgules"><input placeholder="Danse, sport, mode, bénévolat…" value={form.interests} onChange={(e) => update("interests", e.target.value)} /></Field>
              </motion.div>}

              {step === 3 && <motion.div key="step-3" className="mmd-registration-step" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <header><Instagram /><div><span>ÉTAPE 03</span><h2>Vos réseaux, si vous le souhaitez.</h2><p>Cette étape est facultative. Ajoutez uniquement les comptes que vous acceptez d’associer à votre profil public.</p></div></header>
                <Field label="Instagram"><input inputMode="url" placeholder="@votrecompte ou URL" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} /></Field>
                <Field label="Facebook"><input inputMode="url" placeholder="Nom du profil ou URL" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} /></Field>
                <Field label="TikTok"><input inputMode="url" placeholder="@votrecompte" value={form.tiktok} onChange={(e) => update("tiktok", e.target.value)} /></Field>
                <Field label="LinkedIn"><input inputMode="url" placeholder="URL du profil" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} /></Field>
                <div className="mmd-registration-optional-note"><ShieldCheck /><span>Vous pourrez demander une modification ou un retrait de ces liens à l’équipe.</span></div>
              </motion.div>}

              {step === 4 && <motion.div key="step-4" className="mmd-registration-step" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <header><Check /><div><span>ÉTAPE 04</span><h2>Dernière vérification.</h2><p>Votre candidature ne sera pas publiée automatiquement : l’équipe l’examine d’abord dans le cockpit.</p></div></header>
                <div className="mmd-registration-summary">{form.photoPreview && <img src={form.photoPreview} alt="" />}<div><small>{form.category || "Candidat"} · Édition 2027</small><h3>{fullName}</h3><p>{form.city}{form.profession ? ` · ${form.profession}` : ""}</p></div></div>
                <Consent checked={form.acceptRules} onChange={(value) => update("acceptRules", value)} error={errors.acceptRules}>J’ai lu et j’accepte le règlement de participation.</Consent>
                <Consent checked={form.acceptMedia} onChange={(value) => update("acceptMedia", value)} error={errors.acceptMedia}>J’autorise l’utilisation des photos et vidéos dans le cadre de Miss & Mister Dour, conformément aux conditions indiquées.</Consent>
                <Consent checked={form.acceptCGU} onChange={(value) => update("acceptCGU", value)} error={errors.acceptCGU}>J’accepte les <Link href="/legal/cgu">CGU</Link> et la <Link href="/legal/privacy">politique de confidentialité</Link>.</Consent>
                <Consent checked={form.acceptNewsletter} onChange={(value) => update("acceptNewsletter", value)}>Je souhaite recevoir les actualités de l’événement (facultatif).</Consent>
                {errors.submit && <div className="mmd-form-submit-error" role="alert">{errors.submit}</div>}
              </motion.div>}
            </AnimatePresence>

            <footer className="mmd-registration-actions">
              {step > 1 ? <button type="button" className="mmd-registration-prev" onClick={previousStep} disabled={submitting}><ChevronLeft /> Retour</button> : <span />}
              {step < TOTAL_STEPS ? <button type="button" className="mmd-primary-button" onClick={nextStep}>Continuer <ArrowRight /></button> : <button type="button" className="mmd-primary-button" onClick={submit} disabled={submitting}>{submitting ? <><Loader2 className="animate-spin" /> Envoi sécurisé…</> : <>Envoyer ma candidature <ArrowRight /></>}</button>}
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, error, hint, icon, children }: { label: string; error?: string; hint?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return <label className={`mmd-modern-field ${error ? "has-error" : ""}`}><span>{label}{hint && <small>{hint}</small>}</span><div>{icon}{children}</div>{error && <em>{error}</em>}</label>;
}

function Consent({ checked, onChange, error, children }: { checked: boolean; onChange: (value: boolean) => void; error?: string; children: React.ReactNode }) {
  return <label className={`mmd-consent-row ${error ? "has-error" : ""}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="mmd-consent-check">{checked && <Check />}</span><span>{children}{error && <em>{error}</em>}</span></label>;
}
