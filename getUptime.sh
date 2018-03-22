# $1 = dossier dans lequel écrire les résultats
# $2 = utilisateur mesu
ssh $2@mesu.dsi.upmc.fr 'hostname && uptime' > $1/uptime.txt
