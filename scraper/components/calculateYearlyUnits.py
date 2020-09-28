import datetime

# from google.cloud import storage
from google.cloud import firestore

# this year-related code creates an array of years starting in 2013 and ending today, whenever that may be
startYear = datetime.date(2013,1,1).year
currentYear = datetime.date.today().year

years = []
for year in range(startYear, currentYear):
    years.append(year)
years.append(currentYear)

database = firestore.Client()

# old ZIP list code, before splitting everything up
# storage_client = storage.Client()
# blob = storage_client.bucket("add-it-up-290116-data").get_blob("data/zip-codes.txt")
# ZIPlist = blob.download_as_string()
# ZIPlist = ZIPlist.decode("utf-8")
# ZIPlist = ZIPlist.splitlines()

def calculate_units(iterable):
    for ZIP in iterable:
        # Iterate through all projects in the ZIP, then add numbers for each year and all years

        unitCounts = {}

        for year in years:
            unitCounts[str(year)] = 0

            matching_projects = database.collection("projects").document(str(ZIP)).collection(str(year)).stream()

            for result in matching_projects:
                project = result.to_dict()

                if project.get("units") and project["units"] not in (None, ""):
                    unitCounts[str(year)] += int(project["units"])

        unitCounts["all"] = int(sum(unitCounts.values()))

        database.collection("projects").document(str(ZIP)).collection("attributes").document("units").set(unitCounts)
