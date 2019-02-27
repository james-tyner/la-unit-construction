const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

let express = require("express");
let app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

var fs = require('fs');
var key = fs.readFileSync('encryption/private.key');
var cert = fs.readFileSync( 'encryption/certificate.crt' );
var https = require('https');

require('dotenv').load();

app.use(express.static("public"));


// Returns array of ZIP objects containing neighborhood descriptions
app.get('/api/neighborhoods', function(request, response){
  let db = new sqlite3.Database('permit_data.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  let sql = `SELECT ZIP, Description FROM attributes ORDER BY ZIP`;

  db.all(sql,[],(err, rows ) => {
    if (err) {
      throw err;
    }
    zipHolder = [];
    rows.forEach((row) => {
      zipHolder.push({
        "zip-code":row.ZIP,
        "description":row.Description
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
        "units-all":row.UnitsAll,
        "units-2019":row.Units2019,
        "units-2018":row.Units2018,
        "units-2017":row.Units2017,
        "units-2016":row.Units2016,
        "units-2015":row.Units2015,
        "units-2014":row.Units2014,
        "units-2013":row.Units2013
      },
      "demographics":{
        "population":row.Population,
        "white":row.White,
        "white-non-hispanic":row.White_Non_Hispanic,
        "black":row.Black,
        "native-american":row.Native_American,
        "asian":row.Asian,
        "hawaiian-pacific":row.Hawaiian_Pacific,
        "other":row.Other,
        "two_or_more":row.Two_Or_More,
        "two_or_more_other":row.Two_Or_More_Other,
        "two_or_more_not_other":row.Two_Or_More_Not_Other,
        "percent-white":row.Percent_White_Non_Hispanic,
        "percent-minority":row.Percent_Minority
      },
      "costs":{
        "median-income":row.MedIncome,
        "median-housing-cost":row.MedHousingCost,
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


// Return all projects for one ZIP code
// Here you set it to return 50 at a time. The offset parameter will tell the Socrata API which 50 to pull. In your page, use ?page=NUMBER to return the proper page, or leave it blank to get the most recent 50
app.get('/api/projects/:zip', function(req, res){
    axios.get('/resource/75vw-v4fk.json', {
      baseURL: 'https://data.lacity.org',
      headers: {"X-App-Token": process.env.SOCRATA_API_KEY},
      params: {
        $limit:50,
        $offset:(req.query.page || 0),
        $order:"issue_date DESC",
        $where:`permit_type = 'Bldg-New' AND permit_sub_type not in ('Commercial') AND zip_code = ${req.params.zip}`
      }
    })
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
});


app.post('/email/subscribe', function(request, response){
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
