"""
Creer une cle ssh vers le raspberry
Fichier a executer dans une crontab, toutes les 15 minutes par exemple
Recuperer nombre de jobs, usage
Fichier 
"""
import os
import subprocess
from time import gmtime, strftime
import sys

def which(queue):
    """
    returns 0 if in alpha, 1 if beta, 2 otherwise
    """
    if "_a" in queue:
        return 0
    if "_b" in queue:
        return 1
    return 2
    
class pbsJob:
    def __init__(self, result):
        lines = [l.strip() for l in res.split("\n")]
        self.queue, self.ncpus, self.nodes, self.state, self.user, self.jobId = 0,0,0,0,0,0
        self.percent = 0
        self.jobId = lines[0].strip()
        for l in lines:
            if "queue = " in l:
                self.queue = l.split("=")[1].strip()
                if which(self.queue)==0:
                    self.server = "alpha"
                elif which(self.queue)==1:
                    self.server = "beta"
                else:
                    self.server = "unknown"
            if "Resource_List.nodect" in l:
                self.nodes = int(l.split("=")[1].strip())
            if "Resource_List.ncpus" in l:
                self.ncpus = int(l.split("=")[1].strip())
            if "job_state" in l:
                self.state = l.split("=")[1].strip()
            if "Job_Owner" in l:
                self.user = (l.split("=")[1].strip()).split("@")[0]
            if "resources_used.cpupercent" in l:
                self.percent = int(l.split("=")[1].strip())

    def printJob(self):
        print self.user, self.jobId, self.queue, self.server, self.nodes, self.ncpus, self.state, self.user, self.percent, "%"
    

if __name__ == "__main__":
    #Print the time
    print strftime("%Y-%m-%d %H:%M:%S", gmtime())

    #Parsing the qstat command
    result = os.popen("/opt/pbs/default/bin/qstat -f").read()
    jobs = [pbsJob(res) for res in result.split("Job Id: ")[1:]]

    #Number of users currently computing
    numberUsers = len(set([j.user for j in jobs]))
    print "Users =", numberUsers

    #Number of jobs held or queued
    qA = len([j for j in jobs if j.server=="alpha" and (j.state=="Q" or j.state=="H")]) 
    qB = len([j for j in jobs if j.server=="beta"  and (j.state=="Q" or j.state=="H")])
    qC = len([j for j in jobs if j.server=="unknown"  and (j.state=="Q" or j.state=="H")])
    print "Held or Queued =", qA, qB + qC

    #Number of jobs running
    rA = len([j for j in jobs if j.server=="alpha" and j.state=="R" ]) 
    rB = len([j for j in jobs if j.server=="beta" and j.state=="R" ]) 
    rC = len([j for j in jobs if j.server=="unknown" and j.state=="R" ]) 
    print "Running =", rA, rB+rC

    #Utilization (number of cpus)
    a = 0
    b = 0
    c = 0
    
    debug = []

    for j in jobs:
        if j.server == "alpha" and j.state=="R":
            #j.printJob()
            a+=j.ncpus
        if j.server == "beta" and j.state == "R":
            #j.printJob()
            #on prend en compte les cas avec la queue 1032
            if j.nodes == j.ncpus:
                b+=j.ncpus
            else:
                b+=max(j.ncpus, j.nodes*24)
            debug.append("/".join([j.server, j.state, str(j.nodes*24), str(j.ncpus)]))
        if j.server == "unknown" and j.state=="R":
            #j.printJob()
            b+=j.ncpus
    print "Utilization =", a,b

    with open("debug.txt", "w") as f:
        for d in debug:
            f.write(d + "\n")
        
