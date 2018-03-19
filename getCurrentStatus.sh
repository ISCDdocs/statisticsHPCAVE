# $1 = repertoire dans lequel ecrire les resultats ( pas de / a la fin )
# $2 = utilisateur sur mesu
date +%Y-%m-%d\ %H:%M:%S > $1/pingDate.txt
ssh $2@mesu.dsi.upmc.fr 'python web_usage/parse.py' > $1/log.txt
ping mesu0.dsi.upmc.fr -c 1 > $1/ping0.txt
ping mesu1.dsi.upmc.fr -c 1 > $1/ping1.txt
ping mesu2.dsi.upmc.fr -c 1 > $1/ping2.txt
ping mesu3.dsi.upmc.fr -c 1 > $1/ping3.txt
ping mesu4.dsi.upmc.fr -c 1 > $1/ping4.txt
ping mesu5.dsi.upmc.fr -c 1 > $1/ping5.txt
