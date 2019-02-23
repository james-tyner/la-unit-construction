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

# in case you need to delete everything and write it again from scratch
# cursor.execute("DELETE FROM statistics;")

ZIPfile = open("zip-codes.txt", "r")
for ZIP in ZIPfile:
    unitCounterHolder = [] # store individual year units here, then below: sum the array and submit that as UnitsAll

    for year in years:
        command = """
            SELECT SUM(Units)
            FROM projects
            WHERE strftime('%%Y', Date) = '%s'
            AND ZIP = %s;
        """ % (year, ZIP)

        cursor.execute(command)
        # cursor has a list of tuples as the results... need to loop through that list of one item and grab index 0 -> for result in cursor: blah blah result[0]
        for result in cursor:
            if result[0] != None:
                command = "UPDATE attributes SET %s = %s WHERE ZIP = %s;" % ("Units" + str(year), int(result[0]), ZIP)
                cursor.execute(command)
                unitCounterHolder.append(result[0])

    totalUnits = int(sum(unitCounterHolder))
    command = "UPDATE attributes SET UnitsAll = %s WHERE ZIP = %s;" % (totalUnits, ZIP)
    cursor.execute(command)

database.commit()
database.close()
ZIPfile.close()
