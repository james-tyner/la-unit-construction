const axios = require('axios');

const {Firestore} = require('@google-cloud/firestore');
const {Storage} = require("@google-cloud/storage");

const firestore = new Firestore();
const storage = new Storage();

let compression = require("compression");
let express = require("express");
let app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var fs = require('fs');

require('dotenv').load();

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


// Returns array of ZIP objects containing neighborhood descriptions
// Rebuilt? yes
// TODO: The code below for /api/neighborhoods works but it’s WAY too slow… may need to create a JSON file on Cloud Storage as part of the data obtaining process and just pass that file here
app.get('/api/neighborhoods', async function(request, response){
  zipHolder = []

  let zips = await firestore.collection("projects").listDocuments();

  for (let zip of zips){
    let zipData = []
    let zipDocs = await zip.collection("attributes").listDocuments();
    console.log(zipDocs);

    zipDocs.forEach(docRef => {
      docRef.get().then(docSnapshot => {
        zipData.push(docSnapshot.data())
      })
    })

    zipHolder.push(zipData)
  }

  response.json(zipHolder);
});


// Returns array of information about a ZIP using the param in the request
// Rebuilt? no
app.get('/api/neighborhoods/:zip', function(request, response){
  let db = new sqlite3.Database('permit_data.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  let sql = `SELECT * FROM attributes, demographics, costs WHERE attributes.ZIP = ${request.params.zip} AND demographics.ZIP = ${request.params.zip} AND costs.ZIP = ${request.params.zip}`;

  db.get(sql,[],(err, row) => {
    if (err) {
      throw err;
    }
    zipHolder = [];
    zipHolder.push({
      "zip-code":row.ZIP,
      "description":row.Description,
      "units":{
        "unitsAll":row.UnitsAll,
        "units2019":row.Units2019,
        "units2018":row.Units2018,
        "units2017":row.Units2017,
        "units2016":row.Units2016,
        "units2015":row.Units2015,
        "units2014":row.Units2014,
        "units2013":row.Units2013
      },
      "demographics":{
        "population":row.Population,
        "white":row.White,
        "whiteNonHispanic":row.White_Non_Hispanic,
        "black":row.Black,
        "nativeAmerican":row.Native_American,
        "asian":row.Asian,
        "hawaiianPacific":row.Hawaiian_Pacific,
        "other":row.Other,
        "twoOrMore":row.Two_Or_More,
        "twoOrMoreOther":row.Two_Or_More_Other,
        "twoOrMoreNotOther":row.Two_Or_More_Not_Other,
        "percentWhite":row.Percent_White_Non_Hispanic,
        "percentMinority":row.Percent_Minority
      },
      "costs":{
        "medianIncome":row.MedIncome,
        "medianHousingCost":row.MedHousingCost,
        "percentage":row.Percentage
      }
    });

    response.json(zipHolder);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
});


// Use for maps
// Rebuilt? yes
app.get("/api/neighborhoods/:zip/geojson", async function(request, response){
  var date = new Date();
  date.setHours(date.getHours() + 1); // 1 hour from now

  await storage.bucket("add-it-up-290116-data").file(`geojson/${request.params.zip}.geojson`).getSignedUrl({
    action:"read",
    expires:date.toISOString(),
  }).then(data => {
    url = data[0];
    return response.redirect(url);
  })
})


// Not sure what this is used for
// Rebuilt? no
app.get("/api/cityGeoJSON", function(request, response){
  var zipCodeInfo;

  axios.get("/api/neighborhoods").then(function(results){
    zipCodeInfo = results.data;

    countyGeo = fs.readFileSync(`geojson/LA_County.geojson`);
    countyGeo = JSON.parse(countyGeo);

    for (var i=countyGeo.features.length - 1; i >= 0; i--){
      var currentZip = parseInt(countyGeo.features[i].properties.zipcode);
      if(validZips.includes(currentZip)){
        let zipInfo = results.data.find(o => o.zipCode === currentZip);

        countyGeo.features[i].properties.description = zipInfo.description;
        countyGeo.features[i].properties.units = zipInfo.units;
        countyGeo.features[i].properties.costs = zipInfo.costs;
      } else {
        countyGeo.features.splice(i, 1)
      }
    }

    return response.json(countyGeo);
  })
});


// Return shape of the city limits as a polygon
// Rebuilt? no
app.get("/api/cityShape", function(request, response){
  cityGeo = fs.readFileSync("geojson/LA_City_simplified.geojson");
  cityGeo = JSON.parse(cityGeo);

  return response.json(cityGeo);
});


// Return ZIP code boundary for one ZIP code
// Rebuilt? no
app.get("/api/cityGeoJSON/:zip", function(request, response){
  var zipCodeInfo;

  countyGeo = fs.readFileSync(`geojson/LA_County.geojson`);
  countyGeo = JSON.parse(countyGeo);

  singleZIPBound = countyGeo.features.find(zip => zip.properties.zipcode == request.params.zip);

  return response.json(singleZIPBound);
});


// Return all projects for one ZIP code
// Rebuilt? no
app.get('/api/projects/:zip', function(req, res){
  let db = new sqlite3.Database('permit_data.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  let sql = `SELECT * FROM projects WHERE ZIP = ${req.params.zip} ORDER BY Date DESC`;

  db.all(sql,[],(err, rows) => {
    if (err) {
      throw err;
    }
    projectsHolder = [];
    rows.forEach((row) => {
      projectsHolder.push({
        "zip-code":row.ZIP,
        "date":row.Date,
        "type":row.Type,
        "address":row.Address,
        "units":row.Units,
        "stories":row.Stories,
        "description":row.Description
      });
    });

    res.json(projectsHolder);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
});


// Saves subscriber email into database
// Rebuilt? no
app.post('/email/subscribe', [
  check('email').isEmail().normalizeEmail().withMessage("That’s not a valid email address."),
  check('zip').isLength(5).isIn(validZips).trim().withMessage("That ZIP code isn’t listed in the city of Los Angeles.")
], function(request, response){
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    // return response.status(422).json({ errors: errors.array() });
    return response.status(422).render('home', {
      layout: false,
      errors: errors.array()
    });
  }

  console.log(request.body.email);
  console.log(request.body.zip);

  let db = new sqlite3.Database('email.db', (err) => {
    if (err) {
      return console.error(err.message);
    } else {
      console.log("Connected to database successfully.")
    }
  });

// Add to both email address table and table of emails and ZIP codes
  db.serialize(() => {
    db.run(`INSERT OR IGNORE INTO emails(Email_Address) VALUES('${request.body.email}')`, [], function(error){
      if(error){
        return console.log(error.message);
      } else {
        console.log("emails table worked")
      }
    });

    db.run(`INSERT OR REPLACE INTO email_zip_match(email, ZIP) VALUES('${request.body.email}', ${request.body.zip})`, [], function(error){
      if(error){
        return console.log(error.message);
      } else {
        console.log("email_zip_match table worked")
      }
    });
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  response.redirect("../subscribe-success.html");
});

app.listen(process.env.PORT || 8000);
