const fs = require("fs");
const turf = require("@turf/turf");

const validZips = [
  90042,
  90028,
  90062,
  91601,
  90044,
  91316,
  90036,
  90011,
  90048,
  91605,
  91602,
  90045,
  90037,
  91401,
  91607,
  90066,
  90230,
  91406,
  91325,
  91436,
  90025,
  90049,
  90065,
  90291,
  91403,
  90002,
  90038,
  91326,
  91345,
  90003,
  90068,
  91324,
  90272,
  91307,
  90069,
  91402,
  91311,
  91606,
  91356,
  90034,
  91604,
  90026,
  90061,
  91306,
  90043,
  91304,
  90041,
  90077,
  91352,
  91331,
  91367,
  90004,
  91423,
  90024,
  90035,
  91342,
  91411,
  91344,
  90064,
  90094,
  90744,
  91343,
  91405,
  91040,
  90063,
  90032,
  90006,
  90020,
  91335,
  91042,
  90501,
  90019,
  90046,
  90029,
  90031,
  90059,
  90731,
  90210,
  90067,
  90023,
  90039,
  90016,
  90001,
  91364,
  91303,
  90007,
  90047,
  90293,
  90732,
  90027,
  90015,
  90710,
  90018,
  90012,
  90033,
  90005,
  91504,
  90402,
  90017,
  91205,
  90008,
  90248,
  90292,
  90014,
  90247,
  91105,
  91340,
  90057,
  91214,
  90013,
  90717,
  90010,
  90232,
  90212,
  91505
];

// NEED GLOBAL VARIABLES AND MODIFY THOSE SUMMARY VARIABLES FILE BY FILE (zip by zip)

function calculateTOCYear(year){
  let totalTOCUnits = 0;
  let totalTOCProjects = 0;

  let totalCityUnits = 0;
  let totalCityProjects = 0;

  for (var zip of validZips){
    // Open the full permit data
    let projectsFile = fs.readFileSync(`geojson/${zip}.geojson`);
    let projects = JSON.parse(projectsFile);

    // Filter the permits by date
    let filteredFeatures = projects.features.filter(feature => feature.properties.date.startsWith(`${year}`));

    // create a total for the city to compare against
    for (var project of filteredFeatures){
      totalCityUnits += project.properties.units;
      totalCityProjects++;
    }

    // turn the permits into a feature collection
    projectsCollection = turf.featureCollection(filteredFeatures);

    // Open the cleaned Metro file and create the half-mile circles, then export as a feature collection
    let metroStationsFile = fs.readFileSync("geojson/Metro_Rail_cleaned.geojson");
    let metroStations = JSON.parse(metroStationsFile);
    let stations = turf.featureCollection(metroStations.features);
    let bufferedStations = turf.buffer(stations, 0.5, {units:'miles'});

    // For each TOC zone, check for points within polygon from the filtered permits. This returns a feature collection
    let projectsWithin = turf.pointsWithinPolygon(projectsCollection, bufferedStations);

    fs.writeFileSync(`toc_projects/${year}/${zip}.json`, JSON.stringify(projectsWithin, null, 2) , 'utf-8', function (err) {
          if (err) throw err;
          console.log('Saved!');
    });

    // For each point in the new feature collection, add the number of units to an object for that ZIP code and a total for the city for that time period
    for (var project of projectsWithin.features){
      totalTOCUnits += project.properties.units;
      totalTOCProjects++;
    }
  }

  // Save the resulting objects and figures to a file
  let output = `
    For ${year}:
    \n
    In TOC areas:
    Projects: ${totalTOCProjects}\n
    Units: ${totalTOCUnits}\n
    \n
    Citywide:
    Projects: ${totalCityProjects}\n
    Units: ${totalCityUnits}\n
    \n
    Percentage TOC units: ${totalTOCUnits / totalCityUnits}
  `

  fs.writeFileSync(`toc_projects/${year} summary.txt`, output, "utf-8", function(err){
    if (err) throw err;
    console.log("Saved summary!");
  })
}

function calculateTOCTotal(){
  let totalTOCUnits = 0;
  let totalTOCProjects = 0;

  let totalCityUnits = 0;
  let totalCityProjects = 0;

  for (var zip of validZips){
    // Open the full permit data
    let projectsFile = fs.readFileSync(`geojson/${zip}.geojson`);
    let projects = JSON.parse(projectsFile);

    // create a total for the city to compare against
    for (var project of projects.features){
      totalCityUnits += project.properties.units;
      totalCityProjects++;
    }

    // turn the permits into a feature collection
    projectsCollection = turf.featureCollection(projects.features);

    // Open the cleaned Metro file and create the half-mile circles, then export as a feature collection
    let metroStationsFile = fs.readFileSync("geojson/Metro_Rail_cleaned.geojson");
    let metroStations = JSON.parse(metroStationsFile);
    let stations = turf.featureCollection(metroStations.features);
    let bufferedStations = turf.buffer(stations, 0.5, {units:'miles'});

    // For each TOC zone, check for points within polygon from the filtered permits. This returns a feature collection
    let projectsWithin = turf.pointsWithinPolygon(projectsCollection, bufferedStations);

    fs.writeFileSync(`toc_projects/all_time/${zip}.json`, JSON.stringify(projectsWithin, null, 2) , 'utf-8', function (err) {
          if (err) throw err;
          console.log('Saved!');
    });

    // For each point in the new feature collection, add the number of units to an object for that ZIP code and a total for the city for that time period
    for (var project of projectsWithin.features){
      totalTOCUnits += project.properties.units;
      totalTOCProjects++;
    }
  }

  // Save the resulting objects and figures to a file
  let output = `
    For all time:
    \n
    In TOC areas:
    Projects: ${totalTOCProjects}\n
    Units: ${totalTOCUnits}\n
    \n
    Citywide:
    Projects: ${totalCityProjects}\n
    Units: ${totalCityUnits}\n
    \n
    Proportion TOC units: ${totalTOCUnits / totalCityUnits}
  `

  fs.writeFileSync(`toc_projects/all time summary.txt`, output, "utf-8", function(err){
    if (err) throw err;
    console.log("Saved summary!");
  })

  let objectForWeb = {
    "toc-units":totalTOCUnits
  }

  fs.writeFileSync(`public/js/toc-units.json`, JSON.stringify(objectForWeb, null, 2) , 'utf-8', function (err) {
        if (err) throw err;
        console.log('Saved!');
  });
}

calculateTOCYear(2013);
calculateTOCYear(2014);
calculateTOCYear(2015);
calculateTOCYear(2016);
calculateTOCYear(2018);
calculateTOCTotal();
