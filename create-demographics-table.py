import sqlite3
import csv

connection = sqlite3.connect("permit_data.db")
cursor = connection.cursor()

# completely eliminate the table so you can recreate it
cursor.execute("DROP TABLE demographics;")

command = """
CREATE TABLE demographics (
    ZIP int PRIMARY KEY,
    Population int,
    White int,
    Black int,
    Native_American int,
    Asian int,
    Hawaiian_Pacific int,
    Other int,
    Two_Or_More int,
    Two_Or_More_Other int,
    Two_Or_More_Not_Other int
);"""

cursor.execute(command)

ZIPfile = open("zip-codes.txt", "r")

DemoFile = open("population-with-race-breakdown-2017.csv", "r")
DemoReader = csv.DictReader(DemoFile, delimiter=",")
DemoDict = {}

for row in DemoReader:
    DemoDict[row["zip-code"]] = {
        "population":row["population"],
        "white":row["white-count"],
        "black":row["black-count"],
        "native-american":row["native-american-count"],
        "asian":row["asian-count"],
        "hawaiian_pacific":row["hawaiian-pacific-count"],
        "other":row["other-count"],
        "two_or_more":row["two-or-more-count"],
        "two_or_more_other":row["two-or-more-other-count"],
        "two_or_more_not_other":row["two-or-more-not-other-count"]
    }

for ZIP in ZIPfile:
    Population = DemoDict[ZIP.strip()]["population"]
    White = DemoDict[ZIP.strip()]["white"]
    Black = DemoDict[ZIP.strip()]["black"]
    Native_American = DemoDict[ZIP.strip()]["native-american"]
    Asian = DemoDict[ZIP.strip()]["asian"]
    Hawaiian_Pacific = DemoDict[ZIP.strip()]["hawaiian_pacific"]
    Other = DemoDict[ZIP.strip()]["other"]
    Two_Or_More = DemoDict[ZIP.strip()]["two_or_more"]
    Two_Or_More_Other = DemoDict[ZIP.strip()]["two_or_more_other"]
    Two_Or_More_Not_Other = DemoDict[ZIP.strip()]["two_or_more_not_other"]

    cursor.execute("INSERT INTO demographics (ZIP, Population, White, Black, Native_American, Asian, Hawaiian_Pacific, Other, Two_Or_More, Two_Or_More_Other, Two_Or_More_Not_Other) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);" % (ZIP, Population, White, Black, Native_American, Asian, Hawaiian_Pacific, Other, Two_Or_More, Two_Or_More_Other, Two_Or_More_Not_Other))

DemoFile.close()
ZIPfile.close()

connection.commit()
connection.close()
