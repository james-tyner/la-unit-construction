import sqlite3
import json
import os

summaryData = {}

here = os.path.dirname(os.path.realpath(__file__))
dbPath = os.path.join(here, "../", "permit_data.db")

connection = sqlite3.connect("permit_data.db")
cursor = connection.cursor()

### TOTAL NUMBER OF UNITS APPROVED IN THE CITY
cursor.execute("SELECT SUM(UnitsAll) FROM attributes;")
# Remember, it has to be a for loop because that's just how it is
for result in cursor:
    summaryData["sum"] = result[0]

### TOP FIVE MOST ACTIVE ZIP CODES
summaryData["top-five"] = []
cursor.execute("SELECT ZIP, Description, UnitsAll FROM attributes ORDER BY UnitsAll DESC LIMIT 5;")
for result in cursor:
    summaryData["top-five"].append({
        "zip":result[0],
        "description":result[1],
        "units":result[2]
    })

### TOP FIVE LEAST ACTIVE ZIP CODES
summaryData["least-five"] = []
cursor.execute("SELECT ZIP, Description, UnitsAll FROM attributes ORDER BY UnitsAll ASC LIMIT 5;")
for result in cursor:
    summaryData["least-five"].append({
        "zip":result[0],
        "description":result[1],
        "units":result[2]
    })

### STATIC: MEDIAN RENT, INCOME, PERCENTAGE SPENT ON HOUSING
# 2017 American Communities Survey, city of Los Angeles
medianCosts = 1467
medianIncome = 54501
# (1467 x 12) / 54501
medianPercentage = 32.30

summaryData["median-monthly-costs"] = medianCosts
summaryData["median-income"] = medianIncome
summaryData["median-percentage"] = medianPercentage

# Add the results of the command data to the summaryData dictionary

filename = "summary.json"
filePath = os.path.join(here, "../public/js", filename)
summaryFile = open(filePath, "w")

json.dump(summaryData, summaryFile, indent=2)

# write the summaryData dictionary to file

summaryFile.close()
connection.commit()
connection.close()
