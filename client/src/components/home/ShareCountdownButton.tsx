import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, Check, Instagram, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface ShareCountdownButtonProps {
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
}

type ImageFormat = 'standard' | 'instagram' | 'story';

export function ShareCountdownButton({ daysLeft, hoursLeft, minutesLeft }: ShareCountdownButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('standard');

  // Get base URL from env
  const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  
  // Generate share URL with countdown image
  const shareUrl = `${baseUrl}?utm_source=countdown_share`;
  
  // Get image URL based on selected format
  const getImageUrl = (format: ImageFormat) => {
    if (format === 'standard') {
      return `${baseUrl}/api/countdown-image`;
    }
    return `${baseUrl}/api/countdown-image?format=${format}`;
  };
  
  const imageUrl = getImageUrl(selectedFormat);
  
  // Generate share text
  const shareText = `⏰ Plus que ${daysLeft} jours, ${hoursLeft} heures et ${minutesLeft} minutes avant Miss & Mister Dour 2026 ! 👑✨\n\nLa soirée de prestige nationale belge qui célèbre l'élégance, le talent et le charisme.\n\n📅 19 Avril 2026 | Centre Sportif d'Elouges, Rue de la Tournelle 10, 7370 Elouges, Belgique\n\n#MissDour #MisterDour #Dour2026 #Elegance #Prestige #Belgique`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !", {
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
          color: '#0A0A0A',
          fontWeight: 'bold',
        },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `countdown-${selectedFormat}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Image ${selectedFormat} téléchargée !`, {
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
          color: '#0A0A0A',
          fontWeight: 'bold',
        },
      });
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleShare = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast.success(`Partage sur ${platform} ouvert !`, {
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
          color: '#0A0A0A',
          fontWeight: 'bold',
        },
      });
    }
  };

  const formatInfo = {
    standard: { label: 'Standard', size: '1200×630', icon: Image },
    instagram: { label: 'Instagram', size: '1080×1080', icon: Instagram },
    story: { label: 'Story', size: '1080×1920', icon: Share2 },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="bg-gradient-to-r from-[#D4AF37]/10 to-[#B8941E]/10 border-[#D4AF37]/30 hover:border-[#D4AF37]/50 text-[#D4AF37] hover:text-[#E8C547] font-semibold group"
        >
          <Share2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
          Partager le Compte à Rebours
        </Button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-[#D4AF37]/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
              Partager le Compte à Rebours
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Choisissez le format et partagez l'excitation !
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Format selection */}
            <div className="flex gap-2 justify-center">
              {(Object.keys(formatInfo) as ImageFormat[]).map((format) => {
                const info = formatInfo[format];
                const Icon = info.icon;
                return (
                  <Button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    variant={selectedFormat === format ? "default" : "outline"}
                    className={
                      selectedFormat === format
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-black hover:opacity-90"
                        : "border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37]/50"
                    }
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {info.label}
                    <span className="ml-2 text-xs opacity-70">{info.size}</span>
                  </Button>
                );
              })}
            </div>

            {/* Preview image */}
            <div className="relative rounded-lg overflow-hidden border border-[#D4AF37]/20 bg-black/50 flex items-center justify-center min-h-[300px]">
              <img 
                src={imageUrl} 
                alt="Countdown Preview" 
                className={`max-w-full h-auto ${
                  selectedFormat === 'story' ? 'max-h-[500px]' : 'w-full'
                }`}
              />
            </div>

            {/* Download button */}
            <Button
              onClick={handleDownloadImage}
              variant="outline"
              className="w-full border-[#D4AF37]/30 hover:border-[#D4AF37]/50 text-[#D4AF37] hover:text-[#E8C547]"
            >
              <Image className="w-4 h-4 mr-2" />
              Télécharger l'Image
            </Button>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleShare('facebook')}
                className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              
              <Button
                onClick={() => handleShare('twitter')}
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              
              <Button
                onClick={() => handleShare('linkedin')}
                className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              
              <Button
                onClick={() => handleShare('whatsapp')}
                className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Copy link button */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full border-[#D4AF37]/30 hover:border-[#D4AF37]/50 text-[#D4AF37] hover:text-[#E8C547]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Lien Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le Lien
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
