import sqlite3

connection = sqlite3.connect("permit_data.db")
cursor = connection.cursor()

cursor.execute("DROP TABLE projects;")

command = """
CREATE TABLE projects (
    ProjectID INT AUTO_INCREMENT PRIMARY KEY,
    Date date,
    Type varchar(100),
    Address int,
    Street_Dir varchar(3),
    Street varchar(50),
    Street_Suffix varchar(4),
    ZIP int,
    LatLong blob,
    Description varchar(200),
    Units int,
    Stories int);"""

cursor.execute(command)

connection.commit()
connection.close()
