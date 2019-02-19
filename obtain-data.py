import requests
import json
import sqlite3
import datetime

response = requests.get("https://data.lacity.org/resource/75vw-v4fk.json?$where=permit_type = 'Bldg-New' AND permit_sub_type not in ('Commercial')", headers={"X-App-Token": "MWUKeodpGC6dfhr8200ZhXjss"})

jsonData = json.loads(response.text)

database = sqlite3.connect("permit_data.db")
cursor = database.cursor()

# maybe you need to delete everything and write it again from scratch?
# cursor.execute("DELETE FROM projects")

# for object in dataset
for project in jsonData:
    # clean up the unit number
    if "of_residential_dwelling_units" in project.keys():
        if project["of_residential_dwelling_units"] == "":
            project["of_residential_dwelling_units"] = "null"
    else:
        project["of_residential_dwelling_units"] = "null"

    # clean up the stories number
    if "of_stories" in project.keys():
        if project["of_stories"] == "":
            project["of_stories"] = "null"
    else:
        project["of_stories"] = "null"

    # reformat the status date to match SQL format for dates
    ogDate = project["status_date"]
    newDate = datetime.datetime.strptime(ogDate, '%Y-%m-%dT00:00:00.000').strftime('%Y-%m-%d')

    command = """
    INSERT INTO projects (Type, Date, ZIP, Units, Stories)
    VALUES ('%s', '%s', '%s', '%s', '%s');""" % (project["permit_sub_type"], newDate, project["zip_code"], project["of_residential_dwelling_units"], project["of_stories"])

    cursor.execute(command)

    print(project["zip_code"], project["of_residential_dwelling_units"] + " units")

database.commit()
database.close()

# SELECT permit_sub_type, address_start, street_direction, street_name, street_suffix, zip_code, work_description, of_residential_dwelling_units, of_stories
