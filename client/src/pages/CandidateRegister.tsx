import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Crown, Upload, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function CandidateRegister() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    contestId: 0,
    category: "miss" as const,
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    city: "",
    country: "Belgique",
    height: 0,
    weight: 0,
    measurements: "",
    experience: "",
    motivation: "",
    bio: "",
    profilePhoto: "",
  });

  const { data: contests } = trpc.contests.list.useQuery();
  const activeContests = contests?.filter(c => c.status === 'registration') || [];
  
  const registerMutation = trpc.candidates.register.useMutation({
    onSuccess: () => {
      toast.success("Candidature enregistrée avec succès !");
      setLocation("/my-profile");
    },
    onError: (error) => {
      toast.error("Erreur : " + error.message);
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setFormData({ ...formData, profilePhoto: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.contestId) {
      toast.error("Veuillez sélectionner un concours");
      return;
    }
    if (!formData.firstName || !formData.lastName) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    registerMutation.mutate({
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      height: formData.height || undefined,
      weight: formData.weight || undefined,
    });
  };

  const steps = [
    { number: 1, title: "Informations de base", description: "Vos informations personnelles" },
    { number: 2, title: "Mesures et physique", description: "Vos caractéristiques physiques" },
    { number: 3, title: "Expérience et motivation", description: "Parlez-nous de vous" },
    { number: 4, title: "Photo de profil", description: "Ajoutez votre photo" },
  ];

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Inscription au Concours</h1>
          <p className="text-muted-foreground">
            Complétez votre candidature pour participer à Miss & Mister Dour
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                      currentStep > step.number
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.number
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                  </div>
                  <div className="mt-2 hidden text-center md:block">
                    <p className="text-xs font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="contest">Concours *</Label>
                  <Select
                    value={formData.contestId.toString()}
                    onValueChange={(value) => setFormData({ ...formData, contestId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un concours" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeContests.map((contest) => (
                        <SelectItem key={contest.id} value={contest.id.toString()}>
                          {contest.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miss">Miss</SelectItem>
                      <SelectItem value="mister">Mister</SelectItem>
                      <SelectItem value="teen_miss">Teen Miss</SelectItem>
                      <SelectItem value="teen_mister">Teen Mister</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Physical Measurements */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="height">Taille (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height || ""}
                      onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight || ""}
                      onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="measurements">Mensurations (ex: 90-60-90)</Label>
                  <Input
                    id="measurements"
                    value={formData.measurements}
                    onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
                    placeholder="90-60-90"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Experience and Motivation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="experience">Expérience</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Décrivez votre expérience dans les concours de beauté, le mannequinat, etc."
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="motivation">Motivation</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Pourquoi souhaitez-vous participer à ce concours ?"
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Parlez-nous de vous, vos passions, vos objectifs..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Profile Photo */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Photo de profil</Label>
                  <div className="flex flex-col items-center gap-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-64 w-64 rounded-lg object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() => {
                            setPhotoPreview("");
                            setFormData({ ...formData, profilePhoto: "" });
                          }}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ) : (
                      <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Aucune photo sélectionnée
                          </p>
                        </div>
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>

              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}>
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={registerMutation.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {registerMutation.isPending ? "Envoi..." : "Soumettre ma candidature"}
                  <Crown className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
