# la-unit-construction

## The live website for this project has been taken offline.

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

## How it’s built
1. Every week, a Python program grabs current data from the [LA city Socrata API](https://dev.socrata.com/foundry/data.lacity.org/75vw-v4fk) and saves/updates a database
	* One table contains calculated statistics for each ZIP code
	* Another table contains a list of all the projects

2. After obtaining the data, a Python program loops through all ZIP codes and generates a .geojson file for each one and all its projects. This will be used later to generate dynamic maps

3. A one-time Python program calculated demographics and housing cost data for each ZIP code using 2017 American Communities Survey data from the US Census Bureau and stored them in a database
	* Another script connected ZIP codes to neighborhood names and associated them with this database using a report from LA County

4. A Node.js & Express application serves as the backend for the [website](https://additup.jamestyner.com)
	* Handles user subscriptions to the newsletter and validation of emails and ZIP codes (only LA city ZIPs allowed)
	* Handles page routing and providing dynamic information (such as validation errors) to the page
	* Provides endpoints to read data for certain ZIP codes from the database

5. Each week, after the data is obtained, another recurring Python script grabs relevant data and the projects approved in the past week. It compiles this into template data that is submitted to SendGrid and sent using a dynamic transactional template

6. A [page with information for each ZIP code](https://additup.jamestyner.com/info.html?zip=90007) is built using [VueJS](https://vuejs.org/) and [Mapbox.js](https://docs.mapbox.com/mapbox.js/api/v3.2.0/):
	* Project geographic data is obtained using [axios](https://github.com/axios/axios), Express, and the .geojson files generated earlier, then displayed through Mapbox
	* VueJS uses the Node endpoints to obtain, filter, and display demographic data and a project list

7. A [homepage](https://additup.jamestyner.com) is built using Handlebars and Mapbox.js
	* LA County ZIP code geographic data is saved in a static .geojson file on the server. When the page loads, it's merged with the latest unit counts for each ZIP on the server
	* axios pulls this latest information and feeds it as geojson to Mapbox, which then displays it as a chloropleth map

## Sources
  * LA City open data portal
  * US Census Bureau American Communities Survey (2017, 5-year estimates)
  * LA County open data (for associating ZIP codes with community names, like "Downtown Los Angeles" for 90015)
