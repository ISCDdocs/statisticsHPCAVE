# coding: utf8
import os
import sys
import argparse
import time

def secsSinceLastModif(filename):
    return (time.time() - os.stat(filename).st_mtime)
def isHostUp(host):
    err = os.system("ping -c 1 " + host + " > /dev/null")
    return 0 if err else 1
def cronRun(function, everyNsecs, logFile):
    if not os.path.isfile(logFile):
        print logFile + " does not exist yet, creating"
        open(logFile, 'a').close()
        function(logFile)
    else:
        if secsSinceLastModif(logFile)>everyNsecs:
            print logFile + " modified more than " + str(everyNsecs) + " s ago: running '" + function.__name__ + "'"
            function(logFile)
        else:
            print logFile + " modified less than " + str(everyNsecs) + " s ago: passing"

# 0.1 - Arguments parsing
parser = argparse.ArgumentParser(description='Creates a human readable file from the HPCAVE users')
parser.add_argument('-o', '--output',   help='Output directory for the logs', required=True)
parser.add_argument('-u', '--userMesu', help='MeSU username (has to be synced with ssh)', required=True)
args = parser.parse_args()
# 0.2 - Arguments check
if not os.path.exists(args.output) or not os.path.isdir(args.output):
    print "Error: " + args.output + " is not a valid directory"
    parser.print_help()
    sys.exit(1)

# 1 - Ping status
def getPings(filename):
    hosts = ["mesu"+str(i+1)+".dsi.upmc.fr" for i in range(5)]
    with open(filename, "w") as f:
        for h in hosts:
            f.write( "%s, %i\n" % (h, isHostUp(h)) )
cronRun(getPings, 300, os.path.join(args.output, "pings.csv") )

# 2 - Current workload
def getWorkload(filename):
    cmd = "ssh " + args.userMesu + "@mesu.dsi.upmc.fr 'python web_usage/parse.py' > " + filename
    os.system(cmd)
cronRun(getWorkload, 300, os.path.join(args.output, "log.txt"))

# 3 - Uptimes (needs ssh keys to the frontals)
def getUptimes(filename):
    hosts = ["mesu"+str(i)+".dsi.upmc.fr" for i in [1,2,3,5]]
    for i,h in enumerate(hosts):
        cmd = "ssh " + args.userMesu + "@" + h + " 'hostname && uptime' > tmp.txt"
        err = os.system(cmd)
        if not err:
            with open("tmp.txt") as f:
                lines = f.readlines()
                desc = "w" if i==0 else "a"
                with open(filename, desc) as fOut:
                    fOut.write(lines[0].strip() + ".mesu.dsi.upmc.fr, " + lines[1].split(",")[0].split("up ")[-1] + ",\n")
        else:
            desc = "w" if i==0 else "a"
            with open(filename, desc) as fOut:
                fOut.write(h + ", unknown,\n")
cronRun(getUptimes, 3600, os.path.join(args.output, "uptimes.csv"))

# 4 - Incremental workload (alpha, beta) to a csv file for history
def appendWorkload(filename):
    cmd = "ssh " + args.userMesu + "@mesu.dsi.upmc.fr 'python web_usage/parse.py' > tmp.txt"
    os.system(cmd)
    with open("tmp.txt") as f:
        load = f.readlines()[-1].strip().split()[-2:]
        with open(filename, "a") as fOut:
            fOut.write("%i, %s, %s,\n" % (time.time(), load[0], load[1]))
    os.remove("tmp.txt")
cronRun(appendWorkload, 3600, os.path.join(args.output, "history.csv"))

# 5 - Get the usage over the last month, and last year
def replaceInFile(filename, _from="|", _to=","):
    lines = open(filename).readlines()
    for l in lines:
        if "|" in l:
            with open(filename, 'w') as f:
                for l in lines:
                    f.write(l.replace(_from, _to))
            break
def sqlHistory(start, end=None):
    sqlstart = "sqlite3 /opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3 '"
    req = sqlstart
    req+= "select user,sum(Uwalltime*Uncpus/3600.) from pbs_jobs where start>" + str(start) + " "
    if end is not None:
        req+= "and start<" + str(end) + " "
    req+= "group by user order by sum(Ucput) desc"
    req+= ";'"
    return req
def getLastMonthUsage(filename):
    oneMonthAgo = int( time.time() - 24*31*3600 )
    sqlcmd      = sqlHistory(oneMonthAgo)
    cmd         = "ssh " + args.userMesu + "@mesu.dsi.upmc.fr \"" + sqlcmd + "\" > " + filename
    err = os.system(cmd)
    if not err:
        replaceInFile(filename, "|", ",")
def getLastYearUsage(filename):
    oneYearAgo  = int( time.time() - 24*365*3600 )
    sqlcmd      = sqlHistory(oneYearAgo)
    cmd         = "ssh " + args.userMesu + "@mesu.dsi.upmc.fr \"" + sqlcmd + "\" > " + filename
    err = os.system(cmd)
    if not err:
        replaceInFile(filename, "|", ",")
cronRun(getLastMonthUsage, 24*3600, os.path.join(args.output, "lastMonth.csv"))
cronRun(getLastYearUsage,  7*24*3600, os.path.join(args.output, "lastYear.csv"))


# 6 - Get the weekly and daily radial history in the last year
"""
def getWeeklyAndDailyUsage(filename):
    sqlcmd = "sqlite3 /opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3 "
    sqlcmd+= "'select start/(7*24*3600) as bucket, sum(Uncpus*Uwalltime/3600.), count(DISTINCT user) from pbs_jobs group by bucket;'"
    print sqlcmd
    cmd    = "ssh " + args.userMesu + "@mesu.dsi.upmc.fr \"" + sqlcmd + "\" > " + filename
    print cmd
    #os.system(cmd)
cronRun(getWeeklyAndDailyUsage, 1, os.path.join(args.output, "lastMonth.csv"))
"""

# 7 - Get the workload on the last week ()
"""
def getLastWeekWorkloadGraph(filename):
    req = 'sqlite3 /opt/dev/pbs/spool/server_priv/bdd.pbs.sqlite3 "'
    req+= 'select start,Uwalltime,Uncpus from pbs_jobs where start>' + str(int(time.time() - 14*24*3600)) + ' and Uwalltime>0;'
    req+= '"'
    cmd = "ssh " + args.userMesu + "@mesu.dsi.upmc.fr \'" + req + "\' > " + filename
    print cmd
    err = os.system(cmd)
getLastWeekWorkloadGraph(os.path.join(args.output, "lastWeek.csv"))
"""
