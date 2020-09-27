import json
import geojson
import ast
import tempfile

from google.cloud import storage
from google.cloud import firestore

storage_client = storage.Client()
blob = storage_client.bucket("add-it-up-290116-data").get_blob("data/zip-codes.txt")
ZIPlist = blob.download_as_string()
ZIPlist = ZIPlist.decode("utf-8")
ZIPlist = ZIPlist.splitlines()

database = firestore.Client()

for ZIP in ZIPlist:
    allZIPPoints = []

    # TODO: Rewrite this to accommodate the new year-divided structure for projects
    projects = database.collection("projects").document(str(ZIP)).collection("projects").stream()

    for result in projects:
        project = result.to_dict()

        if project["type"] != None and project["latlong"] not in ("", None, "null"):
            GeoCoordinates = ast.literal_eval(project["latlong"])
            GeoCoordinates = GeoCoordinates['coordinates']
            Geometry = {
                "type":"Point",
                "coordinates":GeoCoordinates
            }

            if project["units"] in ("", None, "null"):
                Units = 0
                Icon = "village"
                Color = "#754aed" # purple
            elif int(project["units"]) >= 100:
                Units = int(project["units"])
                Icon = "star"
                Color = "#1dcc70" # green
            else:
                Units = int(project["units"])
                Icon = Units
                Color = "#754aed" # purple

            newFeature = geojson.Feature(geometry=Geometry, properties={"date":project["date"], "units":Units, "address":project["address"],"zip":project["ZIP"],"marker-color":Color,"marker-symbol":Icon,"marker-size":"small"})

            allZIPPoints.append(newFeature)

    newGeoJSONFile = tempfile.TemporaryFile("w+")
    ZIPcollection = geojson.FeatureCollection(allZIPPoints)
    geojson.dump(ZIPcollection, newGeoJSONFile)

    storage_client.bucket("add-it-up-290116-data").blob("geojson/" + ZIP + ".geojson").upload_from_file(newGeoJSONFile, rewind=True)

    # delete the temporary file
    newGeoJSONFile.close()
