# Contrats 2027 et validation Cockpit

Les inscriptions publiques utilisent le texte complet du contrat et ses annexes, avec élection le 22 mai 2027 et générales les 19, 20 et 21 mai. Les logos et le pied de page Js-Innov.IA sont conservés. Les versions déjà acceptées ne sont pas réécrites.

## Mise en service

Le démarrage applique les ajouts de schéma via `scripts/ensure-candidate-application-schema.mjs`. La migration SQL équivalente est fournie pour les environnements gérés manuellement ; ne pas exécuter les deux chemins sur les mêmes colonnes. Les changements sont additifs. Aucune base de production n’a été modifiée pendant le développement.

Dans Cockpit > Miss & Mister Dour > Candidatures, Olivier doit compléter les 19 rubriques de la fiche pratique, prévisualiser le PDF complet et confirmer la publication du modèle. Les faits manquants (assurance, frais, règlement remis, prestataires, mandat...) ne sont pas inventés. En l’absence de modèle publié, les nouvelles inscriptions ne peuvent pas être transmises. Préparer cette fiche avant le déploiement et faire contrôler le texte et les faits par l’organisateur et son conseil juridique ; le code ne certifie pas la conformité juridique.

Chaque publication produit une version fondée sur l’empreinte du texte. Un formulaire resté ouvert sur une version périmée demande une nouvelle lecture. Le contrat accepté, les choix facultatifs et la date de l’acte sont figés dans chaque dossier.

## Traitement des dossiers

1. Le candidat lit le texte complet, choisit séparément les usages d’image, puis confirme son accord. Le représentant légal fournit une déclaration distincte si le candidat est mineur lors de la signature. Le nom saisi n’est pas une identité certifiée.
2. Le PDF est généré sans signature automatique de l’organisateur. En cas d’échec, Olivier peut le régénérer depuis le même accord enregistré.
3. Depuis son compte Cockpit `olivier.trevis@outlook.be`, Olivier ouvre le PDF à jour, confirme sa signature, puis approuve la candidature. L’acteur réel, le moment et l’empreinte sont enregistrés. Une autre session ou un autre gestionnaire ne peut pas valider.
4. L’approbation crée le compte et le profil dans une transaction, avec verrou sur le dossier pour éviter les doublons. Le portrait d’inscription reste privé ; une publication éventuelle nécessite une action séparée respectant le choix d’image.

Pour un ancien dossier en attente, Olivier peut préparer un lien valable sept jours et le copier pour le transmettre lui-même. Aucun message n’est envoyé par cette action. L’ancien PDF et les anciens accords sont conservés dans l’historique. Le lien est consommé une seule fois et le candidat reçoit un téléchargement de son nouvel exemplaire. Une signature existante de l’organisateur ne peut pas être écrasée. Les dossiers anciens incomplets ou concernant une autre édition nécessitent une vérification manuelle.

La signature visuelle d’Olivier n’est pas publiée comme ressource accessible à tous et ne vaut pas consentement. Les signatures recueillies ici sont des actes simples ; aucun prestataire de signature qualifiée n’est intégré. L’envoi automatique d’un contrat final contresigné n’est pas ajouté par cette modification ; Olivier peut télécharger le PDF final dans le Cockpit.

## Vérification

- 47 tests ciblés couvrent le modèle, les autorisations, le changement de version, la déclaration parentale, les liens à usage unique, les échecs PDF, le SSO et l’archive privée.
- Vérification TypeScript et compilation de production réussies.
- Parcours réel des composants testé localement dans Chromium avec réponses fictives : quatre étapes d’inscription, tous les usages facultatifs refusés, poids absent, validation après ouverture du PDF et gestionnaire non habilité bloqué. Affichage mobile à 390 px contrôlé.
- PDF individuel fictif de 12 pages rendu et inspecté, sans champ de fusion résiduel ni ancienne date du 13 mars.
- La suite générale présente 64 échecs préexistants, retrouvés à l’identique sur la version de base. Aucun accès réel à la base, envoi d’e-mail, publication de modèle ou signature réelle n’a été effectué pour les tests. Le parcours en production reste à vérifier après déploiement avec les faits validés par Olivier.
