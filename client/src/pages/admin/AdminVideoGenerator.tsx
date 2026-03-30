/**
 * AdminVideoGenerator.tsx — Générateur de vidéos IA
 * Réservé exclusivement aux super_admin
 * Créé par JS-Innov.IA — Pagin Julien, Dour, Belgique
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Video, Wand2, Image, FileText, Download, Play,
  ChevronRight, ChevronLeft, Loader2, CheckCircle,
  Sparkles, Film, Clapperboard, Crown, AlertCircle,
  Copy, Check, RefreshCw, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type VideoType = "promo_event" | "candidate_intro" | "sponsor_reel" | "vote_cta" | "winner_reveal" | "custom";
type VideoStyle = "luxury_gold" | "cinematic" | "modern_minimal" | "social_media" | "documentary";
type AspectRatio = "16:9" | "9:16" | "1:1";
type Language = "fr" | "en" | "nl";

interface VideoConfig {
  videoType: VideoType;
  style: VideoStyle;
  duration: number;
  aspectRatio: AspectRatio;
  language: Language;
  customInstructions: string;
  candidateName: string;
  sponsorName: string;
  eventDate: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────
const VIDEO_TYPES = [
  { id: "promo_event" as VideoType, label: "Promotion événement", icon: "🎉", description: "Vidéo de promotion pour la soirée Miss & Mister Dour 2026" },
  { id: "candidate_intro" as VideoType, label: "Présentation candidat", icon: "👑", description: "Vidéo d'introduction personnalisée pour un candidat" },
  { id: "sponsor_reel" as VideoType, label: "Reel sponsor", icon: "🤝", description: "Vidéo de remerciement et mise en avant d'un sponsor" },
  { id: "vote_cta" as VideoType, label: "Appel au vote", icon: "🗳️", description: "Vidéo incitant le public à voter" },
  { id: "winner_reveal" as VideoType, label: "Révélation gagnant", icon: "🏆", description: "Vidéo dramatique de révélation du gagnant" },
  { id: "custom" as VideoType, label: "Personnalisé", icon: "✨", description: "Vidéo entièrement personnalisée selon vos instructions" },
];

const VIDEO_STYLES = [
  { id: "luxury_gold" as VideoStyle, label: "Luxe Doré", icon: "✨", description: "Élégant avec dorures et glamour", colors: ["#D4AF37", "#B8941E", "#1A1A1A"] },
  { id: "cinematic" as VideoStyle, label: "Cinématique", icon: "🎬", description: "Style film hollywoodien dramatique", colors: ["#1A1A2E", "#16213E", "#E94560"] },
  { id: "modern_minimal" as VideoStyle, label: "Moderne Minimaliste", icon: "◻️", description: "Design épuré et contemporain", colors: ["#FFFFFF", "#F5F5F5", "#333333"] },
  { id: "social_media" as VideoStyle, label: "Réseaux Sociaux", icon: "📱", description: "Format vertical 9:16 Instagram/TikTok", colors: ["#E1306C", "#833AB4", "#FCAF45"] },
  { id: "documentary" as VideoStyle, label: "Documentaire", icon: "🎥", description: "Style reportage authentique", colors: ["#2C3E50", "#34495E", "#ECF0F1"] },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];
const ASPECT_RATIOS: { id: AspectRatio; label: string; icon: string }[] = [
  { id: "16:9", label: "Paysage 16:9", icon: "🖥️" },
  { id: "9:16", label: "Portrait 9:16", icon: "📱" },
  { id: "1:1", label: "Carré 1:1", icon: "⬜" },
];

// ─── Composant Principal ──────────────────────────────────────────────────────
export default function AdminVideoGenerator() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Vérification accès super_admin
  if (user && user.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Crown className="w-16 h-16 text-gold/50" />
        <h2 className="text-2xl font-bold text-white">Accès réservé</h2>
        <p className="text-gray-400">Cette fonctionnalité est réservée au Super Administrateur.</p>
        <Button onClick={() => navigate("/admin")} variant="outline" className="border-gold text-gold">
          Retour au dashboard
        </Button>
      </div>
    );
  }

  // ─── État ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [config, setConfig] = useState<VideoConfig>({
    videoType: "promo_event",
    style: "luxury_gold",
    duration: 30,
    aspectRatio: "16:9",
    language: "fr",
    customInstructions: "",
    candidateName: "",
    sponsorName: "",
    eventDate: "19 avril 2026",
  });
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [generatedKeyframes, setGeneratedKeyframes] = useState<any[]>([]);
  const [productionPlan, setProductionPlan] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // ─── Mutations tRPC ───────────────────────────────────────────────────────
  const generateScriptMutation = trpc.videoGenerator.generateScript.useMutation({
    onSuccess: (data) => {
      setGeneratedScript(data.script);
      setStep(2);
      toast.success(`✅ Script généré ! ${data.script.scenes?.length || 0} scènes créées`);
    },
    onError: (err) => {
      toast.error(`Erreur : ${err.message}`);
    },
  });

  const generateKeyframesMutation = trpc.videoGenerator.generateKeyframes.useMutation({
    onSuccess: (data) => {
      setGeneratedKeyframes(data.keyframes);
      toast.success(`✅ Images générées ! ${data.keyframes.filter((k: any) => k.imageUrl).length} keyframes créées`);
    },
    onError: (err) => {
      toast.error(`Erreur keyframes : ${err.message}`);
    },
  });

  const generatePlanMutation = trpc.videoGenerator.generateProductionPlan.useMutation({
    onSuccess: (data) => {
      setProductionPlan(data.plan);
      setStep(3);
      toast.success("✅ Plan de production prêt ! Votre vidéo est prête à être montée");
    },
    onError: (err) => {
      toast.error(`Erreur plan : ${err.message}`);
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleGenerateScript = () => {
    generateScriptMutation.mutate({
      videoType: config.videoType,
      style: config.style,
      duration: config.duration,
      aspectRatio: config.aspectRatio,
      language: config.language,
      customInstructions: config.customInstructions || undefined,
      candidateName: config.candidateName || undefined,
      sponsorName: config.sponsorName || undefined,
      eventDate: config.eventDate || undefined,
    });
  };

  const handleGenerateKeyframes = () => {
    if (!generatedScript?.imagePrompts?.length) return;
    generateKeyframesMutation.mutate({
      imagePrompts: generatedScript.imagePrompts.slice(0, 8),
      style: VIDEO_STYLES.find(s => s.id === config.style)?.label || config.style,
      aspectRatio: config.aspectRatio,
    });
  };

  const handleGeneratePlan = () => {
    if (!generatedScript) return;
    generatePlanMutation.mutate({
      script: generatedScript,
      keyframes: generatedKeyframes,
    });
  };

  const handleCopyScript = () => {
    const text = JSON.stringify(generatedScript, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPlan = () => {
    if (!productionPlan) return;
    const blob = new Blob([JSON.stringify(productionPlan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-production-${config.videoType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedType = VIDEO_TYPES.find(t => t.id === config.videoType);
  const selectedStyle = VIDEO_STYLES.find(s => s.id === config.style);

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg border border-gold/30">
            <Clapperboard className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Générateur de Vidéos IA</h1>
            <p className="text-sm text-gray-400">Créez des vidéos professionnelles pour Miss & Mister Dour 2026</p>
          </div>
        </div>
        <Badge className="bg-gold/20 text-gold border-gold/30 flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Super Admin
        </Badge>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[
          { num: 1, label: "Configuration", icon: Settings },
          { num: 2, label: "Script & Images", icon: Wand2 },
          { num: 3, label: "Plan de production", icon: Film },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              step === s.num
                ? "bg-gold/20 border-gold text-gold"
                : step > s.num
                ? "bg-green-500/20 border-green-500/50 text-green-400"
                : "bg-gray-800/50 border-gray-700 text-gray-500"
            }`}>
              {step > s.num ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <s.icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:block">{s.label}</span>
              <span className="text-xs sm:hidden">{s.num}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* ─── ÉTAPE 1 : Configuration ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Type de vidéo */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-gold" />
                Type de vidéo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VIDEO_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setConfig(c => ({ ...c, videoType: type.id }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      config.videoType === type.id
                        ? "bg-gold/20 border-gold"
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium text-white text-sm">{type.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Style visuel */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                Style visuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VIDEO_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setConfig(c => ({ ...c, style: style.id }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      config.style === style.id
                        ? "bg-gold/20 border-gold"
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{style.icon}</span>
                      <div className="flex gap-1">
                        {style.colors.map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    <div className="font-medium text-white text-sm">{style.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{style.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Paramètres */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gold" />
                Paramètres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Durée */}
              <div>
                <Label className="text-gray-300 mb-2 block">Durée (secondes)</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setConfig(c => ({ ...c, duration: d }))}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        config.duration === d
                          ? "bg-gold/20 border-gold text-gold"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <Label className="text-gray-300 mb-2 block">Format</Label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map(ar => (
                    <button
                      key={ar.id}
                      onClick={() => setConfig(c => ({ ...c, aspectRatio: ar.id }))}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                        config.aspectRatio === ar.id
                          ? "bg-gold/20 border-gold text-gold"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <span>{ar.icon}</span>
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Langue */}
              <div>
                <Label className="text-gray-300 mb-2 block">Langue</Label>
                <div className="flex gap-2">
                  {[{ id: "fr" as Language, label: "🇫🇷 Français" }, { id: "en" as Language, label: "🇬🇧 English" }, { id: "nl" as Language, label: "🇧🇪 Nederlands" }].map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setConfig(c => ({ ...c, language: lang.id }))}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        config.language === lang.id
                          ? "bg-gold/20 border-gold text-gold"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Champs contextuels */}
              {config.videoType === "candidate_intro" && (
                <div>
                  <Label className="text-gray-300 mb-2 block">Nom du/de la candidat(e)</Label>
                  <input
                    type="text"
                    value={config.candidateName}
                    onChange={e => setConfig(c => ({ ...c, candidateName: e.target.value }))}
                    placeholder="Ex: Marie Dupont"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                </div>
              )}
              {config.videoType === "sponsor_reel" && (
                <div>
                  <Label className="text-gray-300 mb-2 block">Nom du sponsor</Label>
                  <input
                    type="text"
                    value={config.sponsorName}
                    onChange={e => setConfig(c => ({ ...c, sponsorName: e.target.value }))}
                    placeholder="Ex: Entreprise XYZ"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                </div>
              )}

              {/* Instructions personnalisées */}
              <div>
                <Label className="text-gray-300 mb-2 block">Instructions personnalisées (optionnel)</Label>
                <Textarea
                  value={config.customInstructions}
                  onChange={e => setConfig(c => ({ ...c, customInstructions: e.target.value }))}
                  placeholder="Décrivez vos besoins spécifiques, le message clé, les éléments à inclure..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gold min-h-[100px]"
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">{config.customInstructions.length}/2000 caractères</p>
              </div>
            </CardContent>
          </Card>

          {/* Résumé + Bouton */}
          <Card className="bg-gold/5 border-gold/30">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <p className="text-white font-medium">
                    {selectedType?.icon} {selectedType?.label} — {selectedStyle?.icon} {selectedStyle?.label}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {config.duration}s · {config.aspectRatio} · {config.language === 'fr' ? 'Français' : config.language === 'en' ? 'English' : 'Nederlands'}
                  </p>
                </div>
                <Button
                  onClick={handleGenerateScript}
                  disabled={generateScriptMutation.isPending}
                  className="bg-gold hover:bg-gold/90 text-black font-bold px-6"
                >
                  {generateScriptMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Générer le script IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── ÉTAPE 2 : Script & Images ───────────────────────────────────── */}
      {step === 2 && generatedScript && (
        <div className="space-y-6">
          {/* Script généré */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  Script généré : {generatedScript.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" onClick={handleCopyScript}>
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1 hidden sm:block">{copied ? "Copié !" : "Copier"}</span>
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" onClick={() => { setStep(1); setGeneratedScript(null); }}>
                    <RefreshCw className="w-4 h-4" />
                    <span className="ml-1 hidden sm:block">Recommencer</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">{generatedScript.description}</p>

              {/* Palette de couleurs */}
              {generatedScript.colorPalette && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Palette :</span>
                  {generatedScript.colorPalette.map((color: string, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded border border-white/20" style={{ backgroundColor: color }} />
                      <span className="text-xs text-gray-400">{color}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Scènes */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gold">Scènes ({generatedScript.scenes?.length || 0})</h3>
                {generatedScript.scenes?.map((scene: any, i: number) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs border-gold/30 text-gold">
                        Scène {scene.id} — {scene.duration}s
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {scene.type} · {scene.cameraMovement}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{scene.description}</p>
                    {scene.textOverlay && (
                      <p className="text-xs text-gold bg-gold/10 px-2 py-1 rounded">
                        💬 {scene.textOverlay}
                      </p>
                    )}
                    {scene.narration && (
                      <p className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded mt-1">
                        🎙️ {scene.narration}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Narration complète */}
              {generatedScript.narrationScript && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-300 mb-2">🎙️ Script de narration complet</h3>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{generatedScript.narrationScript}</p>
                </div>
              )}

              {/* Ambiance musicale */}
              {generatedScript.musicMood && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-300 mb-2">🎵 Ambiance musicale</h3>
                  <p className="text-sm text-gray-300">{generatedScript.musicMood}</p>
                </div>
              )}

              {/* Notes de production */}
              {generatedScript.productionNotes && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">📝 Notes de production</h3>
                  <p className="text-sm text-gray-400">{generatedScript.productionNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Génération des keyframes */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-gold" />
                Images clés (Keyframes)
                {generatedScript.imagePrompts?.length > 0 && (
                  <Badge className="bg-gray-700 text-gray-300">{Math.min(generatedScript.imagePrompts.length, 8)} images</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedKeyframes.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-4">Générez les images clés pour visualiser votre vidéo</p>
                  <Button
                    onClick={handleGenerateKeyframes}
                    disabled={generateKeyframesMutation.isPending || !generatedScript.imagePrompts?.length}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {generateKeyframesMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Génération des images... (peut prendre 1-2 min)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Générer les keyframes IA
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {generatedKeyframes.map((kf, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        {kf.imageUrl ? (
                          <img src={kf.imageUrl} alt={`Scène ${kf.sceneId}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                          </div>
                        )}
                      </div>
                      <Badge className="absolute top-1 left-1 bg-black/70 text-white text-xs">
                        Scène {kf.sceneId}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Reconfigurer
            </Button>
            <Button
              onClick={handleGeneratePlan}
              disabled={generatePlanMutation.isPending}
              className="bg-gold hover:bg-gold/90 text-black font-bold"
            >
              {generatePlanMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération du plan...
                </>
              ) : (
                <>
                  Générer le plan de production
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ─── ÉTAPE 3 : Plan de production ────────────────────────────────── */}
      {step === 3 && productionPlan && (
        <div className="space-y-6">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-lg">Plan de production prêt ! 🎬</h3>
                  <p className="text-gray-300 text-sm">Votre vidéo est entièrement planifiée. Téléchargez le plan et montez votre vidéo.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {productionPlan.timeline && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-gold" />
                  Timeline de montage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productionPlan.timeline.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={`Scène ${item.sceneId}`} className="w-20 h-12 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-gold/20 text-gold text-xs">{item.startTime}s → {item.endTime}s</Badge>
                          {item.transition && <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">{item.transition}</Badge>}
                        </div>
                        {item.textOverlay && <p className="text-xs text-gold truncate">💬 {item.textOverlay}</p>}
                        {item.narration && <p className="text-xs text-blue-300 truncate">🎙️ {item.narration}</p>}
                        {item.animation && <p className="text-xs text-gray-400 truncate">✨ {item.animation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions CapCut */}
          {productionPlan.capCutInstructions && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  📱 Instructions CapCut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{productionPlan.capCutInstructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Recommandations musicales */}
          {productionPlan.musicRecommendations?.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  🎵 Recommandations musicales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {productionPlan.musicRecommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                      <span className="text-gold">•</span> {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Export settings */}
          {productionPlan.exportSettings && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  ⚙️ Paramètres d'export recommandés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(productionPlan.exportSettings).map(([key, val]) => (
                    <div key={key} className="bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">{key}</div>
                      <div className="text-white font-medium text-sm">{String(val)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-between">
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={() => { setStep(1); setGeneratedScript(null); setGeneratedKeyframes([]); setProductionPlan(null); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Nouvelle vidéo
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold/10" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voir le script
              </Button>
              <Button onClick={handleDownloadPlan} className="bg-gold hover:bg-gold/90 text-black font-bold">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le plan JSON
              </Button>
            </div>
          </div>

          {/* Signature JS-Innov.IA */}
          <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800">
            Généré par <span className="text-gold">JS-Innov.IA</span> — Pagin Julien, Dour, Belgique
          </div>
        </div>
      )}
    </div>
  );
}
