const CONTRACT_VERSION = "MMD-2027-CANDIDAT-v1.0";
const CONTRACT_PDF_URL = "https://drive.google.com/file/d/10LV1mfVIuvZ0M1YC4L59PVDDOx1qB68X/view?usp=drivesdk";
const CONTRACT_DOCX_URL = "https://docs.google.com/document/d/1LceTMU5muqMSIG4SfEsF5o5fR-Mz_jKc/edit?usp=drivesdk&ouid=118403089919332144772&rtpof=true&sd=true";
const CONTRACT_INTERACTIVE_URL = "https://contrat.missetmisterdour.be";

export function RegistrationContractDock() {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  const registrationPath = path === "/inscription" || path === "/inscription-candidat" || path.startsWith("/onboarding/candidate/");
  if (!registrationPath) return null;

  return (
    <aside className="mmd-contract-dock" aria-label="Contrat de participation 2027">
      <span>CONTRAT OFFICIEL · {CONTRACT_VERSION}</span>
      <strong>Avant de valider votre candidature</strong>
      <p>
        Consultez le contrat de participation 2027, la notice RGPD, les choix image/voix
        et l’autorisation parentale prévue pour les candidats mineurs.
      </p>
      <nav>
        <a href={CONTRACT_INTERACTIVE_URL} target="_blank" rel="noreferrer">Version interactive</a>
        <a href={CONTRACT_PDF_URL} target="_blank" rel="noreferrer">Lire le PDF</a>
        <a href={CONTRACT_DOCX_URL} target="_blank" rel="noreferrer">Version Word</a>
      </nav>
    </aside>
  );
}
