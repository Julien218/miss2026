/**
 * LegalCGU.tsx — Conditions Générales d'Utilisation
 * Règlement complet du concours Miss & Mister Dour 2026
 * Conforme au droit belge — JS-Innov.IA / STARLIGHT ASBL
 */

import { Link } from "wouter";
import {
  FileText, ArrowLeft, Users, Trophy, Star, Vote,
  Camera, Shield, Scale, Phone, AlertTriangle, CheckCircle, Crown
} from "lucide-react";
import { BRANDING } from "@/config/branding";

const LAST_UPDATE = "8 mars 2026";
const EDITION = "2026";
const CLOSING_DATE_INSCRIPTION = "31 mars 2026";
const DATE_FINALE = "19 avril 2026";
const VOTE_WEIGHT_PUBLIC = "30";
const VOTE_WEIGHT_JURY = "70";

const SECTIONS = [
  {
    id: "objet",
    icon: FileText,
    title: "1. Objet et champ d'application",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir
          les conditions d'accès et d'utilisation de la plateforme numérique{" "}
          <strong className="text-white">Miss & Mister Dour</strong>, accessible à l'adresse{" "}
          <a href="https://missetmisterdour.be" className="cgu-link">missetmisterdour.be</a>, ainsi que
          le règlement officiel du concours <em>Miss & Mister Dour {EDITION}</em>.
        </p>
        <p>
          La plateforme est éditée par <strong className="text-white">JS-Innov.IA</strong> (Julien Pagin,
          BE0877926214) et mise à disposition pour l'événement organisé par{" "}
          <strong className="text-white">STARLIGHT ASBL</strong>. L'utilisation de la plateforme, à quelque
          titre que ce soit (visiteur, candidat, votant, partenaire), implique l'acceptation pleine et
          entière des présentes CGU.
        </p>
        <p>
          Toute personne n'acceptant pas ces conditions est invitée à ne pas utiliser la plateforme.
          L'éditeur se réserve le droit de modifier les présentes CGU à tout moment ; les modifications
          prennent effet dès leur publication en ligne.
        </p>
      </div>
    ),
  },
  {
    id: "concours",
    icon: Crown,
    title: "2. Présentation du concours",
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Le concours <strong className="text-white">Miss & Mister Dour {EDITION}</strong> est un concours
          de beauté, d'élégance et de personnalité ouvert aux résidents de la région de Dour et des
          communes avoisinantes. Il est organisé par <strong className="text-white">STARLIGHT ASBL</strong>,
          dont le siège social est établi à Grand'Place 9, 7370 Dour, Belgique (BCE : BE 1012.267.056).
        </p>
        <p>
          Le concours comporte deux catégories distinctes et complémentaires :
        </p>
        <table className="cgu-table">
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong className="text-white">Miss Dour {EDITION}</strong></td>
              <td>Ouverte aux candidates féminines répondant aux critères d'éligibilité</td>
            </tr>
            <tr>
              <td><strong className="text-white">Mister Dour {EDITION}</strong></td>
              <td>Ouverte aux candidats masculins répondant aux critères d'éligibilité</td>
            </tr>
          </tbody>
        </table>
        <p>
          La soirée de clôture et de remise des titres, intitulée{" "}
          <strong className="text-white">Lady Gaga Night</strong>, se tiendra le{" "}
          <strong className="text-white">{DATE_FINALE}</strong> à Dour, Belgique.
        </p>
      </div>
    ),
  },
  {
    id: "eligibilite",
    icon: CheckCircle,
    title: "3. Critères d'éligibilité",
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Pour participer au concours Miss & Mister Dour {EDITION}, tout candidat doit impérativement
          satisfaire à l'ensemble des conditions suivantes au moment de l'inscription :
        </p>
        <table className="cgu-table">
          <thead>
            <tr>
              <th>Critère</th>
              <th>Condition requise</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Âge</td>
              <td>Être âgé(e) de 16 ans minimum et de 35 ans maximum à la date de clôture des inscriptions</td>
            </tr>
            <tr>
              <td>Résidence</td>
              <td>Résider ou travailler dans la région du Cœur du Hainaut (Dour et communes avoisinantes) ou y être originaire</td>
            </tr>
            <tr>
              <td>Nationalité</td>
              <td>Être de nationalité belge ou être résident légal en Belgique</td>
            </tr>
            <tr>
              <td>Disponibilité</td>
              <td>Être disponible pour participer aux séances de préparation, aux répétitions et à la soirée de clôture du {DATE_FINALE}</td>
            </tr>
            <tr>
              <td>Casier judiciaire</td>
              <td>Ne pas avoir fait l'objet d'une condamnation pénale définitive incompatible avec la représentation publique</td>
            </tr>
            <tr>
              <td>Profil complet</td>
              <td>Avoir complété son profil candidat sur la plateforme à 100 % avant la date de clôture des inscriptions</td>
            </tr>
          </tbody>
        </table>
        <p>
          STARLIGHT ASBL se réserve le droit de vérifier l'exactitude des informations fournies et
          d'écarter tout candidat ne satisfaisant pas aux critères ci-dessus ou ayant fourni des
          informations inexactes. Toute fausse déclaration entraîne la disqualification immédiate,
          même après la proclamation des résultats.
        </p>
      </div>
    ),
  },
  {
    id: "inscription",
    icon: Users,
    title: "4. Procédure d'inscription",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Les inscriptions au concours Miss & Mister Dour {EDITION} sont ouvertes jusqu'au{" "}
          <strong className="text-white">{CLOSING_DATE_INSCRIPTION}</strong> à minuit (heure belge).
          Aucune inscription ne sera acceptée après cette date.
        </p>
        <p>
          La procédure d'inscription se déroule exclusivement via la plateforme numérique et comprend
          les étapes suivantes :
        </p>
        <ol className="cgu-ordered-list">
          <li>Remplir le formulaire d'inscription en ligne accessible à <a href="/inscription-candidat" className="cgu-link">/inscription-candidat</a></li>
          <li>Compléter intégralement son profil candidat (photo officielle, biographie, coordonnées, réseaux sociaux)</li>
          <li>Accepter les présentes CGU et le règlement du concours</li>
          <li>Recevoir la confirmation d'inscription par email de la part de l'organisation</li>
        </ol>
        <p>
          L'inscription est gratuite et sans engagement financier pour le candidat. STARLIGHT ASBL
          se réserve le droit de limiter le nombre de candidats par catégorie selon les capacités
          organisationnelles de l'événement.
        </p>
        <p>
          Tout candidat inscrit autorise l'organisation à utiliser ses coordonnées pour les
          communications relatives au concours, conformément à la politique de confidentialité
          et au RGPD.
        </p>
      </div>
    ),
  },
  {
    id: "vote",
    icon: Vote,
    title: "5. Modalités de vote",
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          Le classement final des candidats est établi selon une pondération combinant le vote du
          public et la délibération du jury officiel, selon la répartition suivante :
        </p>
        <table className="cgu-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Pondération</th>
              <th>Modalités</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong className="text-white">Vote du public</strong></td>
              <td><strong className="text-white">{VOTE_WEIGHT_PUBLIC} %</strong></td>
              <td>Via la plateforme en ligne, accessible à tous les visiteurs</td>
            </tr>
            <tr>
              <td><strong className="text-white">Délibération du jury</strong></td>
              <td><strong className="text-white">{VOTE_WEIGHT_JURY} %</strong></td>
              <td>Évaluation par le jury officiel lors de la soirée de clôture</td>
            </tr>
          </tbody>
        </table>

        <div>
          <h4 className="text-white font-semibold mb-2">Règles du vote public</h4>
          <p>
            Chaque visiteur de la plateforme peut voter une fois par candidat et par période de vote.
            Le vote est nominatif et nécessite une connexion via le système d'authentification de la
            plateforme. Tout vote effectué de manière automatisée, par robot, script ou tout autre
            procédé visant à fausser les résultats sera annulé et pourra entraîner la disqualification
            du candidat bénéficiaire.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Jury officiel</h4>
          <p>
            Le jury est composé de personnalités désignées par STARLIGHT ASBL. Ses délibérations sont
            souveraines et confidentielles. Le jury évalue les candidats sur des critères incluant
            la présentation, la personnalité, l'éloquence, l'engagement social et l'adéquation avec
            les valeurs du concours. Les décisions du jury sont définitives et sans appel.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Prix Réseaux Sociaux</h4>
          <p>
            Un prix spécial « Réseaux Sociaux » est attribué au candidat ayant obtenu le plus grand
            engagement sur ses réseaux sociaux (Instagram, Facebook, TikTok) durant la période du
            concours. Ce prix est calculé automatiquement par la plateforme sur la base des statistiques
            publiques des profils déclarés par les candidats lors de leur inscription.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "titres",
    icon: Trophy,
    title: "6. Titres et récompenses",
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>
          À l'issue de la soirée de clôture du <strong className="text-white">{DATE_FINALE}</strong>,
          les titres suivants seront décernés :
        </p>
        <table className="cgu-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong className="text-white">Miss Dour {EDITION}</strong></td>
              <td>Féminine</td>
              <td>Titre principal décerné à la lauréate féminine</td>
            </tr>
            <tr>
              <td><strong className="text-white">Mister Dour {EDITION}</strong></td>
              <td>Masculine</td>
              <td>Titre principal décerné au lauréat masculin</td>
            </tr>
            <tr>
              <td><strong className="text-white">1ère Dauphine / 1er Dauphin</strong></td>
              <td>Les deux</td>
              <td>Titre décerné aux candidats classés en deuxième position</td>
            </tr>
            <tr>
              <td><strong className="text-white">2ème Dauphine / 2ème Dauphin</strong></td>
              <td>Les deux</td>
              <td>Titre décerné aux candidats classés en troisième position</td>
            </tr>
            <tr>
              <td><strong className="text-white">Prix Réseaux Sociaux</strong></td>
              <td>Les deux</td>
              <td>Candidat(e) ayant le plus grand engagement social numérique</td>
            </tr>
            <tr>
              <td><strong className="text-white">Prix du Public</strong></td>
              <td>Les deux</td>
              <td>Candidat(e) ayant reçu le plus de votes du public en ligne</td>
            </tr>
          </tbody>
        </table>
        <p>
          Les lauréats reçoivent un certificat officiel numérique signé et un trophée physique lors
          de la soirée de clôture. Les titres sont valables pour l'édition {EDITION} uniquement et
          ne confèrent aucun droit de participation automatique aux éditions suivantes.
        </p>
        <p>
          En cas d'égalité parfaite, le jury tranche souverainement. Tout titre peut être retiré en
          cas de violation des présentes CGU, de comportement contraire aux valeurs du concours ou
          de fausse déclaration avérée.
        </p>
      </div>
    ),
  },
  {
    id: "obligations",
    icon: Star,
    title: "7. Obligations des candidats",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          En s'inscrivant au concours, chaque candidat s'engage à respecter les obligations suivantes
          pendant toute la durée du concours et jusqu'à la soirée de clôture :
        </p>
        <ol className="cgu-ordered-list">
          <li>Maintenir un comportement respectueux envers les autres candidats, l'organisation, le jury et le public, tant en personne que sur les réseaux sociaux.</li>
          <li>Compléter son profil candidat sur la plateforme à 100 % avant la date de clôture des inscriptions.</li>
          <li>Participer aux séances de préparation, répétitions et événements officiels organisés par STARLIGHT ASBL, sauf empêchement majeur dûment justifié.</li>
          <li>Ne pas solliciter de votes de manière abusive, frauduleuse ou contraire à l'éthique (achat de votes, bots, faux comptes).</li>
          <li>Ne pas tenir de propos diffamatoires, racistes, sexistes ou discriminatoires en lien avec le concours.</li>
          <li>Informer l'organisation dans les meilleurs délais de tout changement de situation susceptible d'affecter son éligibilité.</li>
          <li>Respecter les consignes vestimentaires et protocolaires communiquées par l'organisation.</li>
          <li>Ne pas conclure de contrats d'exclusivité ou d'accords commerciaux en lien avec le titre éventuel sans accord préalable de STARLIGHT ASBL.</li>
        </ol>
        <p>
          Tout manquement grave à ces obligations peut entraîner la disqualification immédiate du
          candidat, sans indemnité ni recours possible. La décision appartient souverainement à
          STARLIGHT ASBL.
        </p>
      </div>
    ),
  },
  {
    id: "image",
    icon: Camera,
    title: "8. Droits à l'image et médias",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          En s'inscrivant au concours, chaque candidat accorde à STARLIGHT ASBL et à JS-Innov.IA
          une autorisation non exclusive d'utiliser ses photographies, images, vidéos et tout autre
          contenu visuel le représentant, dans le cadre de la promotion de l'événement Miss & Mister
          Dour {EDITION} et de ses éditions futures.
        </p>
        <p>Cette autorisation couvre notamment :</p>
        <ul className="cgu-list">
          <li>la publication sur le site web officiel et les réseaux sociaux de l'événement ;</li>
          <li>l'utilisation dans les supports de communication imprimés (affiches, flyers, programmes) ;</li>
          <li>la diffusion dans les médias locaux et régionaux (presse, télévision, radio) ;</li>
          <li>la création de contenus promotionnels numériques (vidéos, stories, reels) ;</li>
          <li>l'archivage documentaire de l'événement.</li>
        </ul>
        <p>
          Cette autorisation est accordée à titre gratuit, pour une durée de cinq (5) ans à compter
          de la date de la soirée de clôture, sur tout support et territoire. Elle peut être révoquée
          à tout moment par écrit adressé à{" "}
          <a href="mailto:info@jsinnovia.com" className="cgu-link">info@jsinnovia.com</a>, sous réserve
          des contenus déjà diffusés.
        </p>
        <p>
          Les photographies réalisées par les photographes officiels de l'événement restent la
          propriété de leurs auteurs. Les candidats peuvent les utiliser à titre personnel et
          non commercial, avec mention de la source.
        </p>
      </div>
    ),
  },
  {
    id: "plateforme",
    icon: Shield,
    title: "9. Utilisation de la plateforme",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          L'accès à certaines fonctionnalités de la plateforme (espace candidat, vote, messagerie)
          nécessite la création d'un compte utilisateur via le système d'authentification intégré.
          L'utilisateur s'engage à fournir des informations exactes, complètes et à jour.
        </p>
        <p>Il est strictement interdit :</p>
        <ul className="cgu-list">
          <li>d'utiliser la plateforme à des fins illégales ou contraires à l'ordre public ;</li>
          <li>de tenter d'accéder de manière non autorisée aux systèmes ou données de la plateforme ;</li>
          <li>de publier des contenus illicites, diffamatoires, injurieux, pornographiques ou portant atteinte aux droits de tiers ;</li>
          <li>d'utiliser des robots, scripts ou tout procédé automatisé pour interagir avec la plateforme ;</li>
          <li>de perturber ou tenter de perturber le fonctionnement normal de la plateforme ;</li>
          <li>de créer plusieurs comptes pour un même utilisateur afin de multiplier les votes.</li>
        </ul>
        <p>
          Tout manquement à ces règles peut entraîner la suspension ou la suppression du compte,
          sans préavis ni indemnité, et sans préjudice de toute action en justice.
        </p>
      </div>
    ),
  },
  {
    id: "responsabilite",
    icon: AlertTriangle,
    title: "10. Responsabilité",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          JS-Innov.IA s'efforce d'assurer la disponibilité, la sécurité et la fiabilité de la
          plateforme, mais ne peut garantir une disponibilité ininterrompue à 100 %. Des interruptions
          ponctuelles pour maintenance ou mise à jour peuvent survenir.
        </p>
        <p>
          JS-Innov.IA et STARLIGHT ASBL déclinent toute responsabilité pour les dommages directs
          ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme,
          d'une interruption de service, d'une perte de données ou d'une intrusion informatique
          malgré les mesures de sécurité mises en place.
        </p>
        <p>
          L'organisation se réserve le droit de modifier, suspendre ou annuler le concours en cas
          de force majeure (catastrophe naturelle, pandémie, décision administrative, etc.), sans
          que cela puisse donner lieu à une quelconque indemnisation des candidats.
        </p>
      </div>
    ),
  },
  {
    id: "droit",
    icon: Scale,
    title: "11. Droit applicable et contact",
    content: (
      <div className="space-y-3 text-gray-300 leading-relaxed">
        <p>
          Les présentes CGU sont régies par le <strong className="text-white">droit belge</strong>.
          Tout litige relatif à leur interprétation, leur exécution ou leur validité sera soumis,
          à défaut de résolution amiable, à la compétence exclusive des{" "}
          <strong className="text-white">tribunaux de l'arrondissement judiciaire de Mons</strong>.
        </p>
        <p>Pour toute question relative aux présentes CGU ou au concours :</p>
        <table className="cgu-table">
          <tbody>
            <tr>
              <td>Organisation</td>
              <td>STARLIGHT ASBL — Grand'Place 9, 7370 Dour</td>
            </tr>
            <tr>
              <td>Plateforme</td>
              <td>JS-Innov.IA — Rue Grande 52, 7370 Dour</td>
            </tr>
            <tr>
              <td>Email</td>
              <td><a href="mailto:info@jsinnovia.com" className="cgu-link">info@jsinnovia.com</a></td>
            </tr>
            <tr>
              <td>Téléphone</td>
              <td>+32 494 11 90 90</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-500 border-t border-gray-700 pt-4 mt-4">
          Dernière mise à jour : {LAST_UPDATE}
        </p>
      </div>
    ),
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

export default function LegalCGU() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-background, #0A0A0F)" }}>

      <style>{`
        .cgu-link {
          color: #C87941;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .cgu-link:hover { color: #D4AF37; }
        .cgu-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin: 0.5rem 0;
        }
        .cgu-table th {
          padding: 0.6rem 0.75rem;
          border: 1px solid rgba(200,121,65,0.25);
          background: rgba(200,121,65,0.1);
          color: #C87941;
          font-weight: 600;
          text-align: left;
        }
        .cgu-table td {
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.07);
          color: #D1D5DB;
          vertical-align: top;
        }
        .cgu-table td:first-child {
          color: #9CA3AF;
          font-weight: 500;
          background: rgba(255,255,255,0.02);
          white-space: nowrap;
        }
        .cgu-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }
        .cgu-list li {
          padding: 0.35rem 0 0.35rem 1.25rem;
          position: relative;
          border-left: 2px solid rgba(200,121,65,0.3);
          margin-left: 0.5rem;
          margin-bottom: 0.35rem;
          color: #D1D5DB;
        }
        .cgu-list li::before {
          content: "—";
          position: absolute;
          left: -0.1rem;
          color: #C87941;
          font-weight: bold;
        }
        .cgu-ordered-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
          counter-reset: cgu-counter;
        }
        .cgu-ordered-list li {
          counter-increment: cgu-counter;
          padding: 0.5rem 0 0.5rem 2.5rem;
          position: relative;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          margin-bottom: 0.25rem;
          color: #D1D5DB;
        }
        .cgu-ordered-list li::before {
          content: counter(cgu-counter);
          position: absolute;
          left: 0.5rem;
          width: 1.5rem;
          height: 1.5rem;
          background: rgba(200,121,65,0.2);
          border: 1px solid rgba(200,121,65,0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          color: #C87941;
          top: 0.5rem;
        }
      `}</style>

      {/* En-tête */}
      <div className="border-b border-gray-800" style={{ background: "rgba(200,121,65,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour au site
            </a>
          </Link>
          <div className="flex items-start gap-4">
            {/* Logo */}
            <img
              src={BRANDING.logoIdentity}
              alt="Miss & Mister Dour 2026"
              className="h-16 w-auto object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-gray-400 mt-1">
                Règlement officiel du concours Miss & Mister Dour {EDITION}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: "rgba(200,121,65,0.4)", color: "#C87941", background: "rgba(200,121,65,0.08)" }}>
                  Droit belge applicable
                </span>
                <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: "rgba(200,121,65,0.4)", color: "#C87941", background: "rgba(200,121,65,0.08)" }}>
                  Édition {EDITION}
                </span>
                <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: "rgba(200,121,65,0.4)", color: "#C87941", background: "rgba(200,121,65,0.08)" }}>
                  Mise à jour : {LAST_UPDATE}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation rapide */}
      <div className="border-b border-gray-800 bg-gray-900/40 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
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

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Bannière résumé */}
        <div
          className="p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ background: "rgba(200,121,65,0.05)", borderColor: "rgba(200,121,65,0.2)" }}
        >
          {[
            { icon: Users, label: "Inscriptions", value: `Jusqu'au ${CLOSING_DATE_INSCRIPTION}` },
            { icon: Vote, label: "Vote public", value: `${VOTE_WEIGHT_PUBLIC} % du classement` },
            { icon: Trophy, label: "Soirée finale", value: DATE_FINALE },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(200,121,65,0.15)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#C87941" }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
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
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                {section.content}
              </div>
            </section>
          );
        })}

        {/* Liens vers autres pages légales */}
        <div
          className="p-6 rounded-2xl border"
          style={{ background: "rgba(200,121,65,0.04)", borderColor: "rgba(200,121,65,0.15)" }}
        >
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Documents légaux complémentaires
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: "/mentions-legales", label: "Mentions Légales", desc: "Éditeur, hébergement, PI" },
              { href: "/legal/privacy", label: "Politique de confidentialité", desc: "RGPD, données personnelles" },
              { href: "/legal/cookies", label: "Politique cookies", desc: "Cookies techniques" },
            ].map(({ href, label, desc }) => (
              <Link key={href} href={href}>
                <a
                  className="block p-4 rounded-xl border transition-all hover:border-opacity-60"
                  style={{ borderColor: "rgba(200,121,65,0.2)", background: "rgba(255,255,255,0.02)" }}
                >
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
            © {EDITION} <strong className="text-white">JS-Innov.IA</strong> — Julien Pagin ·
            Événement organisé par <strong className="text-white">STARLIGHT ASBL</strong>
          </p>
          <p className="text-xs text-gray-600">
            BE0877926214 · Rue Grande 52, 7370 Dour, Belgique · info@jsinnovia.com
          </p>
        </div>
      </div>
    </div>
  );
}
