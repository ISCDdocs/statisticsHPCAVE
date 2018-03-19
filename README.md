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

### 2.2 - Configuration de la connexion en ssh vers les frontales
L'utilisateur **root** doit pouvoir se connecter en ssh sans mot de passe vers les frontales, avec l'utilisateur spécifié. Il faut pour cela enregistrer les clés ssh de part et d'autre, et faire en sorte que la commande `ssh utilisateur@mesu.dsi.upmc.fr` ne requière pas le mot de passe.
Ceci permettra d'envoyer les fichiers de manière régulière.

### 2.3 - Test des scripts
Pour s'assurer que les scripts fonctionnent et avant de les programmer grâce à crontab, il faut les tester en les lançant un par un (en tant que root):
```
sudo sh /home/icsadm/statisticsHPCAVE/getCurrentStatus.sh  /home/icsadm/statisticsHPCAVE/results norgeot
sudo sh /home/icsadm/statisticsHPCAVE/getLastMonthUsage.sh /home/icsadm/statisticsHPCAVE/results norgeot
sudo sh /home/icsadm/statisticsHPCAVE/getLastYearUsage.sh  /home/icsadm/statisticsHPCAVE/results norgeot
sudo sh /home/icsadm/statisticsHPCAVE/getWeeklyUsage.sh    /home/icsadm/statisticsHPCAVE/results norgeot
```
Certaines de ces commandes prennent un peu de temps à s'éxécuter, il faudra donc s'armer de patience (quelques minutes au plus...).
A noter que les arguments sont le dossier dans lequel écrire les résultats et le nom d'utilisateur sur MeSU.


### 2.3 - Configuration du crontab
En tant que root (sudo su), il faut rajouter des règles permettant d'éxecuter les différents scripts à intervale régulier, en utilisant crontab.
```
crontab -e
```
Puis rajouter les lignes suivantes à la crontab:
```
*/15 * * * *  sh /home/icsadm/statisticsHPCAVE/getCurrentStatus.sh /home/ics > /dev/null 
15 */6 * * *  sh /home/icsadm/statisticsHPCAVE/getLastMonthUsage.sh > /dev/null
15 */24 * * * sh /home/icsadm/statisticsHPCAVE/getLastYearUsage.sh > /dev/null
15 */24 * * * sh /home/icsadm/statisticsHPCAVE/getWeeklyUsage.sh > /dev/null
```

### 2.4 - Liens symboliques

Pour que les résultats des commandes précédentes soient visibles depuis le serveur web, il faut que les fichiers soient présents dans le répertoire **/var/www/html** (dossier public pour apache).
Pour ce faire, il faut créer un dossier appelé "statisticsHPCAVE" dans le répertoire **/var/www/html**, et y créer les liens symboliques pointant vers les fichiers présents dans le répertoire:

