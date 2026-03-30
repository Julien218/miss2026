/**
 * LegalPrivacy.tsx — Politique de Confidentialité
 * Conforme au RGPD (UE 2016/679) et à la loi belge du 30 juillet 2018
 * JS-Innov.IA / STARLIGHT ASBL — Miss & Mister Dour 2026
 */

import { Link } from "wouter";
import {
  ArrowLeft, Shield, Database, Eye, Trash2, Lock,
  Globe, Bell, UserCheck, FileText, Server, Mail
} from "lucide-react";
import { BRANDING } from "@/config/branding";

const LAST_UPDATE = "8 mars 2026";
const DPO_EMAIL = "info@jsinnovia.com";
const APD_URL = "https://www.autoriteprotectiondonnees.be";

const DATA_TABLE = [
  {
    category: "Données d'identification",
    data: "Nom, prénom, date de naissance, nationalité, adresse postale",
    purpose: "Vérification des critères d'éligibilité au concours",
    basis: "Exécution du contrat",
    retention: "3 ans après la fin du concours",
  },
  {
    category: "Coordonnées",
    data: "Adresse email, numéro de téléphone",
    purpose: "Communication officielle relative au concours",
    basis: "Exécution du contrat",
    retention: "3 ans après la fin du concours",
  },
  {
    category: "Profil candidat",
    data: "Biographie, photo de profil, réseaux sociaux, mensurations déclarées",
    purpose: "Affichage public du profil candidat sur la plateforme",
    basis: "Consentement explicite",
    retention: "Durée du concours + 1 an",
  },
  {
    category: "Données de vote",
    data: "Identifiant votant, candidat voté, horodatage",
    purpose: "Calcul du classement et prévention de la fraude",
    basis: "Intérêt légitime",
    retention: "6 mois après les résultats",
  },
  {
    category: "Données de connexion",
    data: "Adresse IP, navigateur, OS, horodatage de connexion",
    purpose: "Sécurité de la plateforme",
    basis: "Intérêt légitime",
    retention: "12 mois",
  },
  {
    category: "Cookies techniques",
    data: "Cookies de session, préférences d'affichage",
    purpose: "Fonctionnement technique de la plateforme",
    basis: "Intérêt légitime",
    retention: "Durée de la session",
  },
  {
    category: "Données médias",
    data: "Photographies, vidéos soumises par les candidats",
    purpose: "Publication sur la plateforme et supports de communication",
    basis: "Consentement explicite (droit à l'image)",
    retention: "5 ans à compter de la soirée de clôture",
  },
  {
    category: "Formulaire de contact",
    data: "Nom, email, message",
    purpose: "Traitement des demandes d'information",
    basis: "Consentement",
    retention: "2 ans",
  },
];

const PROCESSORS = [
  {
    name: "Manus AI",
    role: "Hébergement de la plateforme et infrastructure cloud",
    location: "Union Européenne",
    guarantee: "Clauses contractuelles types (CCT) UE",
  },
  {
    name: "Manus Auth (OAuth)",
    role: "Authentification et gestion des sessions utilisateurs",
    location: "Union Européenne",
    guarantee: "Clauses contractuelles types (CCT) UE",
  },
  {
    name: "Service email (SMTP)",
    role: "Envoi de notifications et communications par email",
    location: "Union Européenne",
    guarantee: "Conformité RGPD contractuelle",
  },
];

const RIGHTS = [
  {
    icon: Eye,
    title: "Droit d'accès",
    article: "Art. 15 RGPD",
    description:
      "Obtenir la confirmation que des données vous concernant sont traitées, ainsi qu'une copie de ces données et des informations sur leur traitement.",
  },
  {
    icon: FileText,
    title: "Droit de rectification",
    article: "Art. 16 RGPD",
    description:
      "Demander la correction de données inexactes ou incomplètes vous concernant.",
  },
  {
    icon: Trash2,
    title: "Droit à l'effacement",
    article: "Art. 17 RGPD",
    description:
      "Demander la suppression de vos données dans les cas prévus par le RGPD (retrait du consentement, données non nécessaires, etc.).",
  },
  {
    icon: Lock,
    title: "Droit à la limitation",
    article: "Art. 18 RGPD",
    description:
      "Demander la limitation du traitement de vos données dans certaines circonstances (contestation de l'exactitude, traitement illicite, etc.).",
  },
  {
    icon: Globe,
    title: "Droit à la portabilité",
    article: "Art. 20 RGPD",
    description:
      "Recevoir vos données dans un format structuré, lisible par machine, et les transmettre à un autre responsable de traitement.",
  },
  {
    icon: Bell,
    title: "Droit d'opposition",
    article: "Art. 21 RGPD",
    description:
      "Vous opposer au traitement fondé sur l'intérêt légitime, notamment à des fins de prospection commerciale.",
  },
  {
    icon: UserCheck,
    title: "Retrait du consentement",
    article: "Art. 7 RGPD",
    description:
      "Retirer votre consentement à tout moment, sans que cela affecte la licéité du traitement antérieur.",
  },
  {
    icon: Shield,
    title: "Droit de réclamation",
    article: "Art. 77 RGPD",
    description:
      "Introduire une réclamation auprès de l'Autorité de Protection des Données (APD) belge si vous estimez que vos droits ne sont pas respectés.",
  },
];

const NAV_SECTIONS = [
  { id: "responsable", label: "Responsable" },
  { id: "donnees", label: "Données collectées" },
  { id: "droits", label: "Vos droits" },
  { id: "sous-traitants", label: "Sous-traitants" },
  { id: "transferts", label: "Transferts hors UE" },
  { id: "securite", label: "Sécurité" },
  { id: "mineurs", label: "Mineurs" },
  { id: "contact", label: "Contact & APD" },
];

export default function LegalPrivacy() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-background, #0A0A0F)" }}>
      <style>{`
        .priv-link { color: #C87941; text-decoration: underline; text-underline-offset: 2px; transition: color .2s; }
        .priv-link:hover { color: #D4AF37; }
        .priv-table { width: 100%; border-collapse: collapse; font-size: .8rem; }
        .priv-table th { padding: .6rem .75rem; border: 1px solid rgba(200,121,65,.25); background: rgba(200,121,65,.1); color: #C87941; font-weight: 600; text-align: left; white-space: nowrap; }
        .priv-table td { padding: .5rem .75rem; border: 1px solid rgba(255,255,255,.07); color: #D1D5DB; vertical-align: top; }
        .priv-table tr:nth-child(even) td { background: rgba(255,255,255,.015); }
        .priv-section { border-radius: 1rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.02); }
        .priv-section h2 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: .6rem; }
        .priv-section p { color: #D1D5DB; line-height: 1.75; margin-bottom: .75rem; }
        .priv-section p:last-child { margin-bottom: 0; }
        .priv-icon { width: 2rem; height: 2rem; border-radius: .5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(200,121,65,.15); border: 1px solid rgba(200,121,65,.3); }
        .right-card { border-radius: .75rem; padding: 1rem; border: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.02); display: flex; gap: .75rem; }
        .right-icon { width: 2.25rem; height: 2.25rem; border-radius: .5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(200,121,65,.12); border: 1px solid rgba(200,121,65,.25); }
      `}</style>

      {/* En-tête */}
      <div className="border-b border-gray-800" style={{ background: "rgba(200,121,65,.04)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Retour au site
            </a>
          </Link>
          <div className="flex items-start gap-4">
            <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour 2026" className="h-16 w-auto object-contain flex-shrink-0" />
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Politique de Confidentialité
              </h1>
              <p className="text-gray-400 mt-1">Traitement des données personnelles — Conforme au RGPD (UE 2016/679)</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["RGPD (UE 2016/679)", "Loi belge 30 juillet 2018", `Mise à jour : ${LAST_UPDATE}`].map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: "rgba(200,121,65,.4)", color: "#C87941", background: "rgba(200,121,65,.08)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation rapide */}
      <div className="border-b border-gray-800 bg-gray-900/40 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {NAV_SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-xs text-gray-400 hover:text-white whitespace-nowrap px-3 py-1.5 rounded-full border border-gray-700 hover:border-gray-500 transition-all flex-shrink-0">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* Bannière engagement */}
        <div className="p-5 rounded-2xl border flex items-start gap-4" style={{ background: "rgba(200,121,65,.05)", borderColor: "rgba(200,121,65,.2)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(200,121,65,.15)" }}>
            <Shield className="w-5 h-5" style={{ color: "#C87941" }} />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Engagement de transparence</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              JS-Innov.IA et STARLIGHT ASBL s'engagent à protéger la vie privée de tous les utilisateurs de la plateforme Miss & Mister Dour.
              Vos données ne sont jamais vendues ni cédées à des tiers à des fins commerciales. La présente politique décrit de manière transparente
              quelles données sont collectées, pourquoi, et comment vous pouvez exercer vos droits.
            </p>
          </div>
        </div>

        {/* 1. Responsable */}
        <section id="responsable" className="priv-section scroll-mt-20">
          <h2><span className="priv-icon"><Database className="w-4 h-4" style={{ color: "#C87941" }} /></span>1. Responsable du traitement</h2>
          <div className="overflow-x-auto">
            <table className="priv-table">
              <tbody>
                {[
                  ["Responsable", "Julien Pagin — JS-Innov.IA"],
                  ["Statut juridique", "Entreprise individuelle"],
                  ["Numéro d'entreprise", "BE0877926214"],
                  ["Adresse", "Rue Grande 52, 7370 Dour, Belgique"],
                  ["Email DPO", DPO_EMAIL],
                  ["Téléphone", "+32 494 11 90 90"],
                  ["Co-responsable événement", "STARLIGHT ASBL — Grand'Place 9, 7370 Dour (BCE : BE 1012.267.056)"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="font-medium text-gray-400 w-48">{label}</td>
                    <td>
                      {label === "Email DPO"
                        ? <a href={`mailto:${value}`} className="priv-link">{value}</a>
                        : <span className={label === "Responsable" || label === "Co-responsable événement" ? "text-white font-semibold" : ""}>{value}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            JS-Innov.IA est responsable du traitement des données liées à la plateforme numérique.
            STARLIGHT ASBL est co-responsable pour les données liées à l'organisation de l'événement physique.
          </p>
        </section>

        {/* 2. Données collectées */}
        <section id="donnees" className="scroll-mt-20">
          <div className="priv-section mb-4">
            <h2><span className="priv-icon"><Database className="w-4 h-4" style={{ color: "#C87941" }} /></span>2. Données collectées, finalités et durées de conservation</h2>
            <p>
              Le tableau ci-dessous détaille l'ensemble des catégories de données personnelles traitées sur la plateforme,
              la finalité de chaque traitement, sa base légale au sens de l'article 6 du RGPD, et la durée de conservation applicable.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="priv-table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Données</th>
                  <th>Finalité</th>
                  <th>Base légale</th>
                  <th>Conservation</th>
                </tr>
              </thead>
              <tbody>
                {DATA_TABLE.map((row) => (
                  <tr key={row.category}>
                    <td className="font-medium text-white">{row.category}</td>
                    <td>{row.data}</td>
                    <td>{row.purpose}</td>
                    <td className="text-xs" style={{ color: "#C87941" }}>{row.basis}</td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">{row.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            À l'expiration des durées de conservation, les données sont supprimées de manière sécurisée ou anonymisées à des fins statistiques,
            conformément à l'article 5(1)(e) du RGPD.
          </p>
        </section>

        {/* 3. Droits */}
        <section id="droits" className="scroll-mt-20">
          <div className="priv-section mb-4">
            <h2><span className="priv-icon"><UserCheck className="w-4 h-4" style={{ color: "#C87941" }} /></span>3. Vos droits en tant que personne concernée</h2>
            <p>
              Conformément au RGPD et à la loi belge du 30 juillet 2018, vous disposez des droits suivants.
              Pour les exercer, adressez votre demande par email à{" "}
              <a href={`mailto:${DPO_EMAIL}`} className="priv-link">{DPO_EMAIL}</a> en précisant votre identité.
              Nous répondons dans un délai maximum d'un mois (Art. 12 RGPD), prolongeable de deux mois en cas de demande complexe.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RIGHTS.map((right) => {
              const Icon = right.icon;
              return (
                <div key={right.title} className="right-card">
                  <div className="right-icon"><Icon className="w-4 h-4" style={{ color: "#C87941" }} /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{right.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(200,121,65,.12)", color: "#C87941" }}>{right.article}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{right.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Sous-traitants */}
        <section id="sous-traitants" className="priv-section scroll-mt-20">
          <h2><span className="priv-icon"><Server className="w-4 h-4" style={{ color: "#C87941" }} /></span>4. Sous-traitants et destinataires des données</h2>
          <p>
            JS-Innov.IA fait appel à des sous-traitants techniques pour assurer le fonctionnement de la plateforme.
            Ces sous-traitants agissent exclusivement sur instruction de JS-Innov.IA et sont liés par des contrats de traitement
            de données conformes à l'article 28 du RGPD.
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="priv-table">
              <thead>
                <tr><th>Sous-traitant</th><th>Rôle</th><th>Localisation</th><th>Garantie</th></tr>
              </thead>
              <tbody>
                {PROCESSORS.map((p) => (
                  <tr key={p.name}>
                    <td className="font-medium text-white">{p.name}</td>
                    <td>{p.role}</td>
                    <td>{p.location}</td>
                    <td className="text-xs" style={{ color: "#C87941" }}>{p.guarantee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Vos données ne sont jamais vendues, louées ou cédées à des tiers à des fins commerciales ou publicitaires.
          </p>
        </section>

        {/* 5. Transferts hors UE */}
        <section id="transferts" className="priv-section scroll-mt-20">
          <h2><span className="priv-icon"><Globe className="w-4 h-4" style={{ color: "#C87941" }} /></span>5. Transferts de données hors Union Européenne</h2>
          <p>
            L'ensemble des données personnelles traitées dans le cadre de la plateforme Miss & Mister Dour est hébergé et traité
            au sein de l'Union Européenne. Aucun transfert de données vers des pays tiers n'est effectué dans le cadre normal
            du fonctionnement de la plateforme.
          </p>
          <p>
            Dans l'hypothèse où un transfert vers un pays tiers s'avérerait nécessaire, JS-Innov.IA s'engage à mettre en place
            les garanties appropriées prévues par le Chapitre V du RGPD (décision d'adéquation, clauses contractuelles types
            approuvées par la Commission européenne, ou règles d'entreprise contraignantes).
          </p>
        </section>

        {/* 6. Sécurité */}
        <section id="securite" className="priv-section scroll-mt-20">
          <h2><span className="priv-icon"><Lock className="w-4 h-4" style={{ color: "#C87941" }} /></span>6. Mesures de sécurité</h2>
          <p>
            JS-Innov.IA met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles
            contre tout accès non autorisé, divulgation, altération ou destruction, conformément à l'article 32 du RGPD.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {[
              { label: "Chiffrement des communications", detail: "HTTPS/TLS sur l'ensemble de la plateforme" },
              { label: "Authentification sécurisée", detail: "JWT signé avec secret fort, sessions à durée limitée" },
              { label: "Contrôle d'accès (RBAC)", detail: "Système de rôles limitant l'accès aux données sensibles" },
              { label: "Journalisation", detail: "Traçabilité des accès et des modifications de données" },
              { label: "Sauvegardes régulières", detail: "Backups automatiques chiffrés de la base de données" },
              { label: "Gestion des incidents", detail: "Notification APD dans les 72h en cas de violation (Art. 33)" },
            ].map(({ label, detail }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: "rgba(255,255,255,.06)", background: "rgba(255,255,255,.01)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "#C87941" }} />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Mineurs */}
        <section id="mineurs" className="priv-section scroll-mt-20">
          <h2><span className="priv-icon"><Shield className="w-4 h-4" style={{ color: "#C87941" }} /></span>7. Protection des mineurs</h2>
          <p>
            La plateforme est accessible aux candidats âgés de 16 ans et plus, conformément aux critères d'éligibilité du concours.
            Pour les candidats âgés de 16 à 17 ans, le consentement parental ou tutoral est requis lors de l'inscription,
            conformément à l'article 8 du RGPD et à la loi belge du 30 juillet 2018.
          </p>
          <p>
            Les données des mineurs bénéficient d'une protection renforcée. Elles ne sont pas utilisées à des fins de profilage
            commercial et ne sont pas rendues accessibles à des tiers sans consentement explicite du représentant légal.
          </p>
        </section>

        {/* 8. Contact & APD */}
        <section id="contact" className="priv-section scroll-mt-20">
          <h2><span className="priv-icon"><Mail className="w-4 h-4" style={{ color: "#C87941" }} /></span>8. Contact, réclamations et Autorité de Protection des Données</h2>
          <p>Pour toute question relative à la présente politique ou pour exercer vos droits :</p>
          <div className="overflow-x-auto mt-3">
            <table className="priv-table">
              <tbody>
                {[
                  ["Email", DPO_EMAIL, true],
                  ["Téléphone", "+32 494 11 90 90", false],
                  ["Courrier", "JS-Innov.IA — Julien Pagin, Rue Grande 52, 7370 Dour, Belgique", false],
                ].map(([label, value, isEmail]) => (
                  <tr key={label as string}>
                    <td className="font-medium text-gray-400 w-32">{label}</td>
                    <td>{isEmail ? <a href={`mailto:${value}`} className="priv-link">{value}</a> : value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 p-4 rounded-xl border flex items-start gap-3" style={{ borderColor: "rgba(200,121,65,.2)", background: "rgba(200,121,65,.04)" }}>
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#C87941" }} />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Autorité de Protection des Données (APD) — Belgique</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, vous avez le droit
                d'introduire une réclamation auprès de l'APD belge, autorité de contrôle compétente en vertu de l'article 77 du RGPD.
              </p>
              <a href={APD_URL} target="_blank" rel="noopener noreferrer" className="priv-link text-sm mt-2 inline-block">
                {APD_URL} →
              </a>
              <p className="text-xs text-gray-500 mt-1">Rue de la Presse 35, 1000 Bruxelles — +32 2 274 48 00</p>
            </div>
          </div>
        </section>

        {/* Liens légaux */}
        <div className="p-6 rounded-2xl border" style={{ background: "rgba(200,121,65,.04)", borderColor: "rgba(200,121,65,.15)" }}>
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Documents légaux complémentaires</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: "/mentions-legales", label: "Mentions Légales", desc: "Éditeur, hébergement, PI" },
              { href: "/legal/cgu", label: "CGU & Règlement du concours", desc: "Critères, vote, titres" },
              { href: "/legal/cookies", label: "Politique cookies", desc: "Cookies techniques" },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href}>
                <a className="block p-4 rounded-xl border transition-all" style={{ borderColor: "rgba(200,121,65,.2)", background: "rgba(255,255,255,.02)" }}>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Pied de page */}
        <div className="border-t border-gray-800 pt-8 text-center space-y-2">
          <p className="text-sm text-gray-400">
            © 2026 <strong className="text-white">JS-Innov.IA</strong> — Julien Pagin ·
            Événement organisé par <strong className="text-white">STARLIGHT ASBL</strong>
          </p>
          <p className="text-xs text-gray-600">BE0877926214 · Rue Grande 52, 7370 Dour, Belgique · {DPO_EMAIL}</p>
        </div>
      </div>
    </div>
  );
}
