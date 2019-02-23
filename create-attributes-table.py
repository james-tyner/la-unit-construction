import sqlite3
import csv

connection = sqlite3.connect("permit_data.db")
cursor = connection.cursor()

# completely eliminate the table so you can recreate it
cursor.execute("DROP TABLE attributes;")

command = """
CREATE TABLE attributes (
    ZIP int PRIMARY KEY,
    Description varchar(50),
    UnitsAll int,
    Units2019 int,
    Units2018 int,
    Units2017 int,
    Units2016 int,
    Units2015 int,
    Units2014 int,
    Units2013 int
);"""

cursor.execute(command)

ZIPfile = open("zip-codes.txt", "r")

DescFile = open("la-county-master-zips.csv", "r")
DescReader = csv.DictReader(DescFile, delimiter=",")
DescDict = {}

for row in DescReader:
    DescDict[row["\xef\xbb\xbfzip-code"]] = row["area"] # not sure why all the extra characters but there they are

for ZIP in ZIPfile:
    Desc = DescDict[ZIP.strip()]
    cursor.execute("INSERT INTO attributes (ZIP, Description) VALUES (%s, '%s');" % (ZIP, Desc))

DescFile.close()
ZIPfile.close()

connection.commit()
connection.close()
