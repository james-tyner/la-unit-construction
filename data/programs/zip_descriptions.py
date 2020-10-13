import csv

from google.cloud import firestore
database = firestore.Client()

zipsFile = open("../la-county-master-zips.csv", "r", encoding="utf-8-sig")

reader = csv.DictReader(zipsFile)
for row in reader:
    try:
        database.collection("projects").document(row["zip-code"]).collection("attributes").document("area_description").set({
            "name":(row["area"]).strip()
        })
    except:
        print(f"Didn’t work for {row['zip-code']}")
        pass