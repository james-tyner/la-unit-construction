# la-unit-construction

*Los Angeles has a housing shortage. How well has it been able to construct places to live?*

### Next steps
- [x] Connect to Socrata API
- [x] Calculate residential construction totals by ZIP code and year
- [x] Pair ZIP code data with other statistics (demographics, economics, etc.)
- [ ] Get expert opinions
- [x] Create website to view data for a given ZIP code in the city
- [x] Connect to SendGrid API
- [x] Format and send newsletters

## Project goals
  * Illustrate connection between demographic data/socioeconomic factors and the construction of housing in LA amid the city's housing crisis
  * Determine whether targeted policies to promote housing construction are having a positive effect
  * Make large, opaque datasets easier to understand for the public

## Buildout plan
1. Every week, run a Python script to grab current data from city API and save/update database tables
	* First table will contain the stats you want for each ZIP code and a list of the projects in the previous week
	* Second table will contain rankings and counts for ZIP codes for each year and all time

2. Connect to other data sources, for example:
	* Demographic data by ZIP code
	* Rental cost data by ZIP code
	* A table of ZIP codes and rough neighborhood names

3. Base PHP will grab data from the file on the server as long as it is there and display it on a webpage

4. Separately, every week, run PHP to create a newsletter and send it to SendGrid
	* Before running that script, verify that last modified date of the file is the same as today’s date (may need Python to just write the date when it runs to edit the file)

## Sources
  * LA City open data portal
  * US Census Bureau American Communities Survey (2017, 5-year estimates)
  * LA County open data (for associating ZIP codes with community names, like "Downtown Los Angeles" for 90015)
