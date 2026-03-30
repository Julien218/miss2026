import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    avatar: "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    eventReminders: true,
    newsUpdates: false,
    weeklyDigest: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public" as "public" | "private" | "friends",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowComments: true,
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light" as "light" | "dark" | "auto",
    language: "fr" as "fr" | "en" | "nl",
    fontSize: "medium" as "small" | "medium" | "large",
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // TODO: Implement trpc.users.updateProfile.mutate()
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Profil mis à jour avec succès !");
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    // TODO: Implement trpc.users.updateNotificationSettings.mutate()
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Préférences de notification mises à jour !");
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    // TODO: Implement trpc.users.updatePrivacySettings.mutate()
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Paramètres de confidentialité mis à jour !");
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    // TODO: Implement trpc.users.updateAppearanceSettings.mutate()
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Préférences d'apparence mises à jour !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF8E8] to-[#F5EFE0] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#F4E4C1] rounded-xl shadow-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
              Paramètres
            </h1>
            <p className="text-[#8B7355] mt-1">Gérez vos préférences et votre compte</p>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-[#D4AF37]/20">
          <Tabs defaultValue="profile" className="p-6">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
                <Lock className="w-4 h-4 mr-2" />
                Confidentialité
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white">
                <Palette className="w-4 h-4 mr-2" />
                Apparence
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileSettings.firstName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                    className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileSettings.lastName}
                    onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                    className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                  className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileSettings.phone}
                  onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                  placeholder="+32 123 456 789"
                  className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profileSettings.bio}
                  onChange={(e) => setProfileSettings({ ...profileSettings, bio: e.target.value })}
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                  className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Enregistrement..." : "Enregistrer le profil"}
              </Button>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Notifications par email</Label>
                    <p className="text-sm text-[#8B7355]">Recevoir des notifications par email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Notifications SMS</Label>
                    <p className="text-sm text-[#8B7355]">Recevoir des notifications par SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Notifications push</Label>
                    <p className="text-sm text-[#8B7355]">Recevoir des notifications push sur votre appareil</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Rappels d'événements</Label>
                    <p className="text-sm text-[#8B7355]">Recevoir des rappels avant les événements</p>
                  </div>
                  <Switch
                    checked={notificationSettings.eventReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, eventReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Actualités</Label>
                    <p className="text-sm text-[#8B7355]">Recevoir les dernières actualités du concours</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newsUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, newsUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Résumé hebdomadaire</Label>
                    <p className="text-sm text-[#8B7355]">Recevoir un résumé hebdomadaire par email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Enregistrement..." : "Enregistrer les préférences"}
              </Button>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <div>
                <Label htmlFor="profileVisibility">Visibilité du profil</Label>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) =>
                    setPrivacySettings({ ...privacySettings, profileVisibility: value as any })
                  }
                >
                  <SelectTrigger className="border-[#D4AF37]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                    <SelectItem value="friends">Amis uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Afficher l'email</Label>
                    <p className="text-sm text-[#8B7355]">Rendre votre email visible sur votre profil</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Afficher le téléphone</Label>
                    <p className="text-sm text-[#8B7355]">Rendre votre téléphone visible sur votre profil</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Autoriser les messages</Label>
                    <p className="text-sm text-[#8B7355]">Permettre aux autres utilisateurs de vous envoyer des messages</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowMessages}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowMessages: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-lg border border-[#D4AF37]/20">
                  <div>
                    <Label className="text-base font-semibold text-[#D4AF37]">Autoriser les commentaires</Label>
                    <p className="text-sm text-[#8B7355]">Permettre aux autres utilisateurs de commenter votre profil</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowComments}
                    onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowComments: checked })}
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePrivacy}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}
              </Button>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <div>
                <Label htmlFor="theme">Thème</Label>
                <Select
                  value={appearanceSettings.theme}
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, theme: value as any })}
                >
                  <SelectTrigger className="border-[#D4AF37]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={appearanceSettings.language}
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, language: value as any })}
                >
                  <SelectTrigger className="border-[#D4AF37]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="nl">Nederlands</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fontSize">Taille de police</Label>
                <Select
                  value={appearanceSettings.fontSize}
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, fontSize: value as any })}
                >
                  <SelectTrigger className="border-[#D4AF37]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petite</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSaveAppearance}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Enregistrement..." : "Enregistrer les préférences"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
