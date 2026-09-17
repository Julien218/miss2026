import { useMemo, useState } from "react";
import { Check, ChevronRight, ExternalLink, FileSignature, ShieldCheck, Sparkles } from "lucide-react";

const CONTRACT_VERSION = "MMD-2027-CANDIDAT-v1.0";
const CONTRACT_PDF_URL = "https://drive.google.com/file/d/10LV1mfVIuvZ0M1YC4L59PVDDOx1qB68X/view?usp=drivesdk";

const SECTIONS = [
  {
    id: "objet",
    number: "01",
    title: "Objet",
    kicker: "Participation 2027",
    text: "Présentation du cadre de participation à Miss & Mister Dour 2027 et des engagements liés à l'inscription officielle.",
  },
  {
    id: "conditions",
    number: "02",
    title: "Conditions de participation",
    kicker: "Éligibilité & engagement",
    text: "Les informations d'identité, les conditions d'éligibilité et les engagements du candidat sont regroupés dans une lecture claire avant validation.",
  },
  {
    id: "media",
    number: "03",
    title: "Image & voix",
    kicker: "Consentement média",
    text: "Les choix liés à l'utilisation de l'image et de la voix sont présentés séparément afin que le candidat sache précisément ce qu'il accepte.",
  },
  {
    id: "rgpd",
    number: "04",
    title: "Données personnelles",
    kicker: "Notice RGPD",
    text: "La partie données personnelles expose les finalités du traitement et les informations nécessaires au parcours d'inscription numérique.",
  },
  {
    id: "mineur",
    number: "05",
    title: "Candidat mineur",
    kicker: "Autorisation parentale",
    text: "Pour les candidats mineurs, le dossier fait apparaître automatiquement les informations et la validation du représentant légal.",
  },
  {
    id: "signature",
    number: "06",
    title: "Signatures",
    kicker: "Validation numérique",
    text: "La signature numérique est associée à la version du contrat, à la date de validation et au dossier du candidat pour assurer la traçabilité.",
  },
] as const;

export default function ContractShowcase() {
  const [active, setActive] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const section = SECTIONS[active];
  const progress = useMemo(() => Math.round(((active + 1) / SECTIONS.length) * 100), [active]);

  return (
    <main className="mmd-showcase mmd-contract-showcase">
      <header className="mmd-showcase-topbar">
        <div>
          <span>MISS & MISTER DOUR · 2027</span>
          <strong>Contrat interactif · {CONTRACT_VERSION}</strong>
        </div>
        <a href={CONTRACT_PDF_URL} target="_blank" rel="noreferrer">
          Contrat officiel PDF <ExternalLink />
        </a>
      </header>

      <section className="mmd-contract-stage">
        <aside className="mmd-contract-nav">
          <div className="mmd-contract-nav-head">
            <FileSignature />
            <div>
              <span>APERÇU CLIENT</span>
              <strong>Dossier contractuel</strong>
            </div>
          </div>
          <div className="mmd-contract-progress"><i style={{ width: `${progress}%` }} /></div>
          <nav>
            {SECTIONS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={index === active ? "is-active" : ""}
                onClick={() => setActive(index)}
              >
                <span>{item.number}</span>
                <strong>{item.title}</strong>
                <ChevronRight />
              </button>
            ))}
          </nav>
        </aside>

        <article className="mmd-contract-sheet" key={section.id}>
          <div className="mmd-contract-watermark" aria-hidden="true">M&M</div>
          <div className="mmd-contract-sheet-top">
            <span>{section.number} · {section.kicker}</span>
            <span>{CONTRACT_VERSION}</span>
          </div>
          <h1>{section.title}</h1>
          <p className="mmd-contract-lead">{section.text}</p>

          <div className="mmd-contract-copy">
            <p>
              Cette interface est une présentation interactive du dossier contractuel. Elle reprend la structure
              utilisée dans le parcours d'inscription afin de rendre la lecture plus claire sur ordinateur comme sur mobile.
            </p>
            <p>
              La version juridiquement utilisée reste la version officielle associée au numéro de version ci-dessus.
              Le candidat peut consulter le document complet avant toute validation.
            </p>
          </div>

          {section.id === "signature" ? (
            <div className="mmd-contract-sign-demo">
              <label>
                <span>Nom complet du candidat</span>
                <input value="Exemple Candidat" readOnly />
              </label>
              <button type="button" className={accepted ? "is-accepted" : ""} onClick={() => setAccepted((value) => !value)}>
                <Check /> {accepted ? "Validation simulée" : "Simuler la validation"}
              </button>
              <small>Mode démonstration : aucune signature n'est enregistrée sur cette page.</small>
            </div>
          ) : (
            <div className="mmd-contract-feature-grid">
              <div><ShieldCheck /><strong>Lecture claire</strong><span>Section par section, sans bloc juridique illisible.</span></div>
              <div><Sparkles /><strong>Identité premium</strong><span>Charte noire, ivoire et champagne alignée sur le site.</span></div>
            </div>
          )}

          <div className="mmd-contract-sheet-footer">
            <span>Direction digitale & mise en scène visuelle par JS-Innov.IA®</span>
            <button type="button" onClick={() => setActive((current) => (current + 1) % SECTIONS.length)}>
              Section suivante <ChevronRight />
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
