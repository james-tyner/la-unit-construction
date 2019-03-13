def getAndSend():
    import lib.createTableProjects # drop the projects table and recreate it
    import lib.obtainData # fill in the projects table
    import lib.createGeoJSON # create GeoJSON files for each ZIP code
    import lib.calculateYearlyUnits # update the number of units per year

    import runSendEmail
