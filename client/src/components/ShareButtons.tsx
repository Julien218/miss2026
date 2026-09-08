import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, QrCode, Copy, Check, Instagram, Music2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QRCode from "qrcode";

interface ShareButtonsProps {
  candidateId: number;
  candidateName: string;
  candidatePhoto?: string;
  contestName: string;
}

export function ShareButtons({ candidateId, candidateName, candidatePhoto, contestName }: ShareButtonsProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  // Détecter la plateforme au chargement
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /iphone|ipad|ipod|android|mobile/.test(userAgent);
    setIsMobile(mobile);

    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  // Construire l'URL du profil candidat avec le domaine officiel
  // En production, utiliser PUBLIC_BASE_URL (https://missetmisterdour.be)
  // En dev, utiliser window.location.origin pour le test local
  const profileUrl = import.meta.env.VITE_PUBLIC_BASE_URL 
    ? `${import.meta.env.VITE_PUBLIC_BASE_URL}/candidate/${candidateId}`
    : `${window.location.origin}/candidate/${candidateId}`;
  
  // Texte de partage personnalisé avec signature JS-INNOV.IA
  const shareText = `Votez pour ${candidateName} au concours ${contestName} ! 🌟`;
  const shareHashtags = "MissAndMisterDour,Dour2026,Belgique,JSInnovIA";
  
  // Texte complet pour Instagram/TikTok avec signature officielle
  const fullShareText = `${shareText}\n\n#MissAndMisterDour #Dour2026 #Belgique #JSInnovIA\n\n🔗 ${profileUrl}\n\n✨ Miss & Mister Dour 2026 - Élection 19 avril 2026\n🚀 by JS-INNOV.IA\n@JulienPagin`;

  // Générer le QR code
  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(profileUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#D4AF37", // Or
          light: "#0A0A0A", // Noir
        },
      });
      setQrCodeUrl(url);
      setShowQR(true);
    } catch (error) {
      console.error("Erreur génération QR code:", error);
    }
  };

  // Copier le lien
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Toast notification
      toast.success('Lien copié !', {
        icon: '🔗',
        style: {
          background: '#1A1A1A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        },
      });
    } catch (error) {
      console.error("Erreur copie lien:", error);
      toast.error('Erreur lors de la copie', {
        style: {
          background: '#1A1A1A',
          color: '#FF4444',
          border: '1px solid #FF4444',
        },
      });
    }
  };
  
  // Copier le texte complet
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      
      // Toast notification
      toast.success('Texte copié ! Collez-le dans votre story', {
        icon: '✨',
        duration: 3000,
        style: {
          background: '#1A1A1A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        },
      });
    } catch (error) {
      console.error("Erreur copie texte:", error);
      toast.error('Erreur lors de la copie', {
        style: {
          background: '#1A1A1A',
          color: '#FF4444',
          border: '1px solid #FF4444',
        },
      });
    }
  };

  // Ouvrir Instagram avec deep link
  const openInstagram = async () => {
    // Copier le texte d'abord
    await copyText();
    
    if (isMobile) {
      // Toast d'information
      toast.loading('Ouverture d\'Instagram...', {
        duration: 2000,
        icon: '📱',
        style: {
          background: '#1A1A1A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        },
      });
      
      // Essayer d'ouvrir l'app Instagram
      const instagramUrl = platform === 'ios' 
        ? 'instagram://camera' // iOS: ouvre la caméra pour créer une story
        : 'instagram://story-camera'; // Android: ouvre la story camera
      
      // Tenter d'ouvrir l'app
      window.location.href = instagramUrl;
      
      // Fallback vers le web si l'app n'est pas installée (après 2s)
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 2000);
    } else {
      // Sur desktop, ouvrir Instagram web
      window.open('https://www.instagram.com/', '_blank');
      toast.success('Instagram ouvert dans un nouvel onglet', {
        icon: '🌐',
        style: {
          background: '#1A1A1A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        },
      });
    }
  };

  // Ouvrir TikTok avec deep link
  const openTikTok = async () => {
    // Copier le texte d'abord
    await copyText();
    
    if (isMobile) {
      // Toast d'information
      toast.loading('Ouverture de TikTok...', {
        duration: 2000,
        icon: '📱',
        style: {
          background: '#1A1A1A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        },
      });
      
      // Essayer d'ouvrir l'app TikTok
      const tiktokUrl = 'snssdk1233://'; // Deep link universel TikTok
      
      // Tenter d'ouvrir l'app
      window.location.href = tiktokUrl;
      
      // Fallback vers le web si l'app n'est pas installée (après 2s)
      setTimeout(() => {
        window.open('https://www.tiktok.com/', '_blank');
      }, 2000);
    } else {
      // Sur desktop, ouvrir TikTok web
      window.open('https://www.tiktok.com/', '_blank');
      toast.success('TikTok ouvert dans un nouvel onglet', {
        icon: '🌐',
        style: {
          background: '#1A1A1A',
          color: '#D4AF37',
          border: '1px solid #D4AF37',
        },
      });
    }
  };

  // Liens de partage pour chaque plateforme
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}&hashtags=${shareHashtags}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`,
  };

  const socialButtons = [
    {
      name: "Facebook",
      icon: Facebook,
      url: shareLinks.facebook,
      color: "from-[#1877F2] to-[#0C5FCD]",
      hoverColor: "hover:shadow-[#1877F2]/50",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: shareLinks.twitter,
      color: "from-[#1DA1F2] to-[#0C85D0]",
      hoverColor: "hover:shadow-[#1DA1F2]/50",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: shareLinks.linkedin,
      color: "from-[#0A66C2] to-[#004182]",
      hoverColor: "hover:shadow-[#0A66C2]/50",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: shareLinks.whatsapp,
      color: "from-[#25D366] to-[#128C7E]",
      hoverColor: "hover:shadow-[#25D366]/50",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toaster pour les notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      {/* Titre de section */}
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-[#D4AF37]" />
        <h3 className="text-lg font-semibold text-white">Partager ce profil</h3>
      </div>

      {/* Boutons sociaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {socialButtons.map((social, index) => (
          <motion.a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <div className={`relative bg-gradient-to-br ${social.color} rounded-xl p-4 shadow-lg ${social.hoverColor} hover:shadow-2xl transition-all duration-300`}>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex flex-col items-center gap-2">
                <social.icon className="h-6 w-6 text-white" />
                <span className="text-xs font-semibold text-white">{social.name}</span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Actions supplémentaires */}
      <div className="flex gap-3">
        {/* Copier le lien */}
        <motion.div
          className="flex-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={copyLink}
            variant="outline"
            className="w-full border-[#D4AF37]/30 bg-[#1A1A1A]/80 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 text-[#C0C0C0] hover:text-[#D4AF37] transition-all duration-300"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copier le lien
              </>
            )}
          </Button>
        </motion.div>

        {/* QR Code */}
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={generateQRCode}
                variant="outline"
                className="border-[#D4AF37]/30 bg-[#1A1A1A]/80 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 text-[#C0C0C0] hover:text-[#D4AF37] transition-all duration-300"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border-[#D4AF37]/30">
            <DialogHeader>
              <DialogTitle className="text-white">QR Code - {candidateName}</DialogTitle>
              <DialogDescription className="text-[#C0C0C0]">
                Scannez ce code pour accéder au profil
              </DialogDescription>
            </DialogHeader>
            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative p-4 bg-white rounded-xl">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
                <a
                  href={qrCodeUrl}
                  download={`qr-code-${candidateName.toLowerCase().replace(/\s+/g, '-')}.png`}
                  className="w-full"
                >
                  <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#E8C547] hover:to-[#D4AF37] text-[#0A0A0A] font-semibold">
                    Télécharger le QR Code
                  </Button>
                </a>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Instagram & TikTok */}
      <div className="space-y-3 pt-4 border-t border-[#D4AF37]/20">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#C0C0C0]">
            {isMobile ? 'Partagez sur Instagram et TikTok :' : 'Pour Instagram et TikTok, copiez le lien ou le texte complet :'}
          </p>
          {isMobile && (
            <span className="text-xs text-[#D4AF37] font-medium">
              {platform === 'ios' ? '🍎 iOS' : '🤖 Android'}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Instagram */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#D4AF37]">
              <Instagram size={18} />
              <span>Instagram</span>
            </div>
            {isMobile ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={openInstagram}
                  variant="outline"
                  size="sm"
                  className="w-full border-[#D4AF37]/30 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Instagram size={16} className="mr-2" />
                  Ouvrir Instagram
                </Button>
              </motion.div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={copyLink}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#D4AF37]/30 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="ml-2 text-xs">{copied ? "Copié !" : "Copier lien"}</span>
                </Button>
                <Button
                  onClick={copyText}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#D4AF37]/30 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
                >
                  {copiedText ? <Check size={14} /> : <Copy size={14} />}
                  <span className="ml-2 text-xs">{copiedText ? "Copié !" : "Copier texte"}</span>
                </Button>
              </div>
            )}
          </div>

          {/* TikTok */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#D4AF37]">
              <Music2 size={18} />
              <span>TikTok</span>
            </div>
            {isMobile ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={openTikTok}
                  variant="outline"
                  size="sm"
                  className="w-full border-[#D4AF37]/30 bg-black hover:bg-gray-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Music2 size={16} className="mr-2" />
                  Ouvrir TikTok
                </Button>
              </motion.div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={copyLink}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#D4AF37]/30 bg-black hover:bg-gray-900 text-white"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="ml-2 text-xs">{copied ? "Copié !" : "Copier lien"}</span>
                </Button>
                <Button
                  onClick={copyText}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#D4AF37]/30 bg-black hover:bg-gray-900 text-white"
                >
                  {copiedText ? <Check size={14} /> : <Copy size={14} />}
                  <span className="ml-2 text-xs">{copiedText ? "Copié !" : "Copier texte"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {isMobile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-3 space-y-2"
          >
            <p className="text-xs text-[#D4AF37] font-semibold flex items-center gap-2">
              <span>✨</span>
              Instructions rapides :
            </p>
            <ul className="text-xs text-[#C0C0C0] space-y-1 pl-4">
              <li>• Le texte est copié automatiquement</li>
              <li>• L'app va s'ouvrir dans quelques secondes</li>
              <li>• Collez le texte dans votre story ou vidéo</li>
              <li>• Ajoutez le lien dans votre bio ou description</li>
            </ul>
          </motion.div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            💡 Collez le lien dans votre bio Instagram ou dans la description de votre vidéo TikTok
          </p>
        )}
      </div>

      {/* Message encouragement */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-[#C0C0C0] text-center pt-4"
      >
        Partagez pour soutenir {candidateName} ! 🌟
      </motion.p>
    </div>
  );
}
