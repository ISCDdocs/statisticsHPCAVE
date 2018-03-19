date +%Y-%m-%d\ %H:%M:%S > /home/icsadm/usage/pingDate.txt
ssh norgeot@mesu.dsi.upmc.fr 'python web_usage/parse.py' > /home/icsadm/usage/log.txt
ping mesu0.dsi.upmc.fr -c 1 > /home/icsadm/usage/ping0.txt
ping mesu1.dsi.upmc.fr -c 1 > /home/icsadm/usage/ping1.txt
ping mesu2.dsi.upmc.fr -c 1 > /home/icsadm/usage/ping2.txt
ping mesu3.dsi.upmc.fr -c 1 > /home/icsadm/usage/ping3.txt
ping mesu4.dsi.upmc.fr -c 1 > /home/icsadm/usage/ping4.txt
ping mesu5.dsi.upmc.fr -c 1 > /home/icsadm/usage/ping5.txt
