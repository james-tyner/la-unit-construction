import sqlite3
import csv

connection = sqlite3.connect("permit_data.db")
cursor = connection.cursor()

# completely eliminate the table so you can recreate it
cursor.execute("DROP TABLE statistics;")

command = """
CREATE TABLE statistics (
    ZIP int PRIMARY KEY,
    UnitsAll int,
    Units2019 int,
    Units2018 int,
    Units2017 int,
    Units2016 int,
    Units2015 int,
    Units2014 int,
    Units2013 int,
    MedIncome int,
    Description varchar(50));"""

cursor.execute(command)

ZIPfile = open("zip-codes.txt", "r")

IncomeFile = open("median-income-2017.csv", "r")
IncomeReader = csv.DictReader(IncomeFile, delimiter=",")
IncomeDict = {}

DescFile = open("la-county-master-zips.csv", "r")
DescReader = csv.DictReader(DescFile, delimiter=",")
DescDict = {}

for row in IncomeReader:
    IncomeDict[row["zip-code"]] = row["income"]

for row in DescReader:
    DescDict[row["\xef\xbb\xbfzip-code"]] = row["area"] # not sure why all the extra characters but there they are

for ZIP in ZIPfile:
    Income = IncomeDict[ZIP.strip()]
    Desc = DescDict[ZIP.strip()]
    cursor.execute("INSERT INTO statistics (ZIP, MedIncome, Description) VALUES (%s, %s, '%s');" % (ZIP, Income, Desc))

IncomeFile.close()
DescFile.close()
ZIPfile.close()

connection.commit()
connection.close()
