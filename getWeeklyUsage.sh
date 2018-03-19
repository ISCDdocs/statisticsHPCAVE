cmd='sqlite3 /opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3 "select start/(30*24*3600) as bucket, sum(Uncpus*Uwalltime/3600.), count(DISTINCT user) from pbs_jobs group by bucket;"'
ssh norgeot@mesu.dsi.upmc.fr $cmd > /home/icsadm/usage/weekly.txt
