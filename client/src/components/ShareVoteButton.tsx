import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareVoteButtonProps {
  candidateName: string;
  candidateId: number;
}

/**
 * ShareVoteButton - Bouton de partage qui apparaît après avoir voté
 * Permet de partager son vote sur Facebook, Twitter et WhatsApp
 */
export function ShareVoteButton({ candidateName, candidateId }: ShareVoteButtonProps) {
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/vote?highlight=${candidateId}`
    : '';
  
  const shareText = `J'ai voté pour ${candidateName} au concours Miss & Mister Dour 2026 ! 🏆✨ Votez vous aussi pour votre favori(te) sur`;

  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'tiktok') => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case 'tiktok':
        url = `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
        break;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
    toast.success(`Partage ${platform} ouvert !`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-pink-500/10 border border-pink-500/30 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="w-6 h-6 text-pink-400" />
        <h3 className="text-xl font-display text-white">Partagez votre vote !</h3>
      </div>
      
      <p className="text-gray-300 mb-4 text-sm">
        Soutenez {candidateName} en partageant votre vote avec vos amis et votre famille
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleShare('facebook')}
          className="flex-1 min-w-[140px] bg-[#1877F2] hover:bg-[#1877F2]/90 text-white border-none"
        >
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </Button>

        <Button
          onClick={() => handleShare('twitter')}
          className="flex-1 min-w-[140px] bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-none"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </Button>

        <Button
          onClick={() => handleShare('whatsapp')}
          className="flex-1 min-w-[140px] bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>

        <Button
          onClick={() => handleShare('tiktok')}
          className="flex-1 min-w-[140px] bg-black hover:bg-black/90 text-white border-none"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="currentColor"/>
          </svg>
          TikTok
        </Button>
      </div>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
        className="mt-4 text-center text-xs text-pink-300/70"
      >
        ✨ Chaque partage compte ! ✨
      </motion.div>
    </motion.div>
  );
}
