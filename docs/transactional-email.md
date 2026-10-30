# Emails Miss & Mister Dour

Tous les envois du site utilisent `server/helpers/email.ts` et l'habillage
`email-brand.ts` : logo officiel, noir, cuivre, champagne, or et signature
discrète Js-Innov.IA sous les coordonnées de STARLIGHT ASBL. Les invitations,
réinitialisations, profils, commentaires, galeries et préinscriptions partagent
ce chemin. Les liens de sécurité conservent leurs règles existantes ; aucun
accès local désactivé n'est réactivé par ce changement.

Resend est prioritaire si `RESEND_API_KEY` est présente. L'expéditeur est
`RESEND_FROM_EMAIL`, avec la valeur par défaut
`Miss & Mister Dour <inscriptions@missetmisterdour.be>`. Les réponses vont à
Olivier. Forge reste compatible uniquement lorsque Resend est absent : un échec
Resend ne bascule jamais vers un second fournisseur, pour éviter les doublons.

Les pièces jointes base64 et la version texte sont transmises. Un identifiant
d'acceptation Resend valide est requis. Les erreurs permanentes ne sont pas
réessayées ; les erreurs réseau, 429 et 5xx ont trois tentatives au maximum,
avec le même corps et la même clé d'idempotence. Chaque requête expire après
dix secondes. Les confirmations candidat et administrateur ont des clés
distinctes liées au numéro de candidature. Les logs Resend ne contiennent ni
adresse destinataire ni contenu ni jeton.

`forms-health` vérifie la configuration du fournisseur effectif. Cet endpoint
ne prouve ni la livraison d'un email ni sa présence dans une boîte de réception.
`emailsSent` indique une acceptation par le fournisseur, pas une livraison.
Il n'existe pas de file persistante de reprise des emails : après les trois
tentatives, une erreur est signalée et la candidature reste conservée.
La file Dropbox est indépendante et n'est pas modifiée.

Validation du 30 octobre 2026 : 23 tests ciblés (dont 9 transport et identité),
compilation de production et aperçu HTML inspecté. Les deux erreurs TypeScript
préexistantes d'itération de Set dans notifications.ts restent hors périmètre.
Un seul email explicitement marqué TEST, sans donnée de candidat et avec PDF
de démonstration, a été accepté pour info@jsinnovia.com. Aucun envoi aux anciens
inscrits, aucune candidature fictive, aucune modification de la base.
