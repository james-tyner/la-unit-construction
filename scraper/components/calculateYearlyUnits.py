import datetime

from google.cloud import storage
from google.cloud import firestore

years = [
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019,
    2020
]
# Future: add code to add the current year to the list if it's not already there

database = firestore.Client()

storage_client = storage.Client()
blob = storage_client.bucket("add-it-up-290116-data").get_blob("data/zip-codes.txt")
ZIPlist = blob.download_as_string()
ZIPlist = ZIPlist.decode("utf-8")
ZIPlist = ZIPlist.splitlines()

for ZIP in ZIPlist:
    # Iterate through all projects in the ZIP, then add numbers for each year and all years

    unitCounts = {}

    for year in years:
        unitCounts[str(year)] = 0

        matching_projects = database.collection("projects").document(str(ZIP)).collection(year).stream()

        for result in matching_projects:
            project = result.to_dict()

            if project.get("units") and project["units"] not in (None, ""):
                unitCounts[str(year)] += int(project["units"])

    unitCounts["all"] = int(sum(unitCounts.values()))

    print(unitCounts)

    database.collection("projects").document(str(ZIP)).collection("attributes").document("units").set(unitCounts)
