# Pasteimage : coller des médias dans l'éditeur

Plugin DokuWiki (`pasteimage`).

Comme dans **Obsidian** : on colle une image copiée en mémoire (capture d'écran, image copiée depuis OneNote, un navigateur…) ou on dépose des fichiers dans l'éditeur de texte, et le plugin :

1. envoie le fichier dans les **médias de l'espace de noms de la page**, au même endroit que le bouton d'ajout d'image du menu (`data/media/<espace de noms de la page>/`) ;
2. insère le lien à la position du curseur : `![[pasted_image_20261119212928.png]]`.

## Fonctionnement

- L'envoi passe par le service `mediaupload` de DokuWiki : droits d'envoi, types de fichiers autorisés (`mime.conf`), taille maximale, anciennes révisions et journal des médias sont ceux du gestionnaire de médias. Le nom est nettoyé comme tout média DokuWiki (minuscules, `_` à la place des espaces).
- Une image collée reçoit le nom `Pasted image AAAAMMJJHHMMSS.png` (début du nom réglable). Un fichier copié ou déposé garde son nom.
- Plusieurs fichiers déposés en même temps sont envoyés l'un après l'autre, chaque lien à la suite du précédent.
- Un texte collé avec une image (Word, Excel…) reste un collage de texte normal.
- Une miniature et un message sous l'éditeur confirment l'envoi ou signalent l'échec.
- Sans droit d'envoi dans l'espace de noms, DokuWiki refuse et le message d'erreur s'affiche.

## Configuration

| Réglage | Défaut | Rôle |
| --- | --- | --- |
| `linkstyle` | `obsidian` | lien inséré : `obsidian` (`![[nom.png]]`) ou `dokuwiki` (`{{:espace:nom.png}}`, `{{:espace:nom.pdf\|nom.pdf}}` pour un fichier autre qu'une image) |
| `prefix` | `Pasted image ` | début du nom d'une image collée |

## Dépendances

Aucune pour le style `dokuwiki`. Le style `obsidian` (`![[nom.png]]`) demande le plugin `mdlink`, qui retrouve le média par son nom.

## Installation

Copier le contenu de ce dépôt dans `lib/plugins/pasteimage/` (le fichier `plugin.info.txt` doit se trouver à la racine de ce dossier), puis vider le cache en rendant la date de `conf/local.php` plus récente (`touch conf/local.php`).

Avec le gestionnaire d'extensions de DokuWiki : *Administration → Gestionnaire d'extensions → Installer*, en indiquant l'adresse du dépôt (archive ZIP).

## Licence

Aucune licence n'a encore été choisie : à ajouter (fichier `LICENSE`) avant de publier le dépôt. DokuWiki est sous GPL-2.0.
