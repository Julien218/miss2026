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
  
  // Informations de copyright
  creator: "JS-Innov.IA",
  creatorEmail: "paginjulien@gmail.com",
  location: "Dour, Belgique",
  year: new Date().getFullYear(),
  
  // Mentions légales
  copyright: `© ${new Date().getFullYear()} Miss & Mister Dour - Créé par JS-Innov.IA`,
  rightsReserved: "Tous droits réservés",
  copyProtection: "Copie strictement interdite - Propriété intellectuelle protégée",
  
  // Palette Gala Chic (noir profond, blanc pur, or/argent subtil)
  colors: {
    // Or élégant
    gold: "#D4AF37",
    goldLight: "#E8C547",
    goldDark: "#B8941E",
    
    // Noir profond et anthracite
    black: "#0A0A0A",
    blackSoft: "#1A1A1A",
    anthracite: "#2D2D2D",
    
    // Blanc pur
    white: "#FFFFFF",
    whiteSoft: "#F8F8F8",
    
    // Argent subtil
    silver: "#C0C0C0",
    silverLight: "#E5E5E5",
    
    // Accents
    accent: "#D4AF37",
    accentHover: "#B8941E",
  },
  
  // Réseaux sociaux officiels
  socialMedia: {
    facebook: "https://www.facebook.com/p/Miss-et-Mister-Dour-61561536167250/",
    instagram: "https://www.instagram.com/miss_et_mister_dour/",
    tiktok: "https://www.tiktok.com/@miss_mister_dour",
  },
  
  // Informations de contact
  contact: {
    phone: "+32 475 42 60 42",
    email: "Olivier.trevis@outlook.com",
    address: "Grand Place, 9, 7370 Dour, Belgique",
    organizer: "STARLIGHT asbl",
    responsible: "Olivier Trevis",
  },
  
  // Événement
  event: {
    name: "Miss & Mister Dour",
    edition: "2026",
    date: "19 avril 2026",
    location: "Centre Sportif d'Elouges",
    description: "Concours de beauté et d'élégance organisé depuis 2002 à Dour, Belgique",
  },

  /**
   * ╔══════════════════════════════════════════════════════════╗
   * ║          SOIRÉE DE CLÔTURE — VARIABLE CENTRALE          ║
   * ║  Modifiez uniquement ce bloc pour changer la date/heure ║
   * ╚══════════════════════════════════════════════════════════╝
   *
   * dateISO  : format ISO 8601 — "YYYY-MM-DDTHH:MM:SS+02:00"
   * label    : texte affiché dans le badge et le splash
   * location : lieu affiché dans le countdown
   * theme    : thème artistique de la soirée
   */
  closingNight: {
    dateISO: "2027-04-18T20:00:00+02:00",   // ← MODIFIER ICI pour changer la date
    dateDisplay: "18 Avril 2027",             // ← Texte court affiché dans l'UI
    timeDisplay: "20h00",                     // ← Heure affichée
    label: "Miss & Mister Dour",             // ← Nom affiché (soirée 2026 retirée)
    theme: "Élection 2027",                   // ← Sous-titre
    location: "Dour, Belgique",               // ← Lieu
    venue: "Centre Sportif d'Elouges",        // ← Salle
  },
} as const;
