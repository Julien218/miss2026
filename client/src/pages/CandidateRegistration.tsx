import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  User, Mail, Phone, MapPin, Calendar, Sparkles, 
  Upload, Instagram, Facebook, Linkedin, Hash,
  ArrowLeft, ArrowRight, Check, Heart,
  Shield, ShieldCheck, Camera, FileText, AlertCircle, Eye, Lock, Globe
} from "lucide-react";

interface FormData {
  // Étape 1: Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  category: "miss" | "mister" | "";
  
  // Étape 2: Photo et présentation
  photo: File | null;
  photoPreview: string;
  bio: string;
  motivation: string;
  interests: string[];
  profession: string;
  
  // Étape 3: Réseaux sociaux
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  
  // Étape 4: Validation
  acceptRules: boolean;
  acceptMedia: boolean;
  acceptNewsletter: boolean;
  acceptCGU: boolean;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  city: "",
  category: "",
  photo: null,
  photoPreview: "",
  bio: "",
  motivation: "",
  interests: [],
  profession: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  linkedin: "",
  acceptRules: false,
  acceptMedia: false,
  acceptNewsletter: false,
  acceptCGU: false,
};

export default function CandidateRegistration() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  // Mise à jour des champs
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ quand l'utilisateur modifie
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Upload de photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: "La photo ne doit pas dépasser 5MB" }));
        return;
      }
      
      // Validation type
      if (!file.type.startsWith("image/")) {
        setErrors(prev => ({ ...prev, photo: "Le fichier doit être une image" }));
        return;
      }

      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("photo", file);
        updateField("photoPreview", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation étape 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }
    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.phone || !/^(\+32|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Téléphone invalide (format belge)";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "Date de naissance requise";
    } else {
      const age = new Date().getFullYear() - new Date(formData.birthDate).getFullYear();
      if (age < 18 || age > 35) {
        newErrors.birthDate = "Vous devez avoir entre 18 et 35 ans";
      }
    }
    if (!formData.city) {
      newErrors.city = "Ville requise";
    }
    if (!formData.category) {
      newErrors.category = "Veuillez choisir une catégorie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation étape 2
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.photo) {
      newErrors.photo = "Photo requise";
    }
    if (!formData.bio || formData.bio.length < 100 || formData.bio.length > 500) {
      newErrors.bio = "La bio doit contenir entre 100 et 500 caractères";
    }
    if (!formData.motivation || formData.motivation.length < 50) {
      newErrors.motivation = "La motivation doit contenir au moins 50 caractères";
    }
    if (!formData.profession) {
      newErrors.profession = "Profession/Études requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation étape 4
  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.acceptRules) {
      newErrors.acceptRules = "Vous devez accepter le règlement";
    }
    if (!formData.acceptMedia) {
      newErrors.acceptMedia = "Vous devez autoriser l'utilisation des photos/vidéos";
    }
    if (!formData.acceptCGU) {
      newErrors.acceptCGU = "Vous devez accepter les CGU et la Politique de Confidentialité pour finaliser votre inscription";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation entre étapes
  const goToNextStep = () => {
    let isValid = true;
    
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    // Étape 3 (réseaux sociaux) est optionnelle
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Mutation tRPC
  const registerMutation = trpc.candidates.registerPublic.useMutation({
    onSuccess: () => {
      toast.success("Candidature enregistrée avec succès !");
      setLocation("/inscription-merci");
    },
    onError: (error) => {
      console.error("Erreur lors de l'inscription:", error);
      toast.error(error.message || "Une erreur est survenue. Veuillez réessayer.");
      setErrors({ submit: error.message || "Une erreur est survenue. Veuillez réessayer." });
    },
  });

  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateStep4()) return;
    if (!formData.photo) {
      setErrors({ submit: "Photo requise" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convertir la photo en base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.photo);
      
      reader.onloadend = async () => {
        const photoBase64 = reader.result as string;
        
        await registerMutation.mutateAsync({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone.replace(/\s/g, ""),
          birthDate: formData.birthDate,
          city: formData.city,
          category: formData.category as "miss" | "mister",
          photoBase64,
          photoFilename: formData.photo?.name || "photo.jpg",
          bio: formData.bio,
          motivation: formData.motivation,
          interests: formData.interests.filter(i => i.trim() !== ""),
          profession: formData.profession,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktok: formData.tiktok,
          linkedin: formData.linkedin,
          acceptRules: formData.acceptRules,
          acceptMedia: formData.acceptMedia,
          acceptNewsletter: formData.acceptNewsletter,
          acceptCGU: formData.acceptCGU,
          consentVersion: "v1.0",
        });
      };
      
      reader.onerror = () => {
        setErrors({ submit: "Erreur lors de la lecture de la photo" });
        setIsSubmitting(false);
      };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setIsSubmitting(false);
    }
  };

  // Calcul de l'âge
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-4">
      <SEOHead
        title="Inscription Candidat — Miss & Mister Dour 2026"
        description="Inscrivez-vous au concours Miss & Mister Dour 2026. Formulaire d'inscription officiel pour les candidats Miss et Mister. Dour, Belgique."
        url="https://missetmisterdour.be/inscription-candidat"
        tags={["inscription Miss Dour", "candidature Mister Dour", "concours beauté Belgique"]}
      />
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link href="/miss-mister-dour-2026">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mb-6 text-[#C0C0C0] hover:text-[#D4AF37] transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à l'accueil
            </motion.button>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Devenez{" "}
            <span className="bg-gradient-to-r from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
              Miss ou Mister Dour 2026
            </span>
          </h1>
          <p className="text-xl text-[#C0C0C0]">
            Inscrivez-vous et rejoignez l'aventure d'un événement prestigieux
          </p>
        </motion.div>

        {/* Indicateur de progression */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: currentStep >= step ? 1 : 0.8,
                    backgroundColor: currentStep >= step ? "#D4AF37" : "#333"
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10"
                >
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </motion.div>
                {step < 4 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: currentStep > step ? 1 : 0,
                      backgroundColor: "#D4AF37"
                    }}
                    className="h-1 flex-1 mx-2 origin-left"
                    style={{ backgroundColor: currentStep > step ? "#D4AF37" : "#333" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-[#C0C0C0]">
            <span>Informations</span>
            <span>Présentation</span>
            <span>Réseaux</span>
            <span>Validation</span>
          </div>
        </div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/30 p-8 md:p-12"
        >
          <AnimatePresence mode="wait">
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-[#D4AF37]" />
                  Informations personnelles
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Nom *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="Votre nom"
                    />
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="votre@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="+32 XXX XX XX XX"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date de naissance *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => updateField("birthDate", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      />
                    </div>
                    {errors.birthDate && <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>}
                    {formData.birthDate && (
                      <p className="text-[#C0C0C0] text-sm mt-1">Âge: {calculateAge(formData.birthDate)} ans</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Ville *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                        placeholder="Votre ville"
                      />
                    </div>
                    {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-4">Catégorie *</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateField("category", "miss")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.category === "miss"
                          ? "border-[#EC4899] bg-[#EC4899]/10"
                          : "border-[#D4AF37]/30 bg-black/40"
                      }`}
                    >
                      <Sparkles className={`w-8 h-8 mx-auto mb-3 ${
                        formData.category === "miss" ? "text-[#EC4899]" : "text-[#C0C0C0]"
                      }`} />
                      <p className="font-bold text-lg">Miss Dour 2026</p>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateField("category", "mister")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        formData.category === "mister"
                          ? "border-[#3B82F6] bg-[#3B82F6]/10"
                          : "border-[#D4AF37]/30 bg-black/40"
                      }`}
                    >
                      <Sparkles className={`w-8 h-8 mx-auto mb-3 ${
                        formData.category === "mister" ? "text-[#3B82F6]" : "text-[#C0C0C0]"
                      }`} />
                      <p className="font-bold text-lg">Mister Dour 2026</p>
                    </motion.button>
                  </div>
                  {errors.category && <p className="text-red-400 text-sm mt-2">{errors.category}</p>}
                </div>
              </motion.div>
            )}

            {/* Étape 2: Photo et présentation */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Upload className="w-6 h-6 text-[#D4AF37]" />
                  Photo et présentation
                </h2>

                <div>
                  <label className="block text-sm font-semibold mb-4">Photo de profil *</label>
                  <div className="flex flex-col items-center gap-4">
                    {formData.photoPreview ? (
                      <div className="relative">
                        <img
                          src={formData.photoPreview}
                          alt="Prévisualisation"
                          className="w-48 h-48 object-cover rounded-2xl border-2 border-[#D4AF37]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateField("photo", null);
                            updateField("photoPreview", "");
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="w-48 h-48 border-2 border-dashed border-[#D4AF37]/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-colors">
                        <Upload className="w-12 h-12 text-[#D4AF37] mb-2" />
                        <span className="text-sm text-[#C0C0C0]">Cliquez pour uploader</span>
                        <span className="text-xs text-[#C0C0C0] mt-1">Max 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.photo && <p className="text-red-400 text-sm mt-2 text-center">{errors.photo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Bio personnalisée * ({formData.bio.length}/500)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors resize-none"
                    placeholder="Présentez-vous en quelques mots... Cette bio sera utilisée sur les réseaux sociaux."
                  />
                  {errors.bio && <p className="text-red-400 text-sm mt-1">{errors.bio}</p>}
                  <p className="text-xs text-[#C0C0C0] mt-1">Minimum 100 caractères, maximum 500</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Motivations *</label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => updateField("motivation", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors resize-none"
                    placeholder="Pourquoi souhaitez-vous participer à Miss & Mister Dour 2026 ?"
                  />
                  {errors.motivation && <p className="text-red-400 text-sm mt-1">{errors.motivation}</p>}
                  <p className="text-xs text-[#C0C0C0] mt-1">Minimum 50 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Profession / Études *</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => updateField("profession", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                    placeholder="Ex: Étudiant en communication, Entrepreneur, etc."
                  />
                  {errors.profession && <p className="text-red-400 text-sm mt-1">{errors.profession}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Centres d'intérêt</label>
                  <input
                    type="text"
                    value={formData.interests.join(", ")}
                    onChange={(e) => updateField("interests", e.target.value.split(",").map(i => i.trim()))}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                    placeholder="Ex: Danse, Musique, Sport, Voyage (séparés par des virgules)"
                  />
                  <p className="text-xs text-[#C0C0C0] mt-1">Séparez vos centres d'intérêt par des virgules</p>
                </div>
              </motion.div>
            )}

            {/* Étape 3: Réseaux sociaux */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Hash className="w-6 h-6 text-[#D4AF37]" />
                  Réseaux sociaux (optionnel)
                </h2>

                <p className="text-[#C0C0C0] mb-6">
                  Ajoutez vos réseaux sociaux pour augmenter votre visibilité et permettre à vos fans de vous suivre !
                </p>

                <div>
                  <label className="block text-sm font-semibold mb-2">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#EC4899]" />
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="@votre_username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Facebook</label>
                  <div className="relative">
                    <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3B82F6]" />
                    <input
                      type="text"
                      value={formData.facebook}
                      onChange={(e) => updateField("facebook", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="https://facebook.com/votre-profil"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">TikTok</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000000] bg-white rounded" />
                    <input
                      type="text"
                      value={formData.tiktok}
                      onChange={(e) => updateField("tiktok", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="@votre_username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A66C2]" />
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => updateField("linkedin", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-colors"
                      placeholder="https://linkedin.com/in/votre-profil"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 4: Validation */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Check className="w-6 h-6 text-[#D4AF37]" />
                  Récapitulatif et validation
                </h2>

                {/* Récapitulatif */}
                <div className="bg-black/60 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    {formData.photoPreview && (
                      <img
                        src={formData.photoPreview}
                        alt="Photo"
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {formData.firstName} {formData.lastName}
                      </h3>
                      <p className="text-[#C0C0C0] text-sm">
                        {calculateAge(formData.birthDate)} ans • {formData.city}
                      </p>
                      <p className="text-[#C0C0C0] text-sm">{formData.profession}</p>
                      <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                        formData.category === "miss" 
                          ? "bg-[#EC4899]/20 text-[#EC4899]" 
                          : "bg-[#3B82F6]/20 text-[#3B82F6]"
                      }`}>
                        {formData.category === "miss" ? "Miss Dour 2026" : "Mister Dour 2026"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#D4AF37]/20 pt-4">
                    <p className="text-sm text-[#C0C0C0] mb-2"><strong>Bio:</strong></p>
                    <p className="text-sm">{formData.bio}</p>
                  </div>

                  <div className="border-t border-[#D4AF37]/20 pt-4">
                    <p className="text-sm text-[#C0C0C0] mb-2"><strong>Motivations:</strong></p>
                    <p className="text-sm">{formData.motivation}</p>
                  </div>

                  {formData.interests.length > 0 && formData.interests[0] && (
                    <div className="border-t border-[#D4AF37]/20 pt-4">
                      <p className="text-sm text-[#C0C0C0] mb-2"><strong>Centres d'intérêt:</strong></p>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest, index) => (
                          interest && (
                            <span key={index} className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-sm">
                              {interest}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {(formData.instagram || formData.facebook || formData.tiktok || formData.linkedin) && (
                    <div className="border-t border-[#D4AF37]/20 pt-4">
                      <p className="text-sm text-[#C0C0C0] mb-2"><strong>Réseaux sociaux:</strong></p>
                      <div className="flex flex-wrap gap-3">
                        {formData.instagram && (
                          <a href={`https://instagram.com/${formData.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-[#EC4899] hover:underline text-sm">
                            Instagram
                          </a>
                        )}
                        {formData.facebook && (
                          <a href={formData.facebook} target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline text-sm">
                            Facebook
                          </a>
                        )}
                        {formData.tiktok && (
                          <span className="text-[#C0C0C0] text-sm">TikTok: {formData.tiktok}</span>
                        )}
                        {formData.linkedin && (
                          <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:underline text-sm">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkboxes de validation */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acceptRules}
                      onChange={(e) => updateField("acceptRules", e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-[#D4AF37]/30 bg-black/60 checked:bg-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0"
                    />
                    <span className="text-sm group-hover:text-[#D4AF37] transition-colors">
                      J'accepte le règlement du concours Miss & Mister Dour 2026 *
                    </span>
                  </label>
                  {errors.acceptRules && <p className="text-red-400 text-sm">{errors.acceptRules}</p>}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acceptMedia}
                      onChange={(e) => updateField("acceptMedia", e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-[#D4AF37]/30 bg-black/60 checked:bg-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0"
                    />
                    <span className="text-sm group-hover:text-[#D4AF37] transition-colors">
                      J'autorise l'utilisation de mes photos et vidéos pour la promotion de l'événement *
                    </span>
                  </label>
                  {errors.acceptMedia && <p className="text-red-400 text-sm">{errors.acceptMedia}</p>}

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.acceptNewsletter}
                      onChange={(e) => updateField("acceptNewsletter", e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-[#D4AF37]/30 bg-black/60 checked:bg-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0"
                    />
                    <span className="text-sm group-hover:text-[#D4AF37] transition-colors">
                      Je souhaite recevoir la newsletter de Miss & Mister Dour
                    </span>
                  </label>

                  {/* Case à cocher CGU + Politique de Confidentialité — OBLIGATOIRE RGPD */}
                  <div className="border border-[#D4AF37]/30 rounded-xl p-4 bg-[#D4AF37]/5">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.acceptCGU}
                        onChange={(e) => updateField("acceptCGU", e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-[#D4AF37]/50 bg-black/60 checked:bg-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 flex-shrink-0"
                      />
                      <span className="text-sm group-hover:text-[#D4AF37] transition-colors leading-relaxed">
                        <span className="text-[#D4AF37] font-semibold">*</span> J'ai lu et j'accepte les{" "}
                        <a
                          href="/legal/cgu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D4AF37] underline hover:text-[#C87941] font-medium"
                        >
                          Conditions Générales d'Utilisation
                        </a>
                        {" "}et la{" "}
                        <a
                          href="/legal/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D4AF37] underline hover:text-[#C87941] font-medium"
                        >
                          Politique de Confidentialité
                        </a>
                        {" "}de Miss & Mister Dour 2026, incluant le traitement de mes données personnelles conformément au RGPD.
                        <span className="block mt-1 text-xs text-[#C0C0C0]">
                          Consentement horodaté et tracé — Version v1.0 — {new Date().toLocaleDateString('fr-BE')}
                        </span>
                      </span>
                    </label>
                    {errors.acceptCGU && (
                      <p className="text-red-400 text-sm mt-2 ml-8">{errors.acceptCGU}</p>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{errors.submit}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Boutons de navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-[#D4AF37]/20">
            {currentStep > 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevStep}
                className="px-6 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-white hover:border-[#D4AF37] transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Précédent
              </motion.button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNextStep}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-black font-bold hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all flex items-center gap-2"
              >
                Suivant
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-current" />
                    Soumettre ma candidature
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
