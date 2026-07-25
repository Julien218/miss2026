import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CandidateOnboardingForm() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  
  // État validation token
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  
  // État formulaire
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Données formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    city: '',
    region: 'wallonie' as 'wallonie' | 'flandre' | 'bruxelles',
    profilePhoto: null as File | null,
    bio: '',
    motivation: '',
    interests: '',
    profession: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
    acceptRules: false,
    acceptMedia: false,
    acceptNewsletter: false,
  });
  
  // Validation token au chargement
  const { data: tokenData, error: tokenQueryError, isLoading: tokenLoading } = trpc.candidateOnboarding.validateToken.useQuery(
    { token: token || '' },
    { enabled: !!token }
  );
  
  useEffect(() => {
    if (!token) {
      setTokenError('Token manquant');
      setLoading(false);
      return;
    }
    
    if (tokenLoading) {
      return;
    }
    
    if (tokenQueryError) {
      setTokenError(tokenQueryError.message);
      setLoading(false);
      return;
    }
    
    if (tokenData) {
      if (tokenData.alreadySubmitted) {
        setTokenError('Vous avez déjà soumis votre candidature');
        setLoading(false);
        return;
      }
      
      setTokenValid(true);
      setEmail(tokenData.email);
      setLoading(false);
    }
  }, [token, tokenData, tokenQueryError, tokenLoading]);
  
  // Soumission formulaire
  const submitMutation = trpc.candidateOnboarding.submitOnboarding.useMutation();
  
  const handleSubmit = async () => {
    if (!token || !formData.profilePhoto) return;
    
    setSubmitting(true);
    
    try {
      // Convertir photo en base64
      const photoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Retirer le préfixe data:image/...;base64,
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(formData.profilePhoto!);
      });
      
      // Soumettre
      await submitMutation.mutateAsync({
        token,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        city: formData.city,
        region: formData.region,
        bio: formData.bio,
        motivation: formData.motivation || undefined,
        interests: formData.interests ? [formData.interests] : undefined,
        profession: formData.profession,
        photo: {
          data: photoBase64,
          mimeType: formData.profilePhoto.type,
          filename: formData.profilePhoto.name,
        },
        instagram: formData.instagram || undefined,
        facebook: formData.facebook || undefined,
        tiktok: formData.tiktok || undefined,
        linkedin: formData.linkedin || undefined,
        acceptRules: formData.acceptRules,
        acceptMedia: formData.acceptMedia,
        acceptNewsletter: formData.acceptNewsletter,
      });
      
      // Rediriger vers page confirmation
      alert('Candidature soumise avec succès ! Vous recevrez une réponse par email.');
      setLocation('/');
    } catch (error: any) {
      alert('Erreur lors de la soumission : ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Affichage loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Vérification du lien...</div>
      </div>
    );
  }
  
  // Affichage erreur token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-zinc-900 border-red-500/20">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Lien invalide</h1>
          <p className="text-zinc-400 mb-6">{tokenError}</p>
          <Button onClick={() => setLocation('/')} className="w-full">
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }
  
  // Formulaire
  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 bg-zinc-900 border-[#C8A45C]/20">
          <h1 className="text-3xl font-bold text-[#C8A45C] mb-2">
            Inscription Candidat
          </h1>
          <p className="text-zinc-400 mb-8">
            Complétez votre profil pour participer à Miss & Mister Dour 2026
          </p>
          
          {/* Indicateur de progression */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-[#C8A45C]' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
          
          {/* Étape 1: Informations personnelles */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Informations Personnelles
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-white">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-zinc-800 border-zinc-700 text-zinc-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="+32 XXX XX XX XX"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="birthDate" className="text-white">Date de naissance *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-white">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="region" className="text-white">Région *</Label>
                  <select
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white"
                    required
                  >
                    <option value="wallonie">Wallonie</option>
                    <option value="flandre">Flandre</option>
                    <option value="bruxelles">Bruxelles</option>
                  </select>
                </div>
              </div>
              
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-[#C8A45C] text-black hover:bg-[#B8941E]"
                disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.birthDate || !formData.city}
              >
                Suivant
              </Button>
            </div>
          )}
          
          {/* Étape 2: Photo et présentation */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Photo et Présentation
              </h2>
              
              <div>
                <Label htmlFor="photo" className="text-white">Photo de profil * (max 5MB)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 5 * 1024 * 1024) {
                      setFormData({ ...formData, profilePhoto: file });
                    } else {
                      alert('Photo trop volumineuse (max 5MB)');
                    }
                  }}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bio" className="text-white">Bio personnalisée * (min 50 caractères)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                  required
                />
                <p className="text-zinc-500 text-sm mt-1">
                  {formData.bio.length} caractères
                </p>
              </div>
              
              <div>
                <Label htmlFor="motivation" className="text-white">Motivations</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="interests" className="text-white">Centres d'intérêt</Label>
                <Input
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Sport, musique, voyage..."
                />
              </div>
              
              <div>
                <Label htmlFor="profession" className="text-white">Profession/Études *</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Précédent
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[#C8A45C] text-black hover:bg-[#B8941E]"
                  disabled={!formData.profilePhoto || !formData.bio || formData.bio.length < 50 || !formData.profession}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
          
          {/* Étape 3: Réseaux sociaux */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Réseaux Sociaux (optionnel)
              </h2>
              
              <div>
                <Label htmlFor="instagram" className="text-white">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <Label htmlFor="facebook" className="text-white">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="https://facebook.com/..."
                />
              </div>
              
              <div>
                <Label htmlFor="tiktok" className="text-white">TikTok</Label>
                <Input
                  id="tiktok"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="@username"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Précédent
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-[#C8A45C] text-black hover:bg-[#B8941E]"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
          
          {/* Étape 4: Validation et soumission */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Validation et Soumission
              </h2>
              
              <div className="bg-zinc-800 p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-[#C8A45C]">Récapitulatif</h3>
                <div className="text-zinc-300 space-y-2">
                  <p><strong>Nom:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {email}</p>
                  <p><strong>Téléphone:</strong> {formData.phone}</p>
                  <p><strong>Ville:</strong> {formData.city}</p>
                  <p><strong>Région:</strong> {formData.region}</p>
                  <p><strong>Profession:</strong> {formData.profession}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptRules}
                    onChange={(e) => setFormData({ ...formData, acceptRules: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-white text-sm">
                    J'accepte le règlement de Miss & Mister Dour 2026 *
                  </span>
                </label>
                
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptMedia}
                    onChange={(e) => setFormData({ ...formData, acceptMedia: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-white text-sm">
                    J'autorise la diffusion de mes photos et vidéos
                  </span>
                </label>
                
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptNewsletter}
                    onChange={(e) => setFormData({ ...formData, acceptNewsletter: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-white text-sm">
                    J'accepte de recevoir la newsletter (optionnel)
                  </span>
                </label>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                >
                  Précédent
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#C8A45C] text-black hover:bg-[#B8941E]"
                  disabled={!formData.acceptRules || submitting}
                >
                  {submitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
