import { motion } from "framer-motion";

type MysteryCandidate = {
  id: string;
  label: string;
  category: "miss" | "mister";
  image: string;
};

const candidates: MysteryCandidate[] = [
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `miss-${i + 1}`,
    label: `Miss mystère ${i + 1}`,
    category: "miss" as const,
    image: `/candidates/2027/miss-${String(i + 1).padStart(2, "0")}-mystere.svg`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `mister-${i + 1}`,
    label: `Mister mystère ${i + 1}`,
    category: "mister" as const,
    image: `/candidates/2027/mister-${String(i + 1).padStart(2, "0")}-mystere.svg`,
  })),
];

export function MysteryCandidates2027() {
  const misses = candidates.filter((candidate) => candidate.category === "miss");
  const misters = candidates.filter((candidate) => candidate.category === "mister");

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-center">
        <span className="font-grotesk text-xs uppercase tracking-[0.34em] text-white/45">
          6 filles
        </span>
        <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden="true" />
        <span className="font-grotesk text-xs uppercase tracking-[0.34em] text-white/45">
          6 garçons
        </span>
        <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden="true" />
        <span className="font-grotesk text-xs uppercase tracking-[0.34em] text-copper-light">
          Révélations à venir
        </span>
      </div>

      <div className="space-y-10">
        {[
          { title: "Les Miss", items: misses },
          { title: "Les Mister", items: misters },
        ].map((group, rowIndex) => (
          <div key={group.title}>
            <div className="mb-4 flex items-center gap-4">
              <h3 className="font-serif text-2xl italic text-champagne md:text-3xl">
                {group.title}
              </h3>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/45 to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
              {group.items.map((candidate, index) => (
                <motion.figure
                  key={candidate.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: (rowIndex * 0.06) + index * 0.055, duration: 0.45 }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  className="group relative overflow-hidden border border-gold/25 bg-[#020713] shadow-[0_18px_70px_rgba(0,0,0,.45)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={candidate.image}
                      alt={candidate.label}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(37,121,255,.08), transparent 45%, rgba(229,183,77,.12))",
                      }}
                    />
                  </div>
                  <figcaption className="border-t border-gold/20 px-3 py-3 text-center">
                    <span className="font-grotesk text-[10px] uppercase tracking-[0.24em] text-white/55">
                      {candidate.category === "miss" ? "Miss" : "Mister"} 2027
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
