# statisticsHPCAVE
dans la branche **frontales** se trouvent:les scripts pour acquérir les statistiques à partir des frontales de MeSU

dans la branche **serveurWeb** se trouvent:
* le code javascript à appeler sur la page __status__ et son usage

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
**Note:** l'utilisateur utilisé pour lancer les commandes doit avoir un accès en lecture sur le fichier `/opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3` (fichier de la base de données PBS). Ceci peut se vérifier en essayant d'accéder à ce fichier via la commande:
```
sqlite3 /opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3
```

## 2 - Installation sur le serveur web
### 2.1 - Téléchargement des scripts
Pour installer les scripts de la branche **serveurWeb** il faut:
```
cd /home/icsadm
git clone https://github.com/ISCDdocs/statisticsHPCAVE.git --branch serveurWeb --single-branch
cd statisticsHPCAVE
```
Dans le dossier sont présents plusieurs scripts, lançant des commandes sur les frontales de MeSU à partir de l'utilisateur présent dans les fichiers (qu'il faudra donc changer en accordance).

### 2.2 - Configuration du crontab
En tant que root (sudo su), il faut rajouter des règles permettant d'éxecuter les différents scripts à intervale régulier, en utilisant crontab.
```
crontab -e
```
Puis rajouter les lignes suivantes à la crontab:
```
*/15 * * * *  sh /home/icsadm/statisticsHPCAVE/run.sh > /dev/null 
15 */6 * * *  sh /home/icsadm/statisticsHPCAVE/statsMonth.sh > /dev/null
15 */24 * * * sh /home/icsadm/statisticsHPCAVE/statsYear.sh > /dev/null
```
