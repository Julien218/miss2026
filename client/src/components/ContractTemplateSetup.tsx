import { useEffect, useState } from "react";
import {
  CONTRACT_SETUP_FIELDS,
  type ContractTemplate,
} from "@shared/candidate-contract";
import { Button } from "@/components/ui/button";

export async function openPrivatePdf(url: string, init?: RequestInit) {
  // Fetch inside the authenticated embedded document. Opening a site URL in a
  // separate tab loses the partitioned Cockpit cookie in supported browsers.
  const response = await fetch(url, { ...init, credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Impossible d’ouvrir le document.");
  }
  const blob = await response.blob();
  if (!blob.type.includes("pdf"))
    throw new Error("Le serveur n’a pas renvoyé un PDF.");
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.target = "_blank";
  a.rel = "noopener";
  a.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000);
}

export function ContractTemplateSetup() {
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [values, setValues] = useState<string[]>(
    CONTRACT_SETUP_FIELDS.map(() => "")
  );
  const [canValidate, setCanValidate] = useState(false),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/admin/candidate-contract-template", { credentials: "include" })
      .then(async r => {
        if (!r.ok) throw new Error("Modèle contractuel indisponible.");
        return r.json();
      })
      .then(body => {
        setTemplate(body.template);
        setCanValidate(body.canValidate === true);
        if (body.template?.values) setValues(body.template.values);
      })
      .catch(e => setMessage(e.message));
  }, []);
  async function act(publish: boolean) {
    setBusy(true);
    setMessage("");
    try {
      if (publish) {
        const response = await fetch("/api/admin/candidate-contract-template", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values, confirm }),
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Validation impossible.");
        setTemplate(body.template);
        setConfirm(false);
        setMessage(
          "Modèle validé. Les nouvelles inscriptions peuvent accepter cette version ; les anciens contrats sont conservés."
        );
      } else
        await openPrivatePdf("/api/admin/candidate-contract-template/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values }),
        });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mb-6 rounded-2xl border border-[#d7ae69]/25 bg-[#d7ae69]/5 p-5">
      <h2 className="text-lg font-semibold">
        Contrat et validation des inscriptions
      </h2>
      <p className="mt-2 text-sm text-white/75">
        {template
          ? `Version ouverte aux inscriptions : ${template.version}`
          : "Avant les nouvelles inscriptions, Olivier complète et valide les informations de l’organisation."}
      </p>
      <p className="mt-2 text-sm text-white/65">
        La génération du PDF ne signe pas le contrat. Chaque candidature reste à
        examiner et à valider par Olivier depuis son compte Cockpit.
      </p>
      {canValidate && (
        <details className="mt-4">
          <summary className="cursor-pointer text-[#ead3a5]">
            Compléter et relire le modèle
          </summary>
          <p className="my-3 text-sm text-white/65">
            Renseignez chaque rubrique ou indiquez « Néant » si elle ne
            s’applique pas. Vérifiez notamment le règlement remis, les frais,
            l’assurance, les partenaires et les durées de conservation du
            contrat avant publication.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {CONTRACT_SETUP_FIELDS.map((field, index) => (
              <label key={field} className="text-sm">
                <span className="mb-1 block text-white/80">{field}</span>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-white/20 bg-black/40 p-3 text-white"
                  value={values[index] || ""}
                  maxLength={4000}
                  onChange={e => {
                    setValues(current =>
                      current.map((v, i) => (i === index ? e.target.value : v))
                    );
                    setConfirm(false);
                  }}
                />
              </label>
            ))}
          </div>
          <label className="my-4 flex gap-3 text-sm">
            <input
              type="checkbox"
              checked={confirm}
              onChange={e => setConfirm(e.target.checked)}
            />
            J’ai relu le modèle complet et validé les informations de la fiche
            pratique ainsi que les durées et les conditions annoncées aux
            candidats.
          </label>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => void act(false)}
            >
              Prévisualiser le contrat complet
            </Button>
            <Button disabled={busy || !confirm} onClick={() => void act(true)}>
              Valider le modèle pour les nouvelles inscriptions
            </Button>
          </div>
        </details>
      )}
      {message && (
        <p className="mt-3 text-sm text-[#ead3a5]" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
