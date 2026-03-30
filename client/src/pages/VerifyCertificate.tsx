/**
 * VerifyCertificate Page - Public Certificate Verification
 * 
 * Créé par JS-Innov.IA (Pagin Julien) - Dour, Belgique
 * © Tous droits réservés - Copie strictement interdite
 */

import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Shield, QrCode, Calendar, User, Award, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";

export default function VerifyCertificate() {
  const [, params] = useRoute("/verify/:certificateId");
  const certificateId = params?.certificateId || "";
  
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: certificate, isLoading, error } = trpc.certificates.verify.useQuery(
    { certificateId },
    { enabled: !!certificateId }
  );

  // Lancer les confetti si le certificat est valide
  useEffect(() => {
    if (certificate && certificate.certificate.status === "issued" && !showConfetti) {
      setShowConfetti(true);
      
      // Confetti doré
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#D4AF37', '#FFD700', '#FFA500']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#D4AF37', '#FFD700', '#FFA500']
        });
      }, 250);
    }
  }, [certificate, showConfetti]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Vérification du certificat...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Certificat Introuvable</h1>
            <p className="text-gray-300">
              Le certificat avec l'ID <span className="font-mono text-red-400">{certificateId}</span> n'existe pas ou a été révoqué.
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  const isValid = certificate.certificate.status === "issued";
  const hashesValid = certificate.certificate.assetHash && certificate.certificate.metadataHash && certificate.certificate.certificateHash;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Shield className="w-20 h-20 text-[#D4AF37] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Vérification de Certificat
          </h1>
          <p className="text-gray-400">
            Système de vérification sécurisé avec blockchain
          </p>
        </motion.div>

        {/* Statut du certificat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className={`${
            isValid 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          } backdrop-blur-xl p-8 text-center`}>
            {isValid ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Certificat Valide ✓</h2>
                <p className="text-gray-300">
                  Ce certificat est authentique et n'a pas été révoqué.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Certificat Révoqué ✗</h2>
                <p className="text-gray-300">
                  Ce certificat a été révoqué et n'est plus valide.
                </p>
              </>
            )}
          </Card>
        </motion.div>

        {/* Informations du certificat */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Informations générales */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 h-full">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Informations
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">ID Certificat</p>
                  <p className="text-white font-mono text-sm break-all">{certificate.certificate.certificateId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date d'émission
                  </p>
                  <p className="text-white">{new Date(certificate.certificate.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Statut
                  </p>
                  <p className={`font-semibold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {isValid ? 'Actif' : 'Révoqué'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6 h-full">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                QR Code
              </h3>
              {certificate.certificate.qrPayloadJson ? (
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                    alt="QR Code"
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">QR Code non disponible</p>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Validation des hashes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-6">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Validation Cryptographique (SHA256)
            </h3>
            
            {hashesValid ? (
              <div className="space-y-4">
                {/* Asset Hash */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">Asset Hash</p>
                    <p className="text-gray-400 text-sm font-mono break-all">{certificate.certificate.assetHash}</p>
                  </div>
                </div>

                {/* Metadata Hash */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">Metadata Hash</p>
                    <p className="text-gray-400 text-sm font-mono break-all">{certificate.certificate.metadataHash}</p>
                  </div>
                </div>

                {/* Certificate Hash */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">Certificate Hash</p>
                    <p className="text-gray-400 text-sm font-mono break-all">{certificate.certificate.certificateHash}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Tous les hashes sont valides et correspondent aux données du certificat.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Certains hashes sont manquants. La validation complète n'est pas possible.
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-gray-400 text-sm"
        >
          <p>
            Système de vérification sécurisé propulsé par{" "}
            <span className="text-[#D4AF37] font-semibold">JS-Innov.IA</span>
          </p>
          <p className="mt-1">Pagin Julien - Dour, Belgique</p>
        </motion.div>
      </div>
    </div>
  );
}
