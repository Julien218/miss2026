/**
 * Configuration de l'identité visuelle Miss & Mister Dour
 * Direction digitale JS-Innov.IA®
 */

export const BRANDING = {
  logoHologram: "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/QqoPYFovLiObmUny.png",
  logoIdentity: "https://d2xsxph8kpxj0f.cloudfront.net/87304619/ikVKix4dpn7zVKKnzoiv6V/miss-mister-dour-logo-transparent_68980609.png",
  logoIdentityCompressed: "https://d2xsxph8kpxj0f.cloudfront.net/87304619/ikVKix4dpn7zVKKnzoiv6V/miss-mister-dour-logo-transparent_68980609.png",

  creator: "JS-Innov.IA",
  creatorEmail: "paginjulien@gmail.com",
  location: "Dour, Belgique",
  year: new Date().getFullYear(),

  copyright: `© ${new Date().getFullYear()} Miss & Mister Dour - Expérience digitale par JS-Innov.IA`,
  rightsReserved: "Tous droits réservés",
  copyProtection: "Propriété intellectuelle protégée",

  colors: {
    gold: "#D7AE69",
    goldLight: "#EAD3A5",
    goldDark: "#9D6043",
    black: "#050403",
    blackSoft: "#0D0A08",
    anthracite: "#211B17",
    white: "#FFFAF1",
    whiteSoft: "#F7EFE1",
    silver: "#C9C3B9",
    silverLight: "#E9E4DA",
    accent: "#B76E4D",
    accentHover: "#D7AE69",
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
    description: "Miss & Mister Dour — édition 2027, une expérience humaine, scénique et digitale à Dour.",
  },

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
