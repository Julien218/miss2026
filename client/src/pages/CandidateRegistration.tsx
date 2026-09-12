import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  FileSignature,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  UserRound,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const DRAFT_KEY = "mmd_candidate_2027_draft_v2";
const TOTAL_STEPS = 4;

type Category = "miss" | "mister" | "";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  heightCm: string;
  weightKg: string;
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
  candidateSignatureName: string;
  guardianFullName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianSignatureName: string;
  acceptEligibility: boolean;
  acceptRules: boolean;
  acceptMedia: boolean;
  acceptNewsletter: boolean;
  acceptCGU: boolean;
};

const EMPTY: FormState = {
  firstName: "", lastName: "", email: "", phone: "", birthDate: "", street: "", houseNumber: "", postalCode: "", city: "",
  heightCm: "", weightKg: "", category: "",
  photo: null, photoPreview: "", bio: "", motivation: "", interests: "", profession: "",
  instagram: "", facebook: "", tiktok: "", linkedin: "",
  candidateSignatureName: "", guardianFullName: "", guardianEmail: "", guardianPhone: "", guardianSignatureName: "",
  acceptEligibility: false, acceptRules: false, acceptMedia: false, acceptNewsletter: false, acceptCGU: false,
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

function normalizeSignedName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("fr-BE");
}

function signatureMatches(signature: string, firstName: string, lastName: string) {
  const normalized = normalizeSignedName(signature);
  return normalized === normalizeSignedName(`${firstName} ${lastName}`)
    || normalized === normalizeSignedName(`${lastName} ${firstName}`);
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
        candidateSignatureName: "",
        guardianSignatureName: "",
        acceptEligibility: false,
        acceptRules: false,
        acceptMedia: false,
        acceptCGU: false,
      }));
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const {
      photo: _photo,
      photoPreview: _preview,
      candidateSignatureName: _candidateSignature,
      guardianSignatureName: _guardianSignature,
      acceptEligibility: _eligibility,
      acceptRules: _rules,
      acceptMedia: _media,
      acceptCGU: _cgu,
      ...draft
    } = form;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [form]);

  const progress = `${Math.round((step / TOTAL_STEPS) * 100)}%`;
  const fullName = `${form.firstName} ${form.lastName}`.trim() || "Votre candidature";
  const candidateAge = ageFromDate(form.birthDate);
  const isMinor = candidateAge >= 16 && candidateAge < 18;
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
      if (age < 16 || age > 26) next.birthDate = "Le contrat 2027 prévoit un âge de 16 à 26 ans.";
      if (form.street.trim().length < 2) next.street = "Rue requise pour le contrat.";
      if (!form.houseNumber.trim()) next.houseNumber = "Numéro requis.";
      if (!/^\d{4}$/.test(form.postalCode)) next.postalCode = "Code postal belge à 4 chiffres requis.";
      if (form.city.trim().length < 2) next.city = "Ville requise.";
      if (!form.category) next.category = "Choisissez Miss ou Mister.";
    }
    if (targetStep === 2) {
      if (!form.photo) next.photo = "Ajoutez votre photo principale.";
      if (form.bio.trim().length < 100 || form.bio.trim().length > 500) next.bio = "Votre présentation doit contenir entre 100 et 500 caractères.";
      if (form.motivation.trim().length < 50) next.motivation = "Expliquez votre motivation en au moins 50 caractères.";
      if (form.profession.trim().length < 2) next.profession = "Indiquez votre profession ou vos études.";
      const height = Number(form.heightCm);
      const weight = Number(form.weightKg);
      if (!Number.isInteger(height) || height < 120 || height > 230) next.heightCm = "Indiquez une taille entre 120 et 230 cm.";
      if (!Number.isInteger(weight) || weight < 35 || weight > 250) next.weightKg = "Indiquez un poids entre 35 et 250 kg.";
    }
    if (targetStep === 4) {
      if (!form.acceptEligibility) next.acceptEligibility = "Vous devez confirmer les conditions d’éligibilité.";
      if (!form.acceptRules) next.acceptRules = "Le contrat et le règlement doivent être acceptés.";
      if (!form.acceptMedia) next.acceptMedia = "L’autorisation média est requise pour participer.";
      if (!form.acceptCGU) next.acceptCGU = "Les CGU et la politique de confidentialité doivent être acceptées.";
      if (!signatureMatches(form.candidateSignatureName, form.firstName, form.lastName)) {
        next.candidateSignatureName = `Saisissez votre nom complet : ${fullName}.`;
      }
      if (isMinor) {
        if (form.guardianFullName.trim().length < 3) next.guardianFullName = "Nom complet du représentant légal requis.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guardianEmail)) next.guardianEmail = "Adresse email du représentant légal invalide.";
        if (!/^(\+32|0)[0-9]{8,9}$/.test(form.guardianPhone.replace(/[\s./-]/g, ""))) next.guardianPhone = "Numéro belge du représentant légal invalide.";
        if (form.guardianSignatureName.trim().length < 3 || normalizeSignedName(form.guardianSignatureName) !== normalizeSignedName(form.guardianFullName)) {
          next.guardianSignatureName = "Le nom signé doit correspondre au représentant légal.";
        }
      }
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
          street: form.street.trim(),
          houseNumber: form.houseNumber.trim(),
          postalCode: form.postalCode.trim(),
          city: form.city.trim(),
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
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
          candidateSignatureName: form.candidateSignatureName.trim(),
          guardianFullName: isMinor ? form.guardianFullName.trim() : undefined,
          guardianEmail: isMinor ? form.guardianEmail.trim().toLowerCase() : undefined,
          guardianPhone: isMinor ? form.guardianPhone.replace(/[\s./-]/g, "") : undefined,
          guardianSignatureName: isMinor ? form.guardianSignatureName.trim() : undefined,
          acceptEligibility: form.acceptEligibility,
          acceptRules: form.acceptRules,
          acceptMedia: form.acceptMedia,
          acceptNewsletter: form.acceptNewsletter,
          acceptCGU: form.acceptCGU,
          consentVersion: "contract-2027-v1",
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
        url="https://missetmisterdour.be/inscription"
        tags={["candidature Miss Dour 2027", "inscription Mister Dour 2027", "concours Dour Hainaut"]}
      />

      <section className="mmd-registration-hero">
        <div className="mmd-container mmd-registration-hero-grid">
          <div>
            <div className="mmd-public-kicker"><span>2027</span><i />CANDIDATURE</div>
            <h1>Votre histoire commence <em>ici.</em></h1>
            <p>Quatre étapes guidées. Votre dossier contractuel reste privé jusqu’à validation par l’équipe Miss & Mister Dour.</p>
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
                <div className="mmd-form-address"><Field label="Rue" error={errors.street} icon={<MapPin />}><input autoComplete="address-line1" value={form.street} onChange={(e) => update("street", e.target.value)} /></Field><Field label="N°" error={errors.houseNumber}><input autoComplete="address-line2" value={form.houseNumber} onChange={(e) => update("houseNumber", e.target.value)} /></Field><Field label="Code postal" error={errors.postalCode}><input inputMode="numeric" autoComplete="postal-code" maxLength={4} value={form.postalCode} onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 4))} /></Field></div>
                <fieldset className={`mmd-choice-field ${errors.category ? "has-error" : ""}`}><legend>Je candidate dans la catégorie</legend><div><button type="button" className={form.category === "miss" ? "is-active" : ""} onClick={() => update("category", "miss")}>Miss</button><button type="button" className={form.category === "mister" ? "is-active" : ""} onClick={() => update("category", "mister")}>Mister</button></div>{errors.category && <small>{errors.category}</small>}</fieldset>
              </motion.div>}

              {step === 2 && <motion.div key="step-2" className="mmd-registration-step" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <header><Sparkles /><div><span>ÉTAPE 02</span><h2>Ce qui vous rend unique.</h2><p>Présentez votre personnalité. Le texte pourra être retravaillé avec vous avant publication.</p></div></header>
                <label className={`mmd-photo-upload ${form.photoPreview ? "has-photo" : ""} ${errors.photo ? "has-error" : ""}`}>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={handlePhoto} />
                  {form.photoPreview ? <img src={form.photoPreview} alt="Aperçu de votre photo" /> : <div><Camera /><strong>Ajouter votre photo principale</strong><span>JPG, PNG, WebP ou photo mobile · 5 Mo maximum</span></div>}
                  <span className="mmd-photo-action"><Upload /> {form.photoPreview ? "Changer la photo" : "Choisir une photo"}</span>
                  {errors.photo && <small>{errors.photo}</small>}
                </label>
                <div className="mmd-form-two"><Field label="Taille" hint="en cm" error={errors.heightCm} icon={<Ruler />}><input type="number" inputMode="numeric" min={120} max={230} placeholder="175" value={form.heightCm} onChange={(e) => update("heightCm", e.target.value)} /></Field><Field label="Poids" hint="en kg" error={errors.weightKg}><input type="number" inputMode="numeric" min={35} max={250} placeholder="65" value={form.weightKg} onChange={(e) => update("weightKg", e.target.value)} /></Field></div>
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
                <header><FileSignature /><div><span>ÉTAPE 04</span><h2>Contrat & validation.</h2><p>Vos accords sont horodatés et rattachés à votre dossier. L’équipe valide ensuite la candidature dans le cockpit.</p></div></header>
                <div className="mmd-registration-summary">{form.photoPreview && <img src={form.photoPreview} alt="" />}<div><small>{form.category || "Candidat"} · Édition 2027</small><h3>{fullName}</h3><p>{form.city}{form.profession ? ` · ${form.profession}` : ""}</p></div></div>
                <div className="mmd-contract-summary" id="contract-summary">
                  <div><FileSignature /><span><small>CONTRAT CANDIDAT 2027</small><strong>Conditions essentielles</strong></span></div>
                  <ul>
                    <li>16 à 26 ans à l’inscription, domicile à Dour ou dans un rayon maximal de 20 km.</li>
                    <li>Ne pas être marié ou divorcé et ne pas avoir d’antécédents judiciaires.</li>
                    <li>Participation aux répétitions, activités officielles et respect du règlement de l’organisation.</li>
                    <li>Autorisation d’utilisation de l’image, du nom et de la voix dans le cadre de l’élection.</li>
                    <li>Pour un candidat mineur, l’accord du représentant légal est obligatoire.</li>
                  </ul>
                </div>
                <Consent checked={form.acceptEligibility} onChange={(value) => update("acceptEligibility", value)} error={errors.acceptEligibility}>Je confirme respecter les conditions d’éligibilité indiquées dans le contrat 2027 et certifie l’exactitude des informations transmises.</Consent>
                <Consent checked={form.acceptRules} onChange={(value) => update("acceptRules", value)} error={errors.acceptRules}>J’ai pris connaissance et j’accepte le contrat et le règlement de participation 2027.</Consent>
                <Consent checked={form.acceptMedia} onChange={(value) => update("acceptMedia", value)} error={errors.acceptMedia}>J’autorise l’utilisation des photos et vidéos dans le cadre de Miss & Mister Dour, conformément aux conditions indiquées.</Consent>
                <Consent checked={form.acceptCGU} onChange={(value) => update("acceptCGU", value)} error={errors.acceptCGU}>J’accepte les <Link href="/legal/cgu">CGU</Link> et la <Link href="/legal/privacy">politique de confidentialité</Link>.</Consent>
                <Consent checked={form.acceptNewsletter} onChange={(value) => update("acceptNewsletter", value)}>Je souhaite recevoir les actualités de l’événement (facultatif).</Consent>
                <div className="mmd-signature-panel">
                  <div className="mmd-signature-heading"><FileSignature /><span><small>SIGNATURE ÉLECTRONIQUE SIMPLE</small><strong>Candidat</strong></span></div>
                  <p>Saisissez votre nom complet tel qu’il apparaît dans le dossier : <b>{fullName}</b>.</p>
                  <Field label="Nom complet du candidat" error={errors.candidateSignatureName}><input autoComplete="name" placeholder={fullName} value={form.candidateSignatureName} onChange={(e) => update("candidateSignatureName", e.target.value)} /></Field>
                </div>
                {isMinor && <div className="mmd-signature-panel mmd-signature-panel--guardian">
                  <div className="mmd-signature-heading"><UserCheck /><span><small>CANDIDAT MINEUR · {candidateAge} ANS</small><strong>Représentant légal obligatoire</strong></span></div>
                  <p>Le représentant légal complète ces informations et saisit lui-même son nom complet.</p>
                  <Field label="Nom complet du représentant légal" error={errors.guardianFullName}><input autoComplete="name" value={form.guardianFullName} onChange={(e) => update("guardianFullName", e.target.value)} /></Field>
                  <div className="mmd-form-two"><Field label="Email du représentant" error={errors.guardianEmail} icon={<Mail />}><input type="email" inputMode="email" autoComplete="email" value={form.guardianEmail} onChange={(e) => update("guardianEmail", e.target.value)} /></Field><Field label="Téléphone du représentant" error={errors.guardianPhone} icon={<Phone />}><input type="tel" inputMode="tel" autoComplete="tel" value={form.guardianPhone} onChange={(e) => update("guardianPhone", e.target.value)} /></Field></div>
                  <Field label="Signature — nom complet" error={errors.guardianSignatureName}><input autoComplete="off" placeholder={form.guardianFullName || "Nom complet"} value={form.guardianSignatureName} onChange={(e) => update("guardianSignatureName", e.target.value)} /></Field>
                </div>}
                <p className="mmd-signature-note"><ShieldCheck /> La date, l’heure et une empreinte technique de la connexion sont conservées avec les consentements pour assurer la traçabilité du dossier.</p>
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
