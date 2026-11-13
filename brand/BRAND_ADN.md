# Miss & Mister Dour — Bible ADN 2027 canonique

Statut : **production 2027 / documenté depuis la branche réellement déployée**  
Dernier alignement : 2026-11-13 (charte visuelle 2027 de Julien)

## Source de vérité
Pour l'identité 2027, l'ordre d'autorité est :
1. `brand/brand.manifest.json`
2. `brand/BRAND_ADN.md`
3. `brand/planches/identite-visuelle-2027.png` (logos, palette, éléments graphiques)
4. `brand/planches/adn-visuel-2027.png` et `brand/planches/planche-campagne-2027.png` (essence, ambiance, cartes candidats)
5. `client/src/config/branding.ts` et `client/src/visual-tuning-2027.css` pour le site uniquement

## Identité
- Nom : **Miss & Mister Dour** (le logo 2027 écrit « Miss et Mister Dour »)
- Édition : **2027**
- Organisateur affiché : **STARLIGHT asbl**
- Direction digitale : **JS-Innov.IA**
- Valeurs : **Élégance · Talent · Engagement**
- Signature : « Plus qu'un concours, une expérience humaine. »
- Promesse : « Des talents d'aujourd'hui pour un Dour plus rayonnant demain. »
- Appel à l'action : « Et si c'était toi ? »
- Style : scène premium de nuit, bleu nuit profond, projecteurs bleus, or brossé, satin et paillettes, silhouettes élégantes.

## Logo 2027
`brand/assets/logo-2027-principal.png` (1254 × 1254, fond transparent) : silhouettes Miss et Mister, couronne, plume bleu royal et or, cercle lumineux, lettrage doré.

Déclinaisons visibles sur la planche d'identité : horizontal, vertical, icône, or monochrome, monochrome sombre. Seul le logo principal est versionné pour l'instant ; les autres ne doivent pas être recréés, mais extraits de la planche officielle ou demandés à Julien.

L'ancien logo or (`client/public/logo/miss-mister-dour-logo-transparent.png`) reste sur le site actuel mais **ne doit plus servir pour les créations 2027**.

Le logo est un asset verrouillé : pas de redessin, pas de recolorisation, pas de reconstruction IA.

## Palette 2027 canonique
Source : planche « Identité visuelle 2027 », alignée sur le logo 2027.
- Bleu nuit : `#0A0F2B`
- Bleu royal : `#0F52FF`
- Or royal : `#D4AF37`
- Champagne : `#F9E6C4`
- Blanc : `#FFFFFF`

Validée par Julien le 2026-11-14 : ces valeurs correspondent au logo 2027. Les valeurs voisines de la planche « ADN visuel » (`#0B1B3B`, `#1E5BFF`) ne sont plus utilisées.

Le site utilise encore l'ancienne palette or/cuivre/noir de `branding.ts` (`#D7AE69`, `#9D6043`, `#050403`). C'est du runtime legacy, pas une direction artistique 2027.

## Typographie
- Titres : **Playfair Display**, avec italique doré pour les noms
- Étiquettes : **Montserrat** en majuscules espacées
- Accents : script manuscrit doré, uniquement pour une courte phrase (« Et si c'était toi ? »)
- Corps / UI du site : **Inter**
- Les effets premium doivent rester subtils et lisibles.

## Éléments graphiques 2027
- Étoile dorée à quatre branches ✦ : séparateurs, scintillements.
- Couronne dorée sertie de bleu : détails, lauréats.
- Cercle lumineux doré : cadres, transitions.
- Filets dorés fins, doubles filets autour des photos.
- Textures : satin bleu nuit, or brossé, paillettes, lumière de scène.

## Motif de campagne 2027 — plume
La **plume fine et élégante** est le fil conducteur visuel réservé à la campagne **Miss & Mister Dour 2027**.

Règles :
- elle peut apparaître discrètement dans les intros, transitions, cartes candidats, contenus recrutement et supports de campagne 2027 ;
- elle doit rester légère, raffinée et secondaire par rapport au logo, aux candidats et aux informations ;
- elle peut être utilisée comme particules, tracé lumineux ou élément de transition lorsque le brief le demande ;
- elle ne devient jamais un logo ;
- elle ne doit pas être reprise comme élément d'identité JS-Innov.IA, du Cockpit, de Synergie Dour, Fashionist'ART, Le Tour de Dour ou d'une autre marque ;
- aucun agent ne doit généraliser ce motif hors du scope `miss-mister-dour / edition 2027`.

## Nettoyage sémantique 2026 → 2027
`client/src/index.css` contient encore des noms/commentaires historiques comme « Miss & Mister Dour 2026 », « Lady Gaga Gala Night » et `--gaga-pink`. Ces noms sont des **restes d'implémentation** et ne doivent plus être interprétés par un agent comme brief créatif 2027.

La source visuelle marketing 2027 est désormais la charte de `brand/planches/` ; `branding.ts` et `visual-tuning-2027.css` décrivent le site actuel. Tant que les anciens tokens CSS existent pour compatibilité, Elynea doit les considérer comme runtime legacy, pas comme direction artistique.

## Règles campagne / génération
- Toute image doit être générée sans redessiner le logo ; le logo est composé ensuite depuis l'asset officiel.
- Ne pas créer une couronne, une tenue, un décor ou un thème spécifique uniquement parce qu'un ancien fichier l'évoque ; ces éléments doivent venir du brief de campagne courant.
- La plume est l'exception explicitement canonique pour la campagne 2027, selon les règles ci-dessus.
- Ne jamais importer l'ADN Synergie Dour, Fashionist'ART ou JS-Innov.IA comme palette principale.
- Le crédit JS-Innov.IA reste secondaire.
- Si un thème événementiel annuel est requis mais non défini dans les sources courantes, le demander au brief au lieu de reprendre un ancien thème.

## Qualité
Avant publication : logo 2027, palette bleu nuit / bleu royal / or, contraste, mobile, orthographe, année/édition, faits, liens sociaux et respect du scope de la plume doivent être vérifiés.
