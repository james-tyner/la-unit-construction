import sqlite3
import csv

IncomeFile = open("median-income-2017.csv", "r")
IncomeReader = csv.DictReader(IncomeFile, delimiter=",")
IncomeDict = {}

for row in IncomeReader:
    IncomeDict[row["zip-code"]] = row["income"]

ZIPfile = open("zip-codes.txt", "r")
for ZIP in ZIPfile:
    Income = IncomeDict[ZIP.strip()]
    print("INSERT INTO statistics (ZIP, MedIncome) VALUES (%s, %s)" % (ZIP, Income))

ZIPfile.close()
IncomeFile.close()
