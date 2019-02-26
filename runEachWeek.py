def getAndSend():
    import lib.createTableProjects # drop the projects table and recreate it
    import lib.obtainData # fill in the projects table
    import lib.calculateYearlyUnits # update the number of units per year

    import runSendEmail
