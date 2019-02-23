import sqlite3

years = [
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019
]
# Future: add code to add the current year to the list if it's not already there

database = sqlite3.connect("permit_data.db")
cursor = database.cursor()

resultsFile = open("extremes.txt", "w")

for year in years:
    resultsFile.write("----------------------------\n")
    resultsFile.write("Year: " + str(year) + "\n\n")

    command = """
        SELECT ZIP, %s, MedIncome, Description
        FROM statistics
        WHERE %s = 0;
    """ % ("Units" + str(year), "Units" + str(year))

    cursor.execute(command)
    resultsFile.write("ZIPs with zero units:\n")
    for result in cursor:
        resultsFile.write("ZIP " + str(result[0]) + ", " + str(result[3]) + " \n")
        resultsFile.write("\t- Income: $" + str(result[2]) + "\n")

    # ZIP code with maximum
    command = """
        SELECT ZIP, MAX(%s), MedIncome, Description
        FROM statistics;
    """ % ("Units" + str(year))

    cursor.execute(command)
    resultsFile.write("\n")
    for result in cursor:
        resultsFile.write("Max: ZIP " + str(result[0]) + ", " + str(result[3]) + " \n")
        resultsFile.write("\t- Income: $" + str(result[2]) + "\n")
        resultsFile.write("Max ZIP units: " + str(result[1]) + "\n\n")

    # checked data and found that maximums were never matched

database.commit()
database.close()
resultsFile.close()
