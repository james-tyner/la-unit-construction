import os

def get_and_store():
    import components.obtain_then_calculate # fill in the projects dataset
    # import components.createGeoJSON # create GeoJSON files for each ZIP code
    # import components.calculateYearlyUnits # update the number of units per year
    import components.createCitywideSummary # update the summary data used by the homepage

    # import runSendEmail