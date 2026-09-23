# Miss & Mister Dour — Bible ADN 2027 canonique

Statut : **production 2027 / documenté depuis la branche réellement déployée**  
Dernier alignement : 2026-09-23

## Source de vérité
La branche Railway publiée est `rescue/recovered-production-source`. Pour l'identité 2027, l'ordre d'autorité est :
1. `brand/brand.manifest.json`
2. `brand/BRAND_ADN.md`
3. `client/src/config/branding.ts`
4. `client/src/visual-tuning-2027.css`
5. `client/src/index.css` uniquement pour l'implémentation UI existante

## Identité
- Nom : **Miss & Mister Dour**
- Édition : **2027**
- Organisateur affiché : **STARLIGHT asbl**
- Direction digitale : **JS-Innov.IA**
- Style : scène premium, sombre, élégant, chaleureux, or/champagne/cuivre, sans surcharge.

## Logo canonique runtime
`/logo/miss-mister-dour-logo-transparent.png`

Le logo doit être utilisé comme asset verrouillé : pas de redessin, pas de recolorisation, pas de reconstruction IA.

## Palette 2027 canonique
Issue de `client/src/config/branding.ts` :
- Or : `#D7AE69`
- Or clair : `#EAD3A5`
- Or sombre / cuivre : `#9D6043`
- Noir : `#050403`
- Noir doux : `#0D0A08`
- Anthracite : `#211B17`
- Ivoire : `#FFFAF1`
- Ivoire doux : `#F7EFE1`
- Argent : `#C9C3B9`
- Argent clair : `#E9E4DA`
- Accent cuivre : `#B76E4D`

## Typographie
- Corps / UI : **Inter**
- Titres : **Playfair Display**, Georgia, serif
- Les effets premium doivent rester subtils et lisibles.

## Nettoyage sémantique 2026 → 2027
`client/src/index.css` contient encore des noms/commentaires historiques comme « Miss & Mister Dour 2026 », « Lady Gaga Gala Night » et `--gaga-pink`. Ces noms sont des **restes d'implémentation** et ne doivent plus être interprétés par un agent comme brief créatif 2027.

La source visuelle marketing 2027 est `branding.ts` + `visual-tuning-2027.css`. Tant que les anciens tokens CSS existent pour compatibilité, Elynea doit les considérer comme runtime legacy, pas comme direction artistique.

## Règles campagne / génération
- Toute image doit être générée sans redessiner le logo ; le logo est composé ensuite depuis l'asset officiel.
- Ne pas créer une couronne, une plume, une tenue, un décor ou un thème spécifique uniquement parce qu'un ancien fichier l'évoque ; ces éléments doivent venir du brief de campagne courant.
- Ne jamais importer l'ADN Synergie Dour, Fashionist'ART ou JS-Innov.IA comme palette principale.
- Le crédit JS-Innov.IA reste secondaire.
- Si un thème événementiel annuel est requis mais non défini dans les sources courantes, le demander au brief au lieu de reprendre un ancien thème.

## Qualité
Avant publication : logo officiel, palette 2027, contraste, mobile, orthographe, année/édition, faits et liens sociaux doivent être vérifiés.
