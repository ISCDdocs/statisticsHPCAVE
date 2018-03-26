# $1 = repertoire dans lequel ecrire les resultats ( pas de / a la fin )
# $2 = utilisateur sur mesu
ssh $2@mesu.dsi.upmc.fr 'python web_usage/getCPUS.py' >> $1/CPUusage.txt
