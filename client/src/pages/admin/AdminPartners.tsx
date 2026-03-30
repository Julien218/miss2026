/**
 * AdminPartners.tsx — Gestion des partenaires & sponsors
 * Interface CRUD pour les partenaires du concours Miss & Mister Dour 2026
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Briefcase, Plus, Globe, Mail, Phone, Edit2, Trash2, Star, Search } from "lucide-react";
import { toast } from "sonner";

interface Partner {
  id: number;
  name: string;
  type: "gold" | "silver" | "bronze" | "tech" | "media" | "institutional";
  website: string;
  email: string;
  phone: string;
  description: string;
  active: boolean;
}

const TYPE_LABELS: Record<Partner["type"], string> = {
  gold: "Or",
  silver: "Argent",
  bronze: "Bronze",
  tech: "Technologique",
  media: "Médias",
  institutional: "Institutionnel",
};

const TYPE_COLORS: Record<Partner["type"], string> = {
  gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  silver: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  bronze: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  tech: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  media: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  institutional: "bg-green-500/20 text-green-400 border-green-500/30",
};

const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 1,
    name: "JS-Innov.IA",
    type: "tech",
    website: "https://jsinnovia.com",
    email: "paginjulien@gmail.com",
    phone: "+32 475 42 60 42",
    description: "Partenaire technologique officiel — Architecture IA souveraine européenne.",
    active: true,
  },
  {
    id: 2,
    name: "STARLIGHT asbl",
    type: "institutional",
    website: "",
    email: "Olivier.trevis@outlook.com",
    phone: "+32 475 42 60 42",
    description: "Organisateur officiel du concours Miss & Mister Dour depuis 2002.",
    active: true,
  },
];

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partner | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", type: "bronze" as Partner["type"],
    website: "", email: "", phone: "", description: "", active: true,
  });

  const filtered = partners.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditItem(null);
    setForm({ name: "", type: "bronze", website: "", email: "", phone: "", description: "", active: true });
    setOpen(true);
  };

  const openEdit = (p: Partner) => {
    setEditItem(p);
    setForm({ name: p.name, type: p.type, website: p.website, email: p.email, phone: p.phone, description: p.description, active: p.active });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name) { toast.error("Le nom est obligatoire."); return; }
    if (editItem) {
      setPartners((prev) => prev.map((p) => p.id === editItem.id ? { ...editItem, ...form } : p));
      toast.success("Partenaire mis à jour !");
    } else {
      setPartners((prev) => [...prev, { id: Date.now(), ...form }]);
      toast.success("Partenaire ajouté !");
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
    toast.success("Partenaire supprimé.");
  };

  const toggleActive = (id: number) => {
    setPartners((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-yellow-400" />
              Gestion des Partenaires
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sponsors et partenaires du concours 2026</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gap-2" style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}>
                <Plus className="w-4 h-4" />
                Ajouter un partenaire
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>{editItem ? "Modifier le partenaire" : "Nouveau partenaire"}</DialogTitle>
                <DialogDescription className="text-gray-400">Renseignez les informations du partenaire.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label>Nom *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom de l'entreprise" className="bg-gray-800 border-gray-600" />
                </div>
                <div className="space-y-1">
                  <Label>Type de partenariat</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Partner["type"] })} className="w-full rounded-md bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm">
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Site web</Label>
                  <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" className="bg-gray-800 border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@…" className="bg-gray-800 border-gray-600" />
                  </div>
                  <div className="space-y-1">
                    <Label>Téléphone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+32 …" className="bg-gray-800 border-gray-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Rôle et contribution du partenaire…" className="bg-gray-800 border-gray-600 resize-none" rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                  <Label htmlFor="active" className="cursor-pointer">Partenaire actif (visible sur le site)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-600">Annuler</Button>
                <Button onClick={handleSave} style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}>
                  {editItem ? "Enregistrer" : "Ajouter"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400">Total partenaires</p>
              <p className="text-2xl font-bold text-white">{partners.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-green-400">{partners.filter((p) => p.active).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400">Sponsors Or</p>
              <p className="text-2xl font-bold text-yellow-400">{partners.filter((p) => p.type === "gold").length}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400">Tech / Médias</p>
              <p className="text-2xl font-bold text-blue-400">{partners.filter((p) => p.type === "tech" || p.type === "media").length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <Card className="bg-gray-900/60 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Liste des partenaires</CardTitle>
                <CardDescription className="text-gray-400">{filtered.length} partenaire(s)</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-gray-800 border-gray-600 text-white w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((p) => (
                <div key={p.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${p.active ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800" : "bg-gray-900/30 border-gray-800 opacity-60"}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)" }}>
                    <Briefcase className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{p.name}</p>
                      <Badge className={`text-xs border ${TYPE_COLORS[p.type]}`}>{TYPE_LABELS[p.type]}</Badge>
                      {!p.active && <Badge className="text-xs bg-gray-700 text-gray-400 border-gray-600">Inactif</Badge>}
                    </div>
                    {p.description && <p className="text-xs text-gray-400 mb-2 line-clamp-1">{p.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><Globe className="w-3 h-3" />{p.website.replace("https://", "")}</a>}
                      {p.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>}
                      {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="text-xs text-gray-400 hover:text-white" onClick={() => toggleActive(p.id)}>
                      {p.active ? "Désactiver" : "Activer"}
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-gray-400 hover:text-white" onClick={() => openEdit(p)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-gray-400 hover:text-red-400" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-400">Aucun partenaire trouvé.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
