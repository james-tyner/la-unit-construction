from google.cloud import storage
from google.cloud import firestore
import datetime

now = datetime.datetime.now()
currentYear = now.year

storage_client = storage.Client()
blob = storage_client.bucket("add-it-up-290116-data").get_blob("data/zip-codes.txt")
ZIPlist = blob.download_as_string()
ZIPlist = ZIPlist.decode("utf-8")
ZIPlist = ZIPlist.splitlines()

database = firestore.Client()

for ZIP in ZIPlist:
    projects = database.collection("projects").document(ZIP).collection(currentYear).stream()

    for doc in projects:
        doc.reference.delete()
