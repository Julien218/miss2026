/**
 * LegalNotice.tsx — Mentions Légales
 * Conforme au droit belge et au RGPD européen
 * Miss & Mister Dour 2026 — JS-Innov.IA
 */

import { Link } from "wouter";
import { Scale, ArrowLeft, Shield, Eye, Copyright, Database, Camera, Cookie, AlertTriangle, Globe } from "lucide-react";

// ─── Données de la page ────────────────────────────────────────────────────────

const LAST_UPDATE = "8 mars 2026";

const SECTIONS = [
  {
    id: "editeur",
    icon: Scale,
    title: "1. Éditeur du site",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Le présent site web, accessible à l'adresse{" "}
          <a href="https://missetmisterdour.be" className="legal-link">missetmisterdour.be</a>,
          est édité par :
        </p>
        <table className="legal-table">
          <tbody>
            <tr><td>Nom</td><td>Julien Pagin</td></tr>
            <tr><td>Entreprise</td><td>JS-Innov.IA</td></tr>
            <tr><td>Statut juridique</td><td>Entreprise individuelle</td></tr>
            <tr><td>Numéro d'entreprise (BCE)</td><td>BE0877926214</td></tr>
            <tr><td>Adresse</td><td>Rue Grande 52, 7370 Dour, Belgique</td></tr>
            <tr><td>Téléphone</td><td>+32 494 11 90 90</td></tr>
            <tr><td>Email</td><td><a href="mailto:info@jsinnovia.com" className="legal-link">info@jsinnovia.com</a></td></tr>
            <tr><td>Site web</td><td><a href="https://jsinnovia.com" className="legal-link">jsinnovia.com</a></td></tr>
          </tbody>
        </table>
        <p>
          La plateforme est développée et maintenue par <strong className="text-white">JS-Innov.IA</strong> dans le cadre
          d'une collaboration avec <strong className="text-white">STARLIGHT ASBL</strong>, organisation partenaire
          de l'événement Miss & Mister Dour.
        </p>
      </div>
    ),
  },
  {
    id: "responsable",
    icon: Eye,
    title: "2. Responsable de la publication",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Le responsable de la publication du présent site est <strong className="text-white">Julien Pagin</strong>,
          fondateur de JS-Innov.IA, joignable à l'adresse électronique{" "}
          <a href="mailto:info@jsinnovia.com" className="legal-link">info@jsinnovia.com</a> ou
          par téléphone au <strong className="text-white">+32 494 11 90 90</strong>.
        </p>
        <p>
          Pour toute question relative à l'événement Miss & Mister Dour, vous pouvez également
          contacter l'organisation partenaire <strong className="text-white">STARLIGHT ASBL</strong>.
        </p>
      </div>
    ),
  },
  {
    id: "hebergement",
    icon: Globe,
    title: "3. Hébergement",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Le présent site est hébergé par la plateforme <strong className="text-white">Manus</strong> (anciennement Base44),
          solution d'hébergement cloud pour applications web. Pour toute question technique relative
          à l'infrastructure d'hébergement, vous pouvez contacter l'éditeur du site à l'adresse
          mentionnée à la section 1.
        </p>
        <p>
          L'éditeur s'engage à prendre toutes les mesures nécessaires pour assurer la continuité
          et la sécurité du service dans les limites des obligations de moyens qui lui incombent.
        </p>
      </div>
    ),
  },
  {
    id: "objet",
    icon: Globe,
    title: "4. Objet du site",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Le site <strong className="text-white">Miss & Mister Dour</strong> est une plateforme numérique dédiée
          à la gestion et à la promotion du concours de beauté et de personnalité
          <em> Miss & Mister Dour 2026</em>, organisé à Dour, en Belgique.
        </p>
        <p>La plateforme permet notamment :</p>
        <ul className="legal-list">
          <li>la présentation et la gestion des candidats participants au concours ;</li>
          <li>la collecte et la gestion des inscriptions et des profils candidats ;</li>
          <li>l'organisation du système de votes du public ;</li>
          <li>la diffusion d'informations relatives à l'événement (programme, partenaires, actualités) ;</li>
          <li>la communication entre l'organisation et les candidats ;</li>
          <li>la présentation des partenaires et sponsors de l'événement.</li>
        </ul>
        <p>
          La soirée de clôture <strong className="text-white">Miss & Mister Dour</strong> est prévue
          le <strong className="text-white">19 avril 2026</strong> à Dour, Belgique.
        </p>
      </div>
    ),
  },
  {
    id: "propriete-intellectuelle",
    icon: Copyright,
    title: "5. Propriété intellectuelle",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          L'ensemble des éléments constituant la plateforme technologique — notamment le code source,
          l'architecture logicielle, la base de données, le design, les interfaces utilisateur,
          les algorithmes, les fonctionnalités et les développements spécifiques — sont la
          <strong className="text-white"> propriété intellectuelle exclusive de Julien Pagin – JS-Innov.IA</strong>,
          protégée par les dispositions du Code de droit économique belge (Livre XI) et par les
          conventions internationales sur la propriété intellectuelle.
        </p>
        <p>
          La plateforme est mise à disposition pour l'événement Miss & Mister Dour dans le cadre
          d'une collaboration avec <strong className="text-white">STARLIGHT ASBL</strong>, sans transfert
          de propriété technologique d'aucune sorte. Cette mise à disposition ne confère à
          STARLIGHT ASBL aucun droit de propriété, de cession, de sous-licence ou d'exploitation
          commerciale indépendante de la plateforme ou de ses composants.
        </p>
        <p>
          Les contenus éditoriaux relatifs à l'événement (textes de présentation, informations
          sur le concours, programme) sont la propriété de <strong className="text-white">STARLIGHT ASBL</strong> ou
          de leurs auteurs respectifs. Les photographies et visuels des candidats appartiennent
          à leurs auteurs respectifs ou à STARLIGHT ASBL.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, transmission ou utilisation,
          totale ou partielle, du site ou de l'un quelconque de ses éléments, par quelque procédé
          que ce soit, sans autorisation écrite préalable de JS-Innov.IA, est strictement interdite
          et constituerait une contrefaçon sanctionnée par les articles XI.165 et suivants du Code
          de droit économique belge.
        </p>
      </div>
    ),
  },
  {
    id: "rgpd",
    icon: Database,
    title: "6. Données personnelles (RGPD)",
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016
          relatif à la protection des personnes physiques à l'égard du traitement des données à
          caractère personnel (RGPD) et à la loi belge du 30 juillet 2018 relative à la protection
          des personnes physiques à l'égard des traitements de données à caractère personnel,
          JS-Innov.IA agit en qualité de <strong className="text-white">responsable du traitement</strong> des
          données collectées via ce site.
        </p>

        <div>
          <h4 className="text-white font-semibold mb-2">Données collectées</h4>
          <p>
            Dans le cadre du fonctionnement du site, certaines données à caractère personnel peuvent
            être collectées, notamment lors de l'inscription au concours, de la complétion d'un profil
            candidat, de l'utilisation des formulaires de contact ou de participation. Ces données
            peuvent inclure : nom, prénom, adresse email, numéro de téléphone, date de naissance,
            adresse postale, photographies, biographie et informations relatives aux réseaux sociaux.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Finalités du traitement</h4>
          <p>
            Les données collectées sont utilisées exclusivement aux fins suivantes : gestion des
            inscriptions et des profils candidats, organisation et administration du concours,
            communication avec les participants, publication des profils sur le site dans le cadre
            de la promotion de l'événement, et respect des obligations légales applicables.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Non-cession des données</h4>
          <p>
            Les données personnelles collectées ne sont <strong className="text-white">en aucun cas vendues,
            louées ou cédées à des tiers</strong> à des fins commerciales. Elles peuvent être
            partagées avec STARLIGHT ASBL dans le strict cadre de l'organisation de l'événement.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Durée de conservation</h4>
          <p>
            Les données sont conservées pendant la durée nécessaire à la réalisation des finalités
            pour lesquelles elles ont été collectées, et au maximum pendant trois (3) ans à compter
            de la fin de l'événement, sauf obligation légale contraire.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Vos droits</h4>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="legal-list">
            <li><strong className="text-white">Droit d'accès</strong> : obtenir la confirmation que des données vous concernant sont traitées et en obtenir une copie ;</li>
            <li><strong className="text-white">Droit de rectification</strong> : faire corriger des données inexactes ou incomplètes ;</li>
            <li><strong className="text-white">Droit à l'effacement</strong> : demander la suppression de vos données dans les cas prévus par la réglementation ;</li>
            <li><strong className="text-white">Droit d'opposition</strong> : vous opposer au traitement de vos données pour des motifs légitimes ;</li>
            <li><strong className="text-white">Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible par machine ;</li>
            <li><strong className="text-white">Droit à la limitation</strong> : demander la limitation du traitement dans certaines circonstances.</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, adressez votre demande par email à{" "}
            <a href="mailto:info@jsinnovia.com" className="legal-link">info@jsinnovia.com</a> ou
            par courrier à l'adresse : Rue Grande 52, 7370 Dour, Belgique. Vous disposez également
            du droit d'introduire une réclamation auprès de l'
            <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" className="legal-link">
              Autorité de protection des données (APD)
            </a>{" "}
            belge.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "droit-image",
    icon: Camera,
    title: "7. Droits à l'image des candidats",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          En s'inscrivant au concours Miss & Mister Dour et en complétant leur profil sur la
          plateforme, les candidats <strong className="text-white">autorisent expressément</strong> la
          diffusion de leurs photographies, images et visuels dans le cadre de l'événement et
          de sa promotion, sur le présent site web ainsi que sur les supports de communication
          officiels de l'événement (réseaux sociaux, affiches, communiqués de presse, etc.).
        </p>
        <p>
          Cette autorisation est accordée à titre gratuit, pour la durée de l'événement et de
          sa promotion, sur tout support numérique ou physique, en Belgique et à l'international.
          Elle peut être révoquée à tout moment par le candidat en adressant une demande écrite
          à <a href="mailto:info@jsinnovia.com" className="legal-link">info@jsinnovia.com</a>.
        </p>
        <p>
          Les photographies et visuels publiés sur le site demeurent la propriété de leurs auteurs
          respectifs ou de STARLIGHT ASBL. Toute réutilisation par des tiers sans autorisation
          écrite préalable est interdite.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "8. Cookies",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Le présent site peut utiliser des <strong className="text-white">cookies techniques</strong> strictement
          nécessaires à son fonctionnement. Ces cookies permettent notamment d'assurer la gestion
          des sessions utilisateurs, la sécurité des connexions et le bon fonctionnement des
          fonctionnalités interactives de la plateforme.
        </p>
        <p>
          Ces cookies techniques ne collectent pas de données à des fins publicitaires ou de
          profilage commercial. Ils sont indispensables au fonctionnement du service et ne
          peuvent pas être désactivés sans altérer les fonctionnalités essentielles du site.
        </p>
        <p>
          Conformément à la directive européenne 2009/136/CE (directive ePrivacy) et à la
          réglementation belge applicable, l'utilisation de cookies strictement nécessaires
          ne requiert pas de consentement préalable de l'utilisateur. Si des cookies non
          essentiels venaient à être utilisés à l'avenir, un mécanisme de consentement
          approprié serait mis en place.
        </p>
        <p>
          Vous pouvez configurer votre navigateur pour refuser ou supprimer les cookies,
          étant entendu que certaines fonctionnalités du site pourraient ne plus être
          disponibles dans ce cas.
        </p>
      </div>
    ),
  },
  {
    id: "responsabilite",
    icon: AlertTriangle,
    title: "9. Responsabilité",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          JS-Innov.IA s'efforce d'assurer l'exactitude et la mise à jour des informations
          diffusées sur ce site. Toutefois, JS-Innov.IA ne peut garantir l'exactitude, la
          complétude ou l'actualité des informations publiées et décline toute responsabilité
          pour les erreurs ou omissions dans le contenu du site.
        </p>
        <p>
          JS-Innov.IA ne saurait être tenu responsable de tout dommage direct ou indirect
          résultant de l'utilisation du site, de l'impossibilité d'y accéder, ou de la
          confiance accordée à toute information y figurant. L'utilisateur est seul responsable
          de l'utilisation qu'il fait du site et de son contenu.
        </p>
        <p>
          Le site peut contenir des liens hypertextes vers des sites tiers. JS-Innov.IA n'exerce
          aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu,
          leurs pratiques en matière de confidentialité ou leur disponibilité.
        </p>
        <p>
          JS-Innov.IA se réserve le droit de modifier, suspendre ou interrompre l'accès au site
          à tout moment et sans préavis, notamment pour des raisons de maintenance technique,
          sans que cela puisse engager sa responsabilité.
        </p>
      </div>
    ),
  },
  {
    id: "droit-applicable",
    icon: Scale,
    title: "10. Droit applicable et juridiction compétente",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Les présentes mentions légales sont régies par le <strong className="text-white">droit belge</strong>.
          En cas de litige relatif à l'interprétation, à l'exécution ou à la validité des présentes,
          et à défaut de résolution amiable, les parties conviennent de soumettre le différend à la
          compétence exclusive des <strong className="text-white">tribunaux de l'arrondissement judiciaire de Mons</strong>,
          Belgique, nonobstant pluralité de défendeurs ou appel en garantie.
        </p>
        <p>
          Cette attribution de compétence s'applique également en matière de référé ou de procédure
          d'urgence. Pour les litiges de consommation, les dispositions impératives du droit belge
          de la consommation demeurent applicables.
        </p>
        <p className="text-sm text-gray-500 border-t border-gray-700 pt-4 mt-4">
          Dernière mise à jour : {LAST_UPDATE}
        </p>
      </div>
    ),
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function LegalNotice() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-background, #0A0A0F)" }}>

      {/* Styles inline pour la page légale */}
      <style>{`
        .legal-link {
          color: #C87941;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .legal-link:hover { color: #D4AF37; }
        .legal-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .legal-table td {
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          vertical-align: top;
        }
        .legal-table td:first-child {
          color: #9CA3AF;
          font-weight: 500;
          width: 40%;
          background: rgba(255,255,255,0.02);
        }
        .legal-table td:last-child { color: #E5E7EB; }
        .legal-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
          space-y: 0.5rem;
        }
        .legal-list li {
          padding: 0.35rem 0 0.35rem 1.25rem;
          position: relative;
          border-left: 2px solid rgba(200,121,65,0.3);
          margin-left: 0.5rem;
          margin-bottom: 0.35rem;
          color: #D1D5DB;
        }
        .legal-list li::before {
          content: "—";
          position: absolute;
          left: -0.1rem;
          color: #C87941;
          font-weight: bold;
        }
      `}</style>

      {/* En-tête */}
      <div className="border-b border-gray-800" style={{ background: "rgba(200,121,65,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour au site
            </Link>
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)" }}
            >
              <Scale className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Mentions Légales
              </h1>
              <p className="text-gray-400 mt-1">
                Miss & Mister Dour 2026 — Conformes au droit belge et au RGPD européen
              </p>
              <p className="text-xs text-gray-500 mt-1">Dernière mise à jour : {LAST_UPDATE}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation rapide */}
      <div className="border-b border-gray-800 bg-gray-900/40 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs text-gray-400 hover:text-white whitespace-nowrap px-3 py-1.5 rounded-full border border-gray-700 hover:border-gray-500 transition-all flex-shrink-0"
              >
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Bannière d'introduction */}
        <div
          className="p-5 rounded-2xl border"
          style={{
            background: "linear-gradient(135deg, rgba(200,121,65,0.08), rgba(212,175,55,0.05))",
            borderColor: "rgba(200,121,65,0.25)",
          }}
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#C87941" }} />
            <p className="text-sm text-gray-300 leading-relaxed">
              Le présent document constitue les mentions légales obligatoires du site web{" "}
              <strong className="text-white">Miss & Mister Dour</strong>, conformément aux
              obligations légales belges (loi du 11 mars 2003 sur certains aspects juridiques
              des services de la société de l'information) et au Règlement Général sur la
              Protection des Données (RGPD — Règlement UE 2016/679).
            </p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(200,121,65,0.15)", border: "1px solid rgba(200,121,65,0.3)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#C87941" }} />
                </div>
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {section.title}
                </h2>
              </div>
              <div
                className="rounded-xl p-6 border"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                {section.content}
              </div>
            </section>
          );
        })}

        {/* Pied de page légal */}
        <div className="border-t border-gray-800 pt-8 text-center space-y-2">
          <p className="text-sm text-gray-400">
            © 2026 <strong className="text-white">JS-Innov.IA</strong> — Julien Pagin.
            Tous droits réservés. Numéro d'entreprise : BE0877926214.
          </p>
          <p className="text-xs text-gray-600">
            Plateforme développée par JS-Innov.IA · Événement organisé en collaboration avec STARLIGHT ASBL
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors">Accueil</Link>
            <span className="text-gray-700">·</span>
            <a href="mailto:info@jsinnovia.com" className="text-xs text-gray-500 hover:text-white transition-colors">
              Contact
            </a>
            <span className="text-gray-700">·</span>
            <a href="https://jsinnovia.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors">
              JS-Innov.IA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
