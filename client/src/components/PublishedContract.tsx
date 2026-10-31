import { useEffect, useState } from "react";
import type { ContractTemplate } from "@shared/candidate-contract";
function useContract() {
  const [contract, setContract] = useState<ContractTemplate | null>(null),
    [message, setMessage] = useState("Chargement du contrat…");
  useEffect(() => {
    fetch("/api/public/candidate-contract")
      .then(async r => {
        if (!r.ok) throw new Error("Contrat momentanément indisponible.");
        return r.json();
      })
      .then(body => {
        setContract(body.template);
        setMessage(
          body.ready
            ? ""
            : "Le modèle est en cours de préparation par l’organisation."
        );
      })
      .catch(e => setMessage(e.message));
  }, []);
  return { contract, message };
}
export function PublishedContract() {
  const { contract, message } = useContract();
  return (
    <main className="min-h-screen bg-[#faf8f2] px-5 py-10 text-[#171719]">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm text-[#967332]">
          MISS & MISTER DOUR 2027 · STARLIGHT ASBL
        </p>
        <h1 className="my-5 text-3xl font-bold">
          Contrat de participation et annexes
        </h1>
        {!contract ? (
          <p role="status">{message}</p>
        ) : (
          <>
            <p>{contract.version}</p>
            <a
              className="my-5 inline-block underline"
              href={`/api/public/candidate-contract/pdf?version=${encodeURIComponent(contract.version)}`}
              target="_blank"
              rel="noreferrer"
            >
              Télécharger cette version en PDF
            </a>
            {contract.pages.map((page, index) => (
              <section
                key={index}
                className="my-10 border-t border-[#c6ac75] pt-5"
              >
                {page.map((p, i) =>
                  p.style.startsWith("Heading") || p.style === "Title" ? (
                    <h2 key={i} className="my-4 text-xl font-semibold">
                      {p.text}
                    </h2>
                  ) : (
                    <p
                      key={i}
                      className="my-3 whitespace-pre-wrap leading-relaxed"
                    >
                      {p.text}
                    </p>
                  )
                )}
              </section>
            ))}
          </>
        )}
        <a href="/inscription" className="my-6 inline-block underline">
          Retourner à l’inscription
        </a>
      </article>
    </main>
  );
}
export function PublishedContractDock() {
  const { contract } = useContract();
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  if (
    path !== "/inscription" &&
    path !== "/inscription-candidat" &&
    !path.startsWith("/onboarding/candidate/")
  )
    return null;
  return (
    <aside
      className="mmd-contract-dock"
      aria-label="Contrat de participation 2027"
    >
      <span>CONTRAT 2027 {contract && `· ${contract.version}`}</span>
      <strong>Avant de valider votre candidature</strong>
      <p>
        Consultez le contrat complet et ses annexes. Les choix d’image sont
        facultatifs ; l’autorisation du représentant légal est requise pour un
        mineur.
      </p>
      <nav>
        <a href="/contrat">Lire le contrat</a>
        {contract && (
          <a
            href={`/api/public/candidate-contract/pdf?version=${encodeURIComponent(contract.version)}`}
            target="_blank"
            rel="noreferrer"
          >
            Télécharger le PDF
          </a>
        )}
      </nav>
    </aside>
  );
}
