import json
import sqlite3
import geojson
import ast
import os

ZIPfile = open("zip-codes.txt", "r")

database = sqlite3.connect("permit_data.db")
cursor = database.cursor()

for ZIP in ZIPfile:
    allZIPPoints = []

    command = """
        SELECT Date, ZIP, Units, Address, LatLong
        FROM projects
        WHERE ZIP = %s;
    """ % ZIP

    cursor.execute(command)
    # cursor has a list of tuples as the results... need to loop through that list of one item and grab index 0 -> for result in cursor: blah blah result[0]
    for result in cursor:
        if result[0] != None and result[4] not in ("", None, "null"):
            GeoCoordinates = ast.literal_eval(result[4])
            GeoCoordinates = GeoCoordinates[u'coordinates']
            Geometry = {
                "type":"Point",
                "coordinates":GeoCoordinates
            }

            if result[2] in ("", None, "null"):
                Units = 0
                Icon = "village"
            else:
                Units = result[2]
                Icon = Units

            newFeature = geojson.Feature(geometry=Geometry, properties={"date":result[0], "units":Units, "address":result[3],"zip":result[1],"marker-color":"#754aed","marker-symbol":Icon,"marker-size":"small"})
            allZIPPoints.append(newFeature)

    here = os.path.dirname(os.path.realpath(__file__))
    filename = "%s.geojson" % ZIP.rstrip()
    filePath = os.path.join(here, "../geojson", filename)
    newGeoJSONFile = open(filePath, "w")
    ZIPcollection = geojson.FeatureCollection(allZIPPoints)
    geojson.dump(ZIPcollection, newGeoJSONFile)
    newGeoJSONFile.close()

database.commit()
database.close()
ZIPfile.close()
