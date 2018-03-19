date +%Y-%m-%d\ %H:%M:%S > /home/icsadm/usage/lastMonth.txt
epoch=$(date +%s)
start=$((epoch-24*31*3600))
cmd='sqlite3 /opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3 "select user,sum(Uwalltime*Uncpus/3600.) from pbs_jobs where start>'$start' group by user order by sum(Ucput) asc;"'
ssh norgeot@mesu.dsi.upmc.fr $cmd >> /home/icsadm/usage/lastMonth.txt
