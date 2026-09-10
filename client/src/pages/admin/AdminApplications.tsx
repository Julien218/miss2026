import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Clock3, Mail, MapPin, Phone, RefreshCw, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

 type CandidateApplication = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country?: string | null;
  category: string;
  profilePhoto?: string | null;
  profession?: string | null;
  motivation?: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  createdAt?: string | Date | null;
  reviewedAt?: string | Date | null;
};

export default function AdminApplications() {
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/candidate-applications?contestId=1", {
        credentials: "include",
      });
      if (response.status === 401) {
        setLocation("/login?returnTo=/admin/applications");
        return;
      }
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Impossible de charger les candidatures");
      setApplications(Array.isArray(body.applications) ? body.applications : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const visible = useMemo(
    () => (filter === "all" ? applications : applications.filter((item) => item.status === filter)),
    [applications, filter]
  );

  const pendingCount = applications.filter((item) => item.status === "pending").length;

  async function approve(application: CandidateApplication) {
    if (!window.confirm(`Valider la candidature de ${application.firstName} ${application.lastName} ?`)) return;
    setBusyId(application.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/candidate-applications/${application.id}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Validation impossible");
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation impossible");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(application: CandidateApplication) {
    const reason = window.prompt(
      `Motif du refus pour ${application.firstName} ${application.lastName} :`,
      application.rejectionReason || ""
    );
    if (reason === null) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Un motif est obligatoire pour refuser une candidature.");
      return;
    }

    setBusyId(application.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/candidate-applications/${application.id}/reject`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: trimmed }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Refus impossible");
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refus impossible");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#050403] text-[#f7efe1]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050403]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setLocation("/admin")} className="border-white/15 bg-transparent text-white">
              <ArrowLeft className="mr-2 h-4 w-4" /> Cockpit
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#d7ae69]">Élection 2027</p>
              <h1 className="text-xl font-semibold">Nouvelles candidatures</h1>
            </div>
          </div>
          <Button variant="outline" onClick={() => void loadApplications()} disabled={loading} className="border-white/15 bg-transparent text-white">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6 rounded-3xl border border-[#d7ae69]/25 bg-[#d7ae69]/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-3xl font-semibold text-[#ead3a5]">{pendingCount}</div>
              <div className="text-sm text-white/60">candidature{pendingCount === 1 ? "" : "s"} à examiner</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["pending", "approved", "rejected", "all"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${filter === value ? "border-[#d7ae69] bg-[#d7ae69] text-black" : "border-white/15 text-white/70 hover:border-[#d7ae69]/60"}`}
                >
                  {value === "pending" ? "En attente" : value === "approved" ? "Validées" : value === "rejected" ? "Refusées" : "Toutes"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        {loading ? (
          <div className="py-20 text-center text-white/50">Chargement des candidatures…</div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center text-white/50">
            Aucune candidature dans cette catégorie.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {visible.map((application) => (
              <Card key={application.id} className="overflow-hidden border-white/10 bg-[#100d0b] text-[#f7efe1]">
                <CardHeader className="border-b border-white/10">
                  <div className="flex gap-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                      {application.profilePhoto ? (
                        <img src={application.profilePhoto} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound className="m-auto h-full w-8 text-white/25" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#d7ae69]/35 px-2.5 py-1 text-[11px] uppercase tracking-wider text-[#ead3a5]">{application.category}</span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/55">#{application.id}</span>
                      </div>
                      <CardTitle className="text-xl text-[#f7efe1]">{application.firstName} {application.lastName}</CardTitle>
                      <CardDescription className="mt-1 text-white/50">{application.profession || "Profession / études non renseignées"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="grid gap-2 text-sm text-white/65 sm:grid-cols-2">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#d7ae69]" /> {application.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#d7ae69]" /> {application.phone}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#d7ae69]" /> {application.city}{application.country ? `, ${application.country}` : ""}</div>
                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#d7ae69]" /> {application.createdAt ? new Date(application.createdAt).toLocaleString("fr-BE") : "Date indisponible"}</div>
                  </div>

                  {application.motivation && (
                    <div className="rounded-2xl bg-white/[0.035] p-4 text-sm leading-relaxed text-white/65">
                      <div className="mb-1 text-xs uppercase tracking-wider text-[#d7ae69]">Motivation</div>
                      {application.motivation}
                    </div>
                  )}

                  {application.status === "pending" ? (
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button onClick={() => void approve(application)} disabled={busyId === application.id} className="bg-[#d7ae69] text-black hover:bg-[#ead3a5]">
                        <Check className="mr-2 h-4 w-4" /> Valider et créer le candidat
                      </Button>
                      <Button variant="outline" onClick={() => void reject(application)} disabled={busyId === application.id} className="border-red-500/35 bg-transparent text-red-200 hover:bg-red-500/10">
                        <X className="mr-2 h-4 w-4" /> Refuser
                      </Button>
                    </div>
                  ) : (
                    <div className={`rounded-xl px-3 py-2 text-sm ${application.status === "approved" ? "bg-emerald-500/10 text-emerald-200" : "bg-red-500/10 text-red-200"}`}>
                      {application.status === "approved" ? "Candidature validée — candidat créé." : `Candidature refusée${application.rejectionReason ? ` : ${application.rejectionReason}` : "."}`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
