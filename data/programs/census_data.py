import csv
import os.path

from google.cloud import firestore
database = firestore.Client()

validZips = [
  90042,
  90028,
  90062,
  91601,
  90044,
  91316,
  90036,
  90011,
  90048,
  91605,
  91602,
  90045,
  90037,
  91401,
  91607,
  90066,
  90230,
  91406,
  91325,
  91436,
  90025,
  90049,
  90065,
  90291,
  91403,
  90002,
  90038,
  91326,
  91345,
  90003,
  90068,
  91324,
  90272,
  91307,
  90069,
  91402,
  91311,
  91606,
  91356,
  90034,
  91604,
  90026,
  90061,
  91306,
  90043,
  91304,
  90041,
  90077,
  91352,
  91331,
  91367,
  90004,
  91423,
  90024,
  90035,
  91342,
  91411,
  91344,
  90064,
  90094,
  90744,
  91343,
  91405,
  91040,
  90063,
  90032,
  90006,
  90020,
  91335,
  91042,
  90501,
  90019,
  90046,
  90029,
  90031,
  90059,
  90731,
  90210,
  90067,
  90023,
  90039,
  90016,
  90001,
  91364,
  91303,
  90007,
  90047,
  90293,
  90732,
  90027,
  90015,
  90710,
  90018,
  90012,
  90033,
  90005,
  91504,
  90402,
  90017,
  91205,
  90008,
  90248,
  90292,
  90014,
  90247,
  91105,
  91340,
  90057,
  91214,
  90013,
  90717,
  90010,
  90232,
  90212,
  91505
]

census_data = {}

for zip_code in validZips:
    census_data[str(zip_code)] = {}

def save_attribute(zip_code, name, value):
    census_data[zip_code][name] = value

demographicsFile = open("census_data/demographic.csv", "r", encoding="utf-8-sig")

incomeFile = open("census_data/median-income.csv", "r", encoding="utf-8-sig")

housingFile = open("census_data/housing.csv", "r", encoding="utf-8-sig")


# calculate and save the percentage of minorities in an area
demReader = csv.DictReader(demographicsFile)
for row in demReader:
    rowZip = row["NAME"].split(" ")[1].strip()

    if not rowZip.isdigit():
        continue

    if int(rowZip) in validZips:
        # total population
        save_attribute(rowZip, "total_population", int(row["DP05_0001E"]))

        # minority: total - non-Hispanic white
        minorityPercentage = 100.00 - float(row["DP05_0077PE"])
        minorityPercentage = round(minorityPercentage, 2)
        save_attribute(rowZip, "minority_percentage", minorityPercentage)

# close demographics file
demographicsFile.close()

# calculate and save the median household income
incomeReader = csv.DictReader(incomeFile)
for row in incomeReader:
    rowZip = row["NAME"].split(" ")[1].strip()

    if not rowZip.isdigit():
        continue

    if int(rowZip) in validZips:
        # median household income
        save_attribute(rowZip, "median_household_income", int(row["S1903_C03_001E"]))

# close income file
incomeFile.close()

# calculate and saave the median housing cost and % of income spent on housing
housingReader = csv.DictReader(housingFile)
for row in housingReader:
    rowZip = row["NAME"].split(" ")[1].strip()

    if not rowZip.isdigit():
        continue

    if int(rowZip) in validZips:
        # owner costs - mortgage
        if not row["DP04_0101E"].isdigit():
            smoc_mortgage = None
        else:
            smoc_mortgage = int(row["DP04_0101E"])

        save_attribute(rowZip, "median_owner_costs_mortgage", smoc_mortgage)

        # owner costs - no mortgage
        if not row["DP04_0109E"].isdigit():
            smoc_no_mortgage = None
        else:
            smoc_no_mortgage = int(row["DP04_0109E"])

        save_attribute(rowZip, "median_owner_costs_no_mortgage", smoc_no_mortgage)

        # gross rent
        save_attribute(rowZip, "median_gross_rent", int(row["DP04_0134E"]))

        # percentage of single-family homes
        save_attribute(rowZip, "percentage_single_family_homes", float(row["DP04_0007PE"]))

# close housing file
housingFile.close()

# save it all to Firestore
for zip_code in validZips:
    database.collection("projects").document(str(zip_code)).collection("attributes").document("census").set(census_data[str(zip_code)])