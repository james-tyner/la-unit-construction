import sqlite3
import csv

connection = sqlite3.connect("permit_data.db")
cursor = connection.cursor()

# completely eliminate the table so you can recreate it
cursor.execute("DROP TABLE costs;")

command = """
CREATE TABLE costs (
    ZIP int PRIMARY KEY,
    MedIncome int,
    MedHousingCost int,
    Percentage decimal(3,4)
);"""

cursor.execute(command)

ZIPfile = open("zip-codes.txt", "r")

IncomeFile = open("median-income-2017.csv", "r")
IncomeReader = csv.DictReader(IncomeFile, delimiter=",")
IncomeDict = {}

HousingFile = open("monthly-housing-costs-2017.csv", "r")
HousingReader = csv.DictReader(HousingFile, delimiter=",")
HousingDict = {}

for row in IncomeReader:
    IncomeDict[row["zip-code"]] = row["income"]

for row in HousingReader:
    HousingDict[row["zip-code"]] = row["median-monthly-housing-costs"] # not sure why all the extra characters but there they are

for ZIP in ZIPfile:
    Income = IncomeDict[ZIP.strip()]
    Cost = HousingDict[ZIP.strip()]
    Percentage = ((float(Cost) * 12) / float(Income)) * 100 # multiply by 12 to change monthly cost to annual, then make that a percentage of income
    Percentage = round(Percentage, 2)

    cursor.execute("INSERT INTO costs (ZIP, MedIncome, MedHousingCost, Percentage) VALUES (%s, %s, %s, %s);" % (ZIP, Income, Cost, Percentage))

IncomeFile.close()
HousingFile.close()
ZIPfile.close()

connection.commit()
connection.close()
