import requests
import json
import datetime
import os

from google.cloud import firestore

# response is capped at 40,000 records. Just need to change limit parameter to get more
response = requests.get("https://data.lacity.org/resource/75vw-v4fk.json?$limit=40000&$where=permit_type = 'Bldg-New' AND permit_sub_type not in ('Commercial')", headers={"X-App-Token": os.environ.get('SOCRATA_API_KEY')})

jsonData = json.loads(response.text)

database = firestore.Client()

# for object in dataset
for project in jsonData:
    # clean up the unit number
    if "of_residential_dwelling_units" in project.keys():
        if project["of_residential_dwelling_units"] == "":
            project["of_residential_dwelling_units"] = None
    else:
        project["of_residential_dwelling_units"] = None

    # clean up the stories number
    if "of_stories" in project.keys():
        if project["of_stories"] == "":
            project["of_stories"] = None
    else:
        project["of_stories"] = None

    # reformat the status date to match SQL format for dates
    ogDate = project["status_date"]
    newDate = datetime.datetime.fromisoformat(ogDate)

    year = newDate.year

    if project.get("address_start"):
        Number = project["address_start"]
    else:
        Number = ""

    if project.get("street_direction"):
        Direction = project["street_direction"]
    else:
        Direction = ""

    if project.get("street_name"):
        Street = project["street_name"]
    else:
        Street = ""

    if project.get("street_suffix"):
        Suffix = project["street_suffix"]
    else:
        Suffix = ""

    Address = str(Number + " " + Direction + " " + Street + " " + Suffix)
    Address = Address.strip()

    if project.get("location_1"):
        Coordinates = json.dumps(project["location_1"])
    else:
        Coordinates = ""

    # if project.get("work_description"):
    #     Description = project["work_description"]
    #     Description = unicodedata.normalize('NFKD', Description).encode('ascii','ignore')
    #     Description = Description.replace('"',"'")
    # else:
    #     Description = ""

    data = {
        "type":project["permit_sub_type"],
        "date":newDate,
        "year":year,
        "ZIP":project["zip_code"],
        "units":project["of_residential_dwelling_units"],
        "stories":project["of_stories"],
        "address":Address,
        "latlong":Coordinates,
        "description":project["work_description"]
    }

    database.collection("projects").document(project["zip_code"]).collection("projects").add(data)
