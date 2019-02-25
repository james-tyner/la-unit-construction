# CREATE TABLE emails(
#   Email_Address VARCHAR(40) PRIMARY KEY,
#   Name VARCHAR(40)
# );
#
# INSERT INTO emails(Email_Address) VALUES('svirnovs@usc.edu');
# INSERT INTO emails(Email_Address) VALUES('jamesknewtron+test@gmail.com');
#
# CREATE TABLE zipcodes(
#   ZIP int PRIMARY KEY,
#   Description VARCHAR(40)
# );
#
# CREATE TABLE email_zip_match(
#   email VARCHAR(40),
#   ZIP int,
#   FOREIGN KEY(email) REFERENCES emails(Email_Address),
#   FOREIGN KEY(ZIP) REFERENCES zipcodes(ZIP)
# );


import sendgrid
import sqlite3
from datetime import datetime, timedelta
import json
import os

sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))

emailConnection = sqlite3.connect("email.db")
cursor = emailConnection.cursor()

subscribers = {}

cursor.execute("SELECT * FROM email_zip_match;")
for result in cursor:
    if result[1] not in subscribers.keys(): # if ZIP not in keys, create it
        subscribers[result[1]] = [
            result[0] # add email address to ZIP array
        ]
    else:
        subscribers[result[1]].append(result[0]) # add email address to ZIP array

emailConnection.commit()
emailConnection.close()

zipConnection = sqlite3.connect("permit_data.db")
cursor = zipConnection.cursor()

# for each zip in subscribers
# generate the email for that zip (by connecting to all the data)
# and fill in to the "to" array using the array on subscribers[zip]
for zip in subscribers:
    # connect to projects table
    # get list of projects for the past week: address, number of units
    # calculate: number of projects, total units for the past week
    oneWeekAgo = datetime.now() - timedelta(days=7)
    projectsSql = "SELECT Date, Address, Units FROM projects WHERE ZIP = %s AND Date BETWEEN '%s' AND date('now');" % (zip, oneWeekAgo)
    cursor.execute(projectsSql)

    pastWeekUnits = 0
    pastWeekProjectsCount = 0
    pastWeekProjects= []

    for result in cursor:
        pastWeekProjectsCount += 1
        try:
            pastWeekUnits += int(result[2])
            pastWeekProjects.append({
                "address":result[1],
                "unitCount":int(result[2])
            })
        except ValueError:
            pastWeekProjects.append({
                "address":result[1]
            })

    if pastWeekProjectsCount == 0:
        pastWeekProjects.append({
            "address":"No projects in the past week."
        })

    # connect to attributes table and get neighborhood description and number of units for the year so far
    cursor.execute("SELECT Description, Units2019 FROM attributes WHERE ZIP = %s LIMIT 1;" % zip)

    zipDescription = ""
    zipUnitsYTD = 0
    for result in cursor: # it has to be a for loop because that's just how it is!
        zipDescription = result[0]
        zipUnitsYTD = result[1]

    recipients = []
    for recipient in subscribers[zip]:
        recipientObj = {
            "email":recipient
        }
        recipients.append(recipientObj)

    emailData = {
        "from":{
            "name":"James Tyner",
            "email":"jtyner@usc.edu"
        },
        "reply_to":{
            "email":"jtyner@usc.edu"
        },
        "personalizations":[{
            "to":recipients,
            "dynamic_template_data":{
                "zip":str(zip),
                "neighborhood":zipDescription.strip(),
                "permits":str(pastWeekProjectsCount),
                "wkUnits":str(pastWeekUnits),
                "projects":pastWeekProjects,
                "YTDunits":str(zipUnitsYTD)
            }
        }],
        "template_id":"d-d157e3e2c96841fdbba64958ecdbdfb1"
    }

    try:
        response = sg.client.mail.send.post(request_body=emailData)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print (e.body)

zipConnection.commit()
zipConnection.close()
