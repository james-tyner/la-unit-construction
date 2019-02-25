import sqlite3
import csv

connection = sqlite3.connect("email.db")
cursor = connection.cursor()

ZIPfile = open("zip-codes.txt", "r")

DescFile = open("la-county-master-zips.csv", "r")
DescReader = csv.DictReader(DescFile, delimiter=",")
DescDict = {}

for row in DescReader:
    DescDict[row["\xef\xbb\xbfzip-code"]] = row["area"] # not sure why all the extra characters but there they are

for ZIP in ZIPfile:
    Desc = DescDict[ZIP.strip()]
    cursor.execute("INSERT INTO zipcodes (ZIP, Description) VALUES (%s, '%s');" % (ZIP, Desc))

DescFile.close()
ZIPfile.close()

connection.commit()
connection.close()
