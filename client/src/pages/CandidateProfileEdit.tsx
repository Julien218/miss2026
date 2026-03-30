/**
 * CandidateProfileEdit.tsx
 * Formulaire de remplissage de profil candidat via lien unique (token)
 * Accessible sans connexion : /profile/edit/:token
 * Inclut l'upload de photo de profil vers S3
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import {
  Crown, Instagram, Facebook, User, Phone, MapPin, FileText, Sparkles,
  CheckCircle, AlertCircle, Loader2, ExternalLink, Camera, Upload, X, ImageIcon,
  Shield, ShieldCheck, Lock, Globe, Eye, Check, Mail
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BRANDING } from "@/config/branding";

// Icône TikTok SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  miss: "Miss",
  mister: "Mister",
  teen_miss: "Teen Miss",
  teen_mister: "Teen Mister",
};

// ─── Composant Upload Photo ───────────────────────────────────────────────────
interface PhotoUploadProps {
  token: string;
  currentPhoto: string | null;
  firstName: string;
  lastName: string;
  onPhotoUploaded: (url: string) => void;
}

function PhotoUpload({ token, currentPhoto, firstName, lastName, onPhotoUploaded }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour la preview si currentPhoto change
  useEffect(() => {
    if (currentPhoto && !preview) {
      setPreview(currentPhoto);
    }
  }, [currentPhoto]);

  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);

    // Validation côté client
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Fichier trop volumineux. Maximum 5MB.");
      return;
    }

    // Prévisualisation locale immédiate
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload vers le serveur
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("token", token);

      const response = await fetch("/api/upload/profile-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'upload");
      }

      onPhotoUploaded(result.photoUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setUploadError(err.message || "Erreur lors de l'upload");
      setPreview(currentPhoto); // Restaurer l'ancienne photo en cas d'erreur
    } finally {
      setIsUploading(false);
    }
  }, [token, currentPhoto, onPhotoUploaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removePhoto = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="bg-gray-800/50 border border-gold/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-6 h-6 text-gold" />
        <h2 className="text-xl font-bold text-gold">Photo de profil</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Aperçu de la photo */}
        <div className="relative flex-shrink-0">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt={`${firstName} ${lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-gold/50 shadow-lg shadow-gold/20"
              />
              {!isUploading && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  title="Supprimer la photo"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-dashed border-gray-500 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-500" />
            </div>
          )}
        </div>

        {/* Zone de drop / bouton */}
        <div className="flex-1 w-full">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-gold bg-gold/10"
                : "border-gray-600 hover:border-gold/50 hover:bg-gray-700/30"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
                <p className="text-gold font-medium">Upload en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-white font-medium">
                  {preview ? "Changer la photo" : "Ajouter une photo"}
                </p>
                <p className="text-gray-400 text-sm">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
                <p className="text-gray-500 text-xs">JPG, PNG, WebP · Max 5MB</p>
              </div>
            )}
          </div>

          {/* Messages de statut */}
          {uploadSuccess && (
            <div className="mt-3 flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/30 rounded-lg px-4 py-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Photo uploadée avec succès !</span>
            </div>
          )}
          {uploadError && (
            <div className="mt-3 flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          <p className="text-gray-500 text-xs mt-3">
            Votre photo apparaîtra sur votre page publique de vote. Choisissez une photo récente et de bonne qualité.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CandidateProfileEdit() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";

  const [saved, setSaved] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  // ─── Consentements RGPD ────────────────────────────────────────────────────────────────────────────────
  const [consents, setConsents] = useState({
    acceptRules: false,
    acceptMedia: false,
    acceptCGU: false,
    acceptNewsletter: false,
  });
  const [consentErrors, setConsentErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    phone: "",
    address: "",
    city: "",
    bio: "",
    motivation: "",
    experience: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    linkedin: "",
  });
  const [initialized, setInitialized] = useState(false);

  // Charger le profil existant
  const { data: profile, isLoading, error } = trpc.candidateProfile.getProfileByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  // Initialiser le formulaire avec les données du profil
  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        bio: profile.bio || "",
        motivation: profile.motivation || "",
        experience: profile.experience || "",
        instagram: profile.instagram || "",
        facebook: profile.facebook || "",
        tiktok: profile.tiktok || "",
        linkedin: profile.linkedin || "",
      });
      setCurrentPhoto(profile.profilePhoto || null);
      setInitialized(true);
    }
  }, [profile, initialized]);

  // Mutation de mise à jour du profil textuel
  const updateMutation = trpc.candidateProfile.updateProfileByToken.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Validation des consentements obligatoires
  const validateConsents = (): boolean => {
    const errors: Record<string, string> = {};
    if (!consents.acceptRules) errors.acceptRules = "Vous devez accepter le règlement du concours";
    if (!consents.acceptMedia) errors.acceptMedia = "Vous devez autoriser l'utilisation de votre image";
    if (!consents.acceptCGU) errors.acceptCGU = "Vous devez accepter les CGU et la Politique de Confidentialité";
    setConsentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateConsents()) {
      // Scroller vers la section consentements
      document.getElementById("section-consentements")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    updateMutation.mutate({
      token,
      ...form,
      acceptRules: consents.acceptRules,
      acceptMedia: consents.acceptMedia,
      acceptCGU: consents.acceptCGU,
      acceptNewsletter: consents.acceptNewsletter,
    });
  };

  const handlePhotoUploaded = (url: string) => {
    setCurrentPhoto(url);
  };

  // ─── États de chargement / erreur ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Lien invalide</h1>
          <p className="text-gray-400 mb-6">
            Ce lien de remplissage de profil est invalide, expiré ou a déjà été utilisé.
            Contactez l'organisateur pour obtenir un nouveau lien.
          </p>
          <a
            href="mailto:Olivier.trevis@outlook.be"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors"
          >
            Contacter l'organisateur
          </a>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const publicProfileUrl = `${window.location.origin}/candidat/${profile.candidateId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={BRANDING.logoIdentity}
              alt="Miss & Mister Dour 2026"
              className="h-12 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
            />
          </a>
          <span className="text-gold font-semibold text-sm hidden sm:block">
            Remplissage de profil candidat
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
        <div className="relative z-10">
          <Crown className="w-12 h-12 mx-auto mb-4 text-gold animate-pulse" />
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Bonjour, {profile.firstName} !
          </h1>
          <p className="text-gray-300 text-lg">
            Complétez votre profil{" "}
            <span className="text-gold font-semibold">{CATEGORY_LABELS[profile.category] || profile.category}</span>{" "}
            pour votre page publique de vote
          </p>
        </div>
      </section>

      {/* Lien public */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-2xl mx-auto bg-gold/10 border border-gold/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Sparkles className="w-6 h-6 text-gold flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-gold font-semibold text-sm mb-1">Votre page publique (partageable pour les votes)</p>
            <a
              href={publicProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 text-sm hover:text-gold transition-colors break-all flex items-center gap-1"
            >
              {publicProfileUrl}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(publicProfileUrl)}
            className="px-4 py-2 bg-gold text-black text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors flex-shrink-0"
          >
            Copier le lien
          </button>
        </div>
      </div>

      {/* Formulaire */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Photo de profil ── */}
            <PhotoUpload
              token={token}
              currentPhoto={currentPhoto}
              firstName={profile.firstName}
              lastName={profile.lastName}
              onPhotoUploaded={handlePhotoUploaded}
            />

            {/* ── Informations personnelles ── */}
            <section className="bg-gray-800/50 border border-gold/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-gold" />
                <h2 className="text-xl font-bold text-gold">Informations personnelles</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+32 470 00 00 00"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Dour, Mons, Bruxelles..."
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Adresse complète</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Rue, numéro, code postal, ville"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* ── Présentation ── */}
            <section className="bg-gray-800/50 border border-gold/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-gold" />
                <h2 className="text-xl font-bold text-gold">Votre présentation</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Biographie <span className="text-gray-500">(visible sur votre page publique)</span>
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={4}
                    maxLength={2000}
                    placeholder="Présentez-vous en quelques mots : qui êtes-vous, vos passions, ce qui vous rend unique..."
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">{form.bio.length}/2000</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Motivation <span className="text-gray-500">(pourquoi participez-vous ?)</span>
                  </label>
                  <textarea
                    name="motivation"
                    value={form.motivation}
                    onChange={handleChange}
                    rows={3}
                    maxLength={2000}
                    placeholder="Qu'est-ce qui vous a motivé à participer à Miss & Mister Dour 2026 ?"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expériences <span className="text-gray-500">(concours, modélisme, etc.)</span>
                  </label>
                  <textarea
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    rows={3}
                    maxLength={2000}
                    placeholder="Vos expériences passées dans le domaine de la mode, du spectacle, des concours..."
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            {/* ── Réseaux sociaux ── */}
            <section className="bg-gray-800/50 border border-gold/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-gold" />
                <h2 className="text-xl font-bold text-gold">Réseaux sociaux</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Ajoutez vos comptes pour que vos fans puissent vous suivre et voter pour vous !
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                    <input
                      type="text"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="@votre_pseudo ou https://instagram.com/..."
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Facebook</label>
                    <input
                      type="text"
                      name="facebook"
                      value={form.facebook}
                      onChange={handleChange}
                      placeholder="Votre nom Facebook ou https://facebook.com/..."
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black border border-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TikTokIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">TikTok</label>
                    <input
                      type="text"
                      name="tiktok"
                      value={form.tiktok}
                      onChange={handleChange}
                      placeholder="@votre_pseudo ou https://tiktok.com/@..."
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LinkedInIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      name="linkedin"
                      value={form.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section Consentements RGPD ── */}
            <section id="section-consentements" className="bg-gray-800/50 border border-gold/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gold">Consentements &amp; autorisations</h2>
                  <p className="text-xs text-gray-400">Conformes au RGPD (Règl. UE 2016/679) — Base légale : Art. 6.1.a</p>
                </div>
              </div>

              {/* Barre de progression RGPD */}
              {(() => {
                const total = 3;
                const done = [consents.acceptCGU, consents.acceptRules, consents.acceptMedia].filter(Boolean).length;
                const pct = Math.round((done / total) * 100);
                return (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3 mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {done === total
                          ? <span className="text-green-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Tous les consentements obligatoires validés</span>
                          : <span>Consentements obligatoires : <strong className="text-white">{done}/{total}</strong></span>
                        }
                      </span>
                      <span className="text-xs font-bold" style={{ color: done === total ? "#4ade80" : "#D4AF37" }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: done === total ? "#4ade80" : "linear-gradient(90deg, #D4AF37, #E8C547)" }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-3">

                {/* 1. Règlement — OBLIGATOIRE */}
                <div className={`border rounded-xl p-4 transition-all duration-200 ${
                  consents.acceptRules
                    ? "border-green-500/40 bg-green-500/5"
                    : consentErrors.acceptRules
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-white/10 bg-black/40 hover:border-gold/30"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={consents.acceptRules}
                        onChange={(e) => {
                          setConsents(prev => ({ ...prev, acceptRules: e.target.checked }));
                          if (consentErrors.acceptRules) setConsentErrors(prev => ({ ...prev, acceptRules: "" }));
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        consents.acceptRules ? "bg-green-500 border-green-500" : "border-white/30 bg-black/60"
                      }`}>
                        {consents.acceptRules && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm font-semibold text-white">
                          Règlement du concours
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-normal">Obligatoire</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        J'ai lu et j'accepte le{" "}
                        <a href="/legal/reglement" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-yellow-300">règlement complet du concours</a>
                        {" "}Miss &amp; Mister Dour 2026, incluant les conditions de participation, les critères de sélection et les obligations des candidats.
                      </p>
                    </div>
                  </label>
                  {consentErrors.acceptRules && (
                    <p className="text-red-400 text-xs mt-2 ml-8 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{consentErrors.acceptRules}
                    </p>
                  )}
                </div>

                {/* 2. Droits à l'image — OBLIGATOIRE */}
                <div className={`border rounded-xl p-4 transition-all duration-200 ${
                  consents.acceptMedia
                    ? "border-green-500/40 bg-green-500/5"
                    : consentErrors.acceptMedia
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-white/10 bg-black/40 hover:border-gold/30"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={consents.acceptMedia}
                        onChange={(e) => {
                          setConsents(prev => ({ ...prev, acceptMedia: e.target.checked }));
                          if (consentErrors.acceptMedia) setConsentErrors(prev => ({ ...prev, acceptMedia: "" }));
                        }}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        consents.acceptMedia ? "bg-green-500 border-green-500" : "border-white/30 bg-black/60"
                      }`}>
                        {consents.acceptMedia && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Camera className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm font-semibold text-white">
                          Droit à l'image &amp; utilisation médias
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-normal">Obligatoire</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-2">
                        J'autorise <strong className="text-white">STARLIGHT ASBL</strong> et ses partenaires à capturer, reproduire et diffuser mon image (photos, vidéos, enregistrements audio-visuels) dans le cadre du concours Miss &amp; Mister Dour 2026, à titre gratuit et sans limitation de durée, pour :
                      </p>
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        {[
                          { icon: <Globe className="w-3 h-3" />, label: "Site web officiel" },
                          { icon: <Eye className="w-3 h-3" />, label: "Réseaux sociaux" },
                          { icon: <Camera className="w-3 h-3" />, label: "Supports imprimés" },
                          { icon: <FileText className="w-3 h-3" />, label: "Presse &amp; médias" },
                        ].map(({ icon, label }) => (
                          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="text-gold">{icon}</span>
                            {label}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Conformément à l'art. 10 CEDH et au Code civil belge (art. 8). Droit de retrait à tout moment par écrit.
                      </p>
                    </div>
                  </label>
                  {consentErrors.acceptMedia && (
                    <p className="text-red-400 text-xs mt-2 ml-8 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{consentErrors.acceptMedia}
                    </p>
                  )}
                </div>

                {/* 3. Newsletter — OPTIONNEL */}
                <div className={`border rounded-xl p-4 transition-all duration-200 ${
                  consents.acceptNewsletter
                    ? "border-blue-500/40 bg-blue-500/5"
                    : "border-white/10 bg-black/40 hover:border-white/20"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={consents.acceptNewsletter}
                        onChange={(e) => setConsents(prev => ({ ...prev, acceptNewsletter: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        consents.acceptNewsletter ? "bg-blue-500 border-blue-500" : "border-white/30 bg-black/60"
                      }`}>
                        {consents.acceptNewsletter && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-white">
                          Newsletter &amp; communications
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-normal">Optionnel</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        J'accepte de recevoir les actualités, résultats et informations de Miss &amp; Mister Dour par email. Désinscription possible à tout moment (RGPD Art. 7.3).
                      </p>
                    </div>
                  </label>
                </div>

                {/* 4. CGU + Politique de confidentialité — OBLIGATOIRE */}
                <div className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                  consents.acceptCGU
                    ? "border-gold/60 bg-gold/5"
                    : consentErrors.acceptCGU
                    ? "border-red-500/60 bg-red-500/5"
                    : "border-gold/30 bg-gold/5 hover:border-gold/50"
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={consents.acceptCGU}
                        onChange={(e) => {
                          setConsents(prev => ({ ...prev, acceptCGU: e.target.checked }));
                          if (consentErrors.acceptCGU) setConsentErrors(prev => ({ ...prev, acceptCGU: "" }));
                        }}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        consents.acceptCGU ? "bg-gold border-gold" : "border-gold/50 bg-black/60"
                      }`}>
                        {consents.acceptCGU && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm font-bold text-gold">
                          CGU &amp; Politique de confidentialité
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-normal">Obligatoire</span>
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        J'ai lu et j'accepte les{" "}
                        <a href="/legal/cgu" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-yellow-300 font-medium">
                          Conditions Générales d'Utilisation
                        </a>
                        {" "}et la{" "}
                        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-yellow-300 font-medium">
                          Politique de Confidentialité
                        </a>
                        {" "}de Miss &amp; Mister Dour 2026. Je reconnais que mes données personnelles seront traitées par STARLIGHT ASBL conformément au RGPD (Règl. UE 2016/679).
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-gold" />
                          Responsable : STARLIGHT ASBL, Dour
                        </span>
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-gold" />
                          Consentement horodaté — v1.0 — {new Date().toLocaleDateString('fr-BE')}
                        </span>
                      </div>
                    </div>
                  </label>
                  {consentErrors.acceptCGU && (
                    <p className="text-red-400 text-xs mt-2 ml-9 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{consentErrors.acceptCGU}
                    </p>
                  )}
                </div>

                {/* Note RGPD finale */}
                <div className="flex items-start gap-2 p-3 bg-black/30 border border-white/5 rounded-lg">
                  <Shield className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Vos données sont traitées conformément au RGPD. Vous disposez d'un droit d'accès, de rectification et de suppression (
                    <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-500 underline hover:text-gray-300">Art. 15-17 RGPD</a>
                    ). Contact DPO :{" "}
                    <a href="mailto:dpo@missmisterdour.be" className="text-gray-500 underline hover:text-gray-300">dpo@missmisterdour.be</a>
                  </p>
                </div>

              </div>
            </section>

            {/* ── Bouton de sauvegarde ── */}
            <div className="flex flex-col items-center gap-4">
              {saved && (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/30 rounded-lg px-6 py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Profil sauvegardé avec succès !</span>
                </div>
              )}
              {updateMutation.error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-6 py-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>Erreur : {updateMutation.error.message}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-10 py-4 bg-gold text-black font-bold text-lg rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Sauvegarder mon profil
                  </>
                )}
              </button>
              <p className="text-gray-500 text-sm text-center">
                Vous pouvez revenir sur ce lien à tout moment pour mettre à jour vos informations.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
