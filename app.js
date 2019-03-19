const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

let express = require("express");
let app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
var exphbs  = require('express-handlebars');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var fs = require('fs');
var key = fs.readFileSync('encryption/private.key');
var cert = fs.readFileSync( 'encryption/certificate.crt' );
var https = require('https');

require('dotenv').load();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
  res.render('home', {layout: false});
});

app.use(express.static("public"));

axios.interceptors.request.use(request => {
  console.log('Starting Request', request)
  return request
});

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


// For info page
app.get("/info/:zip", function(req, res){
  res.redirect(`../info.html?zip=${req.params.zip}`);
});

app.post("/info/search", [check('zip').isLength(5).isIn(validZips).trim().withMessage("That ZIP code isn’t listed in the city of Los Angeles.")], function(request, response){
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    console.log(errors);
    return response.end();
  }

  return response.redirect(`../info.html?zip=${request.body.zip}`);
});


// Returns array of ZIP objects containing neighborhood descriptions
app.get('/api/neighborhoods', function(request, response){
  let db = new sqlite3.Database('permit_data.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  let sql = `SELECT * FROM attributes ORDER BY ZIP`;

  db.all(sql,[],(err, rows ) => {
    if (err) {
      throw err;
    }
    zipHolder = [];
    rows.forEach((row) => {
      zipHolder.push({
        "zipCode":row.ZIP,
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
        }
      });
    });

    response.json(zipHolder);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
});


// Returns array of information about a ZIP using the param in the request
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
// Need to add the same 50 at a time logic as the projects list
app.get("/api/neighborhoods/:zip/geojson", function(request, response){
  let zipGeo = fs.readFileSync(`geojson/${request.params.zip}.geojson`);
  return response.json(JSON.parse(zipGeo));
})


// Return all projects for one ZIP code
// Here you set it to return 50 at a time. The offset parameter will tell the Socrata API which 50 to pull. In your page, use ?page=NUMBER to return the proper page, or leave it blank to get the most recent 50
app.get('/api/projects/:zip', function(req, res){
  // axios.get('/resource/75vw-v4fk.json', {
  //   baseURL: 'https://data.lacity.org',
  //   headers: {"X-App-Token": process.env.SOCRATA_API_KEY},
  //   params: {
  //     $limit:50,
  //     $offset:(req.query.page || 0),
  //     $order:"issue_date DESC",
  //     $where:`permit_type = 'Bldg-New' AND permit_sub_type not in ('Commercial') AND zip_code = ${req.params.zip} AND ${lastWeek}`
  //   }
  // })
  // .then(function (response) {
  //   res.send(response.data);
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });

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
        "stories":row.Stories
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

https.createServer({key: key, cert: cert}, app).listen(443);

var http = require('http');
http.createServer(app).listen(80);
