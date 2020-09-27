import os

def get_and_store():
    import components.clearDatabase_currentYear # clear the projects dataset for the current year
    import components.obtainData_currentYear # fill in the projects dataset
    import components.createGeoJSON # create GeoJSON files for each ZIP code
    import components.calculateYearlyUnits # update the number of units per year
    import components.createCitywideSummary # update the summary data used by the homepage

    # import runSendEmail