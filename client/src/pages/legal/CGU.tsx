import { useEffect } from "react";

export default function CGU() {
  useEffect(() => {
    document.title = "Conditions Générales d'Utilisation - Miss & Mister Dour 2026";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Miss & Mister Dour</h1>
                <p className="text-xs text-gray-400">by STARLIGHT ASBL</p>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-400 mb-8">Dernière mise à jour : 19 février 2026</p>

          <div className="prose prose-invert prose-lg max-w-none">
            {/* Article 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 1 - Objet</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation du site web{" "}
                <strong>missetmisterdour.be</strong> (ci-après « le Site »), édité par l'ASBL STARLIGHT, dans le cadre de l'organisation de l'événement{" "}
                <strong>Miss & Mister Dour 2026</strong>.
              </p>
              <p className="text-gray-300 leading-relaxed">
                L'utilisation du Site implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Site.
              </p>
            </section>

            {/* Article 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 2 - Mentions Légales</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <p className="text-gray-300 mb-2"><strong className="text-white">Éditeur du Site :</strong></p>
                <ul className="list-none space-y-1 text-gray-300 ml-0">
                  <li>STARLIGHT ASBL</li>
                  <li>Numéro d'entreprise (BCE) : BE 1012.267.056</li>
                  <li>Numéro de TVA : BE 1012.267.056</li>
                  <li>Siège social : Grand'Place 9, 7370 Dour, Belgique</li>
                  <li>Email : <a href="mailto:Olivier.trevis@outlook.be" className="text-amber-400 hover:text-amber-300">Olivier.trevis@outlook.be</a></li>
                  <li>Téléphone : <a href="tel:+32475426942" className="text-amber-400 hover:text-amber-300">+32 475 42 69 42</a></li>
                </ul>
                <p className="text-gray-300 mt-4 mb-2"><strong className="text-white">Responsable de publication :</strong></p>
                <p className="text-gray-300">Olivier Trévis, Président de l'ASBL STARLIGHT</p>
              </div>
            </section>

            {/* Article 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 3 - Accès au Site</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Le Site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Tous les frais supportés par l'utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.
              </p>
              <p className="text-gray-300 leading-relaxed">
                L'ASBL STARLIGHT met en œuvre tous les moyens raisonnables à sa disposition pour assurer un accès de qualité au Site, mais n'est tenue à aucune obligation d'y parvenir. L'ASBL STARLIGHT ne peut être tenue responsable de tout dysfonctionnement du réseau ou des serveurs ou de tout autre événement échappant au contrôle raisonnable, qui empêcherait ou dégraderait l'accès au Site.
              </p>
            </section>

            {/* Article 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 4 - Propriété Intellectuelle</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                L'ensemble des éléments du Site (textes, images, vidéos, logos, graphismes, icônes, sons, logiciels, etc.) est la propriété exclusive de l'ASBL STARLIGHT ou de ses partenaires, et est protégé par les lois belges et internationales relatives à la propriété intellectuelle.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'ASBL STARLIGHT.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Le logo <strong>STARLIGHT</strong> est une marque déposée de l'ASBL STARLIGHT. Toute utilisation non autorisée de ce logo constitue une contrefaçon passible de sanctions civiles et pénales.
              </p>
            </section>

            {/* Article 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 5 - Responsabilité</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                L'ASBL STARLIGHT s'efforce de fournir sur le Site des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Tous les informations indiquées sur le Site sont données à titre indicatif, et sont susceptibles d'évoluer. Par ailleurs, les renseignements figurant sur le Site ne sont pas exhaustifs. Ils sont donnés sous réserve de modifications ayant été apportées depuis leur mise en ligne.
              </p>
              <p className="text-gray-300 leading-relaxed">
                L'ASBL STARLIGHT ne saurait être tenue responsable de l'utilisation faite de ces informations, et de tout préjudice direct ou indirect pouvant en découler.
              </p>
            </section>

            {/* Article 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 6 - Données Personnelles</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                L'ASBL STARLIGHT s'engage à respecter la législation en vigueur applicable au traitement de données à caractère personnel et, en particulier, le Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 applicable à compter du 25 mai 2018 (ci-après « RGPD »).
              </p>
              <p className="text-gray-300 leading-relaxed">
                Pour plus d'informations sur le traitement de vos données personnelles, veuillez consulter notre{" "}
                <a href="/legal/privacy" className="text-amber-400 hover:text-amber-300 underline">Politique de Confidentialité</a>.
              </p>
            </section>

            {/* Article 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 7 - Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                Le Site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. Pour plus d'informations sur l'utilisation des cookies, veuillez consulter notre{" "}
                <a href="/legal/cookies" className="text-amber-400 hover:text-amber-300 underline">Politique Cookies</a>.
              </p>
            </section>

            {/* Article 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 8 - Liens Hypertextes</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Le Site peut contenir des liens hypertextes vers d'autres sites présents sur le réseau Internet. Les liens vers ces autres ressources vous font quitter le Site. Il est possible de créer un lien vers la page de présentation de ce site sans autorisation expresse de l'ASBL STARLIGHT.
              </p>
              <p className="text-gray-300 leading-relaxed">
                L'ASBL STARLIGHT ne dispose d'aucun moyen pour contrôler les sites en connexion avec ses sites internet. Elle ne répond pas de la disponibilité de tels sites et sources externes, ni ne la garantit. Elle ne peut être tenue pour responsable de tout dommage, de quelque nature que ce soit, résultant du contenu de ces sites ou sources externes, et notamment des informations, produits ou services qu'ils proposent, ou de tout usage qui peut être fait de ces éléments.
              </p>
            </section>

            {/* Article 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 9 - Inscription et Participation</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-white">Candidature :</strong> Les candidats souhaitant participer à l'événement Miss & Mister Dour 2026 doivent remplir le formulaire d'inscription en ligne et accepter le règlement de l'événement. La candidature est soumise à validation par l'organisation.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-white">Votes :</strong> Le système de vote en ligne est ouvert au public selon les modalités définies par l'organisation. Chaque utilisateur dispose d'un nombre limité de votes par période. Toute tentative de fraude ou de manipulation du système de vote entraînera l'annulation des votes concernés et pourra faire l'objet de poursuites.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">Droits d'image :</strong> En participant à l'événement, les candidats autorisent l'ASBL STARLIGHT à utiliser leur image (photos, vidéos) dans le cadre de la promotion de l'événement, sur le Site, les réseaux sociaux et dans la presse, conformément à la Politique de Confidentialité.
              </p>
            </section>

            {/* Article 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 10 - Modification des CGU</h2>
              <p className="text-gray-300 leading-relaxed">
                L'ASBL STARLIGHT se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de ces modifications par tout moyen utile. Les CGU applicables sont celles en vigueur à la date de connexion et d'utilisation du Site par l'utilisateur.
              </p>
            </section>

            {/* Article 11 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 11 - Droit Applicable et Juridiction</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Les présentes CGU sont régies par le droit belge. En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux compétents de l'arrondissement judiciaire de Mons (Hainaut, Belgique).
              </p>
            </section>

            {/* Article 12 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Article 12 - Contact</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Pour toute question relative aux présentes CGU, vous pouvez nous contacter :
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <ul className="list-none space-y-2 text-gray-300 ml-0">
                  <li><strong className="text-white">Par email :</strong> <a href="mailto:Olivier.trevis@outlook.be" className="text-amber-400 hover:text-amber-300">Olivier.trevis@outlook.be</a></li>
                  <li><strong className="text-white">Par téléphone :</strong> <a href="tel:+32475426942" className="text-amber-400 hover:text-amber-300">+32 475 42 69 42</a></li>
                  <li><strong className="text-white">Par courrier :</strong> STARLIGHT ASBL, Grand'Place 9, 7370 Dour, Belgique</li>
                </ul>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-500 text-center">
                © 2026 STARLIGHT ASBL - Tous droits réservés
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
