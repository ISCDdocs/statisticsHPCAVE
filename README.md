# statisticsHPCAVE
dans la branche **frontales** se trouvent:
* les scripts pour acquérir les statistiques à partir des frontales de MeSU
* les instructions pour configurer l'envoi des fichiers (crontab pour exécuter les scripts + ssh pour les envoyer)

dans la branche **serveurWeb** se trouvent:
* le code javascript à appeler sur la page __status__ et son usage
* les instructions pour ajouter/modifier une visualisation

## 1 - Installation sur les frontales
### 1.1 - Téléchargement des scripts
Pour installer les scripts de la branche **frontales** il faut:
```
mkdir chemin/sur/les/frontales
cd /chemin/sur/les/frontales
git clone https://github.com/ISCDdocs/statisticsHPCAVE.git --branch frontales --single-branch
cd statisticsHPCAVE
```
les fichiers sont désormais présents dans le dossier statisticsHPCAVE.

### 1.2 - Configuration de l'exécution via crontab + envoi par ssh
