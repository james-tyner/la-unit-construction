import sqlite3
import json
import os

summaryData = {}

here = os.path.dirname(os.path.realpath(__file__))
dbPath = os.path.join(here, "../", "permit_data.db")

connection = sqlite3.connect("permit_data.db")
cursor = connection.cursor()


summaryData["sum"] = {}
### TOTAL NUMBER OF UNITS APPROVED IN THE CITY
cursor.execute("SELECT SUM(UnitsAll) FROM attributes;")
# Remember, it has to be a for loop because that's just how it is
for result in cursor:
    summaryData["sum"]["all_time"] = result[0]

### TOTAL NUMBER APPROVED IN THE CITY BY YEAR
cursor.execute("SELECT SUM(Units2013), SUM(Units2014), SUM(Units2015), SUM(Units2016), SUM(Units2017), SUM(Units2018), SUM(Units2019) FROM attributes;")
for result in cursor:
    summaryData["sum"][2013] = result[0]
    summaryData["sum"][2014] = result[1]
    summaryData["sum"][2015] = result[2]
    summaryData["sum"][2016] = result[3]
    summaryData["sum"][2017] = result[4]
    summaryData["sum"][2018] = result[5]
    summaryData["sum"][2019] = result[6]


### TOP FIVE MOST ACTIVE ZIP CODES
summaryData["top-five"] = []
cursor.execute("SELECT ZIP, Description, UnitsAll FROM attributes ORDER BY UnitsAll DESC LIMIT 10;")
for result in cursor:
    summaryData["top-five"].append({
        "zip":result[0],
        "description":result[1],
        "units":result[2]
    })

### TOP FIVE LEAST ACTIVE ZIP CODES
summaryData["least-five"] = []
cursor.execute("SELECT ZIP, Description, UnitsAll FROM attributes ORDER BY UnitsAll ASC LIMIT 15;")
for result in cursor:
    summaryData["least-five"].append({
        "zip":result[0],
        "description":result[1],
        "units":result[2]
    })

### AVERAGE CONSTRUCTION FOR NEW ZIP CODES
cursor.execute("SELECT AVG(UnitsAll) FROM attributes;")
for result in cursor:
    summaryData["average"] = result[0]

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
