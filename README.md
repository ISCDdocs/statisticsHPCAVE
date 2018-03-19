# statisticsHPCAVE
dans la branche **frontales** se trouvent:
* les scripts pour acquérir les statistiques à partir des frontales de MeSU
* les instructions pour configurer l'envoi des fichiers (crontab pour exécuter les scripts + ssh pour les envoyer)

dans la branche **serveurWeb** se trouvent:
* le code javascript à appeler sur la page __status__ et son usage
* les instructions pour ajouter/modifier une visualisation

## Installation des fichiers
Pour installer les scripts de la branche **frontales** il faut:
```
mkdir chemin/sur/les/frontales
cd /chemin/sur/les/frontales
git clone <url> --branch <branch> --single-branch
```
