import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, Copy, Link2, MailWarning, Shield, Trash2, UserPlus } from "lucide-react";

const ROLES = [
  { value: "admin", label: "Administrateur", superAdminOnly: true },
  { value: "directeur", label: "Directeur", superAdminOnly: false },
  { value: "manager", label: "Manager", superAdminOnly: false },
  { value: "jury", label: "Jury", superAdminOnly: false },
  { value: "photographe", label: "Photographe", superAdminOnly: false },
  { value: "viewer", label: "Chorégraphe / Staff", superAdminOnly: false },
  { value: "candidat", label: "Candidat", superAdminOnly: false },
] as const;
const EXPIRIES = [{ value:"24h", label:"24 heures" },{ value:"7d", label:"7 jours" },{ value:"30d", label:"30 jours" },{ value:"never", label:"Sans expiration" }] as const;

export default function AdminInvitations(){
  const { user }=useAuth();
  const isSuperAdmin=user?.role==="super_admin";
  const [email,setEmail]=useState("");
  const [role,setRole]=useState("");
  const [expiresIn,setExpiresIn]=useState("7d");
  const [lastUrl,setLastUrl]=useState("");
  const [copied,setCopied]=useState(false);
  const utils=trpc.useUtils();
  const {data:invitations,isLoading}=trpc.invitations.list.useQuery();
  const createMutation=trpc.invitations.create.useMutation({onSuccess:(data)=>{setLastUrl(data.inviteUrl);setEmail("");setRole("");void utils.invitations.list.invalidate();toast.success("Invitation créée. Le lien est prêt à être partagé.")},onError:(error)=>toast.error(error.message)});
  const deactivateMutation=trpc.invitations.deactivate.useMutation({onSuccess:()=>{toast.success("Invitation désactivée");void utils.invitations.list.invalidate()}});
  const availableRoles=isSuperAdmin?ROLES:ROLES.filter(item=>!item.superAdminOnly);
  const create=()=>{if(!email||!role){toast.error("Email et rôle sont obligatoires");return}createMutation.mutate({email:email.trim().toLowerCase(),role:role as any,expiresIn:expiresIn as any,sendEmail:false,origin:window.location.origin})};
  const copy=async(url:string)=>{try{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800);toast.success("Lien copié") }catch{toast.error("Impossible de copier automatiquement le lien")}};

  return <div className="min-h-screen bg-[#070605] text-white p-4 md:p-7"><div className="max-w-5xl mx-auto space-y-6">
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl grid place-items-center bg-amber-200 text-black"><UserPlus className="w-5 h-5"/></div><h1 className="text-2xl font-semibold">Invitations 2027</h1></div><p className="text-sm text-white/45 mt-2">Créez un accès sécurisé et partagez le lien à la personne concernée.</p></div><div className="px-3 py-2 rounded-xl border border-white/10 bg-white/[.03] text-xs text-white/55 flex items-center gap-2"><Shield className="w-4 h-4 text-amber-200"/>{isSuperAdmin?"Super Admin":"Admin"}</div></header>

    <div className="rounded-2xl border border-amber-200/15 bg-white/[.025] p-5"><div className="flex gap-3 items-start mb-5"><MailWarning className="w-5 h-5 text-amber-200 mt-0.5"/><div><strong className="text-sm">Envoi email automatique non configuré</strong><p className="text-xs text-white/45 mt-1">Railway ne contient actuellement aucun fournisseur SMTP/transactionnel. Le cockpit crée donc un lien fiable à copier ou partager, sans prétendre qu’un email a été envoyé.</p></div></div>
      <div className="grid md:grid-cols-3 gap-4"><div><Label>Email *</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="prenom@exemple.be" className="mt-2 bg-black/30 border-white/10"/></div><div><Label>Rôle *</Label><Select value={role} onValueChange={setRole}><SelectTrigger className="mt-2 bg-black/30 border-white/10"><SelectValue placeholder="Choisir"/></SelectTrigger><SelectContent>{availableRoles.map(item=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div><div><Label>Expiration</Label><Select value={expiresIn} onValueChange={setExpiresIn}><SelectTrigger className="mt-2 bg-black/30 border-white/10"><SelectValue/></SelectTrigger><SelectContent>{EXPIRIES.map(item=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div></div>
      <Button onClick={create} disabled={createMutation.isPending} className="mt-5 bg-amber-200 hover:bg-amber-100 text-black"><Link2 className="w-4 h-4 mr-2"/>{createMutation.isPending?"Création…":"Créer le lien d’invitation"}</Button>
      {lastUrl&&<div className="mt-5 p-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[.05]"><div className="flex items-center gap-2 text-emerald-200 text-sm font-medium"><Check className="w-4 h-4"/>Invitation prête</div><div className="mt-3 flex flex-col sm:flex-row gap-2"><Input readOnly value={lastUrl} className="bg-black/30 border-white/10 text-xs"/><Button variant="outline" onClick={()=>copy(lastUrl)}><Copy className="w-4 h-4 mr-2"/>{copied?"Copié":"Copier"}</Button></div></div>}
    </div>

    <section className="rounded-2xl border border-white/10 bg-white/[.02] overflow-hidden"><div className="px-5 py-4 border-b border-white/10"><h2 className="font-semibold">Invitations existantes</h2><p className="text-xs text-white/40 mt-1">{invitations?.length||0} invitation(s)</p></div>{isLoading?<div className="p-8 text-center text-white/40">Chargement…</div>:invitations?.length?<div className="divide-y divide-white/10">{invitations.map((inv:any)=>{const url=`${window.location.origin}/invitation/${inv.token}`;return <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><strong className="text-sm">{inv.email}</strong><div className="text-xs text-white/40 mt-1">{inv.role} · {inv.isActive?"Active":"Inactive"}{inv.expiresAt?` · expire ${new Date(inv.expiresAt).toLocaleDateString("fr-BE")}`:""}</div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>copy(url)}><Copy className="w-4 h-4 mr-1"/>Copier</Button>{inv.isActive?<Button variant="outline" size="sm" onClick={()=>deactivateMutation.mutate({id:inv.id})}><Trash2 className="w-4 h-4 mr-1"/>Désactiver</Button>:null}</div></div>})}</div>:<div className="p-8 text-center text-white/40">Aucune invitation.</div>}</section>
  </div></div>;
}
