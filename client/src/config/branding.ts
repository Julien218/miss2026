/**
 * Configuration de l'identité visuelle Miss & Mister Dour
 * Créé par JS-Innov.IA
 * © Tous droits réservés - Copie strictement interdite
 */

export const BRANDING = {
  // Logos officiels
  logoHologram: "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/QqoPYFovLiObmUny.png",
  logoIdentity: "https://d2xsxph8kpxj0f.cloudfront.net/87304619/ikVKix4dpn7zVKKnzoiv6V/miss-mister-dour-logo-transparent_68980609.png",
  logoIdentityCompressed: "https://d2xsxph8kpxj0f.cloudfront.net/87304619/ikVKix4dpn7zVKKnzoiv6V/miss-mister-dour-logo-transparent_68980609.png",

  creator: "JS-Innov.IA",
  creatorEmail: "paginjulien@gmail.com",
  location: "Dour, Belgique",
  year: new Date().getFullYear(),

  copyright: `© ${new Date().getFullYear()} Miss & Mister Dour - Créé par JS-Innov.IA`,
  rightsReserved: "Tous droits réservés",
  copyProtection: "Copie strictement interdite - Propriété intellectuelle protégée",

  // Palette officielle : noir profond, ivoire, champagne et or subtil.
  colors: {
    gold: "#D4AF37",
    goldLight: "#E8C547",
    goldDark: "#B8941E",
    black: "#0A0A0A",
    blackSoft: "#1A1A1A",
    anthracite: "#2D2D2D",
    white: "#FFFFFF",
    whiteSoft: "#F8F8F8",
    silver: "#C0C0C0",
    silverLight: "#E5E5E5",
    accent: "#D4AF37",
    accentHover: "#B8941E",
  },

  socialMedia: {
    facebook: "https://www.facebook.com/p/Miss-et-Mister-Dour-61561536167250/",
    instagram: "https://www.instagram.com/miss_et_mister_dour/",
    tiktok: "https://www.tiktok.com/@miss_mister_dour",
  },

  contact: {
    phone: "+32 475 42 60 42",
    email: "Olivier.trevis@outlook.com",
    address: "Grand Place, 9, 7370 Dour, Belgique",
    organizer: "STARLIGHT asbl",
    responsible: "Olivier Trevis",
  },

  event: {
    name: "Miss & Mister Dour",
    edition: "2027",
    date: "Date à confirmer",
    location: "Dour, Belgique",
    description: "Une expérience humaine, scénique et digitale portée par STARLIGHT ASBL à Dour.",
  },

  /**
   * Soirée de clôture 2027.
   * La date reste volontairement vide tant qu'elle n'est pas officiellement confirmée.
   */
  closingNight: {
    dateISO: "",
    dateDisplay: "Date à confirmer",
    timeDisplay: "Heure à confirmer",
    label: "Miss & Mister Dour",
    theme: "Élection 2027",
    location: "Dour, Belgique",
    venue: "Lieu à confirmer",
  },
} as const;
