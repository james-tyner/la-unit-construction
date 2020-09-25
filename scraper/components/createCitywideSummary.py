import json
import os

from google.cloud import firestore
from google.cloud import storage

storage_client = storage.Client()
blob = storage_client.bucket("add-it-up-290116-data").get_blob("data/zip-codes.txt")
ZIPlist = blob.download_as_string()
ZIPlist = ZIPlist.decode("utf-8")
ZIPlist = ZIPlist.splitlines()

database = firestore.Client()

summaryData = {}

### TOTAL NUMBER OF UNITS APPROVED IN THE CITY, and
### TOTAL NUMBER APPROVED IN THE CITY BY YEAR, and
### TOTAL NUMBER APPROVED BY ZIP CODE

citywideTotalUnits = 0
citywideYearlyUnits = {
    "2013":0,
    "2014":0,
    "2015":0,
    "2016":0,
    "2017":0,
    "2018":0,
    "2019":0,
    "2020":0
}
zipcodeTotalUnits = {}

for ZIP in ZIPlist:
    try:
        unit = database.collection("projects").document(str(ZIP)).collection("attributes").document("units").get()

        unitData = unit.to_dict()

        citywideTotalUnits += unitData["all"]

        zipcodeTotalUnits[ZIP] = unitData["all"]

        for year in citywideYearlyUnits.keys():
            citywideYearlyUnits[year] += unitData[year]
    except:
        pass


summaryData["sum"] = citywideYearlyUnits # add years to dict
summaryData["sum"]["all_time"] = citywideTotalUnits # add total to dict

### TOP FIVE MOST ACTIVE ZIP CODES
greatest_zips = sorted(zipcodeTotalUnits.items(), key=lambda x: x[1], reverse=True)

summaryData["top-five"] = []
for i in range(0, 5):
    summaryData["top-five"].append({
        "zip":greatest_zips[i][0],
        "units":greatest_zips[i][1]
    })

### TOP FIVE LEAST ACTIVE ZIP CODES
least_zips = sorted(zipcodeTotalUnits.items(), key=lambda x: x[1], reverse=False)

summaryData["least-five"] = []
for i in range(0, 5):
    summaryData["least-five"].append({
        "zip":least_zips[i][0],
        "units":least_zips[i][1]
    })

### AVERAGE CONSTRUCTION FOR NEW ZIP CODES
average_units = sum(zipcodeTotalUnits.values()) / len(zipcodeTotalUnits)
summaryData["average"] = average_units

### STATIC: MEDIAN RENT, MEDIAN HOUSEHOLD INCOME, PERCENTAGE SPENT ON HOUSING
# 2019 American Communities Survey, city of Los Angeles
medianRent = 1554
medianIncome = 67418
# (1554 x 12) / 67418
medianPercentage = 27.66

summaryData["median-monthly-costs"] = medianRent
summaryData["median-income"] = medianIncome
summaryData["median-percentage"] = medianPercentage

# Save summary to Firestore
database.collection("projects").document("summary").set(summaryData)
