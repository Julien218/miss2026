# Archivage automatique des candidatures 2027

Le serveur Railway archive les dossiers dans le Dropbox d'Olivier, sans dépendre
de l'ordinateur ou de l'application Dropbox locale. Le formulaire et le stockage
du site restent les sources de vérité. Une panne Dropbox ne supprime pas un
dossier et ne provoque pas une nouvelle candidature.

## Destination autorisée

Compte attendu : `olivier.trevis@outlook.be` (identité vérifiée par l'API).
Racine : `/Miss & Mister Dour/Election Miss Mister Dour 2007`, nom historique
explicitement conservé par l'utilisateur. Sous-dossier :
`Édition 2027_Nom Prénom`. Les homonymes reçoivent un suffixe ` - dossier ID`.
Les fichiers incluent le numéro de candidature et une empreinte de contenu pour
conserver les versions, sans écraser les archives précédentes.

Chaque archive contient le formulaire complet, une fiche de référence sans les
coordonnées privées, la photo originale, le contrat signé lorsqu'il existe, un
manifeste des médias et un reçu d'archivage. Aucun lien public n'est créé.
L'index `INDEX_INSCRIPTIONS_2027.json` du premier export manuel reste un instantané ;
les nouvelles archives sont repérables par leur dossier et leur reçu individuel.

## Reprise et confirmation

`candidateApplications` constitue la liste durable des dossiers à traiter. Toutes
les quinze secondes, le serveur rapproche les candidatures 2027 de l'organisation
du site (1) avec la table indépendante `candidateDropboxArchiveJobs`. Un délai de
trente secondes laisse terminer la génération du contrat. Le rapprochement
récupère aussi les dossiers enregistrés avant un redémarrage ou une erreur de
notification. Une modification ultérieure d'un dossier le remet en attente.

Les tâches sont revendiquées par une mise à jour SQL atomique avec un bail de dix
minutes. Un processus arrêté peut être repris après expiration. Les échecs
retournent en attente avec temporisation progressive, sans abandon du dossier.

Une réponse HTTP 200 ne suffit pas. Chaque reçu doit contenir un identifiant,
une révision, le chemin, la taille et le `content_hash` Dropbox exact. Les
métadonnées sont relues après l'écriture. Le dossier n'est marqué terminé qu'après
la vérification de tous ses fichiers et du reçu final. Une reprise retrouve les
fichiers identiques ; une divergence n'écrase rien et reste signalée.

## Connexion et exploitation

Variables serveur du site : `DROPBOX_ARCHIVE_ENABLED=true`,
`DROPBOX_ARCHIVE_ROOT`, `DROPBOX_ARCHIVE_EXPECTED_EMAIL`,
`DROPBOX_OLIVIER_APP_KEY`, `DROPBOX_OLIVIER_APP_SECRET` et la configuration R2
privée existante. Aucune variable `VITE_*` ne contient d'identifiant secret.

Dans « Nouvelles candidatures », le panneau Dropbox affiche les archives
confirmées et celles en attente. Seuls admin, super_admin et owner peuvent
connecter le compte et demander une reprise ; un candidat ou photographe ne peut
pas consulter cette configuration.

La reconnexion utilise le flux OAuth officiel avec PKCE et accès hors ligne. Le
code temporaire est saisi dans le panneau du site, jamais dans le chat. L'identité
Dropbox est contrôlée avant tout stockage du jeton. Le jeton de renouvellement
est chiffré par le stockage privé R2 existant, à une clé propre à cette intégration.
Il n'est pas conservé dans le navigateur, les logs ou le dépôt.

La table de file est créée au démarrage lorsque l'archivage est activé. Aucun
champ, compte ou dossier source n'est supprimé. Désactiver
`DROPBOX_ARCHIVE_ENABLED` arrête les transferts sans perdre la file persistante.

Références : [OAuth Dropbox](https://docs.dropboxapi.com/dropbox-api/docs/oauth),
[vérification du contenu](https://docs.dropboxapi.com/dropbox-api/docs/technical-reference/content-hash).
