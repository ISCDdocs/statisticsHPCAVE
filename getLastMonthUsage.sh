# $1 = repertoire dans lequel ecrire les resultats ( pas de / a la fin )
# $2 = utilisateur sur mesu
date +%Y-%m-%d\ %H:%M:%S > $1/lastMonth.txt
epoch=$(date +%s)
start=$((epoch-24*31*3600))
cmd='sqlite3 /opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3 "select user,sum(Uwalltime*Uncpus/3600.) from pbs_jobs where start>'$start' group by user order by sum(Ucput) asc;"'
ssh $2@mesu.dsi.upmc.fr $cmd >> $1/lastMonth.txt
