# coding: utf8
import os
import sys
import argparse

"""
users.csv = tableau csv avec identifiant, affectation, nom complet. Fichier à garder à jour.
affectations.csv = liste des laboratoires de SU, avec ID et nom complet

python prettifyCPUstats.py -u data/users.csv -l data/affectations.csv -c data.csv -o pretty.csv
"""

# 0.1 - Arguments parsing
parser = argparse.ArgumentParser(description='Creates a human readable file from the HPCAVE users')
parser.add_argument('-u', '--users',  help='User info csv file (id, laboId, full name)', required=True)
parser.add_argument('-l', '--labos',  help='Labo csv file (umrId, umrName, labId, labName)', required=True)
parser.add_argument('-c', '--cpu',    help='CPU hours csv file (id, hours)', required=True)
parser.add_argument('-o', '--output', help='Output csv file', required=True)
args = parser.parse_args()
# 0.2 - Arguments check
if not os.path.exists(args.users):
    print "Error: " + args.users + " does not exist"
    parser.print_help()
    sys.exit(1)
if not os.path.splitext(args.users)[1] == ".csv":
    print "Error: " + args.users + " is not a .csv file"
    parser.print_help()
    sys.exit(2)
if not os.path.exists(args.labos):
    print "Error: " + args.labos + " does not exist"
    parser.print_help()
    sys.exit(3)
if not os.path.splitext(args.labos)[1] == ".csv":
    print "Error: " + args.labos + " is not a .csv file"
    parser.print_help()
    sys.exit(4)
if not os.path.exists(args.cpu):
    print "Error: " + args.hours + " does not exist"
    parser.print_help()
    sys.exit(5)
if not os.path.splitext(args.cpu)[1] == ".csv":
    print "Error: " + args.hours + " is not a .csv file"
    parser.print_help()
    sys.exit(6)
if not os.path.splitext(args.output)[1] == ".csv":
    print "Error: " + args.output + " is not in csv format"
    parser.print_help()
    sys.exit(7)

# 1 - Read in the users and CPU consommation csv files
users = [l.strip().split(",") for l in open(args.users).readlines()]
hours = [l.strip().split(",") for l in open(args.cpu).readlines()]

# 2 - Confront them to find the matches
found, notFound = [], []
for h in hours:
    exists = 0
    for u in users:
        if u[0] == h[0]:
            found.append( [u[2], u[0], u[1], h[1]] )
            exists=1
            break
    if not exists:
        notFound.append(h)
        print "Error with " + str(h)

# 3 - Replace the laboratory ID with its name
labs  = [l.strip().split(",") for l in open(args.labos).readlines()[1:]]
for f in found:
    exists = 0
    for l in labs:
        if f[2]==l[2]:
            f[2]=l[3]
            exists=1
            break
    if not exists:
        f[2]="?"

# 4 - Export a "readable file"
print "Writing the " + str(len(found)) + " found users to " + args.output
with open(args.output, "w") as f:
    f.write("Nom, ID, Labo, CPU (h),\n")
    for u in found:
        f.write(",".join(u) + ",\n")
