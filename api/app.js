const {Firestore} = require('@google-cloud/firestore');
const {Storage} = require("@google-cloud/storage");

const firestore = new Firestore();
// const storage = new Storage();
const storage = new Storage({keyFilename: "add-it-up-290116-dfa41b07eff0.json"})

let express = require("express");
let app = express();
let cors = require("cors");

app.use(cors({
  origin:[
    "http://localhost:8888",
    "https://additup.jamestyner.com"
  ]
}))

const fetch = require('node-fetch');

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

async function getUrlForFileFromBucket(path){
  var date = new Date();
  date.setHours(date.getHours() + 1); // 1 hour from now

  let url = "";

  await storage.bucket("add-it-up-290116-data").file(path).getSignedUrl({
    action: "read",
    expires: date.toISOString(),
  }).then(data => {
    url = data[0];
  })

  return url;
}


// Returns array of ZIP objects containing neighborhood details
// Rebuilt? yes
// Note: this endpoint works, but it's VERY slow
app.get('/api/neighborhoods', async function(request, response){
  if (process.env.LOCAL){
    console.log("Testing locally");
    // FOR TESTING ONLY
    let neighborhoodFile = require("../data/tester-neighborhoods-data.json");

    response.json(neighborhoodFile);

  } else {
    console.log("Querying Firebase");

    zipHolder = {}

    let zips = await firestore.collection("projects").listDocuments();
    let zipName = ""

    for (let zip of zips){
      zipName = zip.id;

      let zipData = {}
      let zipDocs = await zip.collection("attributes").listDocuments();

      zipDocs.forEach(docRef => {
        docRef.get().then(docSnapshot => {
          zipData[docSnapshot.id] = docSnapshot.data();
        })
      })

      zipHolder[zipName] = zipData;
    }

    delete zipHolder["summary"];

    response.json(zipHolder);
  }
});


// Return summary data for the whole city
// Rebuilt? yes
app.get("/api/neighborhoods/summary", async function (request, response){
  let summaryData = await firestore.collection("projects").doc("summary").get().then(docSnapshot => {
    return docSnapshot.data();
  })

  response.json(summaryData);
})

// Returns a simple array of ZIP codes
// Rebuilt? yes
app.get("/api/neighborhoods/list", function(request, response){
  response.json(validZips.sort());
})


// Returns ZIP information using the param in the request. Same as /neighborhoods but just one ZIP
// Rebuilt? yes
app.get("/api/neighborhoods/:zip", async function (request, response) {
  let zipData = []
  
  let zipDocs = await firestore.collection("projects").doc(request.params.zip).collection("attributes").listDocuments();

  docPromises = []
  const getDoc = (doc, array) => new Promise(resolve => {
    doc.get().then(docSnapshot => {
      array.push(docSnapshot.data())
    }).then(() => {
      resolve();
    })
  })

  for (let doc of zipDocs){
    docPromises.push(getDoc(doc, zipData))
  }

  Promise.all(docPromises).then(() => {
    let mergedData = Object.assign(...zipData)

    return response.json(mergedData);
  })
})


// Return shape of the city limits as a polygon
// Rebuilt? yes
app.get("/api/boundary/city", async function(request, response){
  await getUrlForFileFromBucket(`geojson/LA_City_simplified.geojson`).then(async url => {
    const geojson = await fetch(url).then(res => res.json());

    response.json(geojson);
  });
});


// Return ZIP code boundaries for all ZIPs in city
// Rebuilt? yes
app.get("/api/boundary/zips", async function(request, response){
  await getUrlForFileFromBucket(`geojson/LA_County.geojson`).then(async url => {
    const geojson = await fetch(url).then(res => res.json());

    let filteredBoundaries = geojson.features.filter(zip => validZips.includes(Number(zip.properties.zipcode)));

    let filteredGeojson = {
      "type":"FeatureCollection",
      "features":filteredBoundaries
    }

    return response.json(filteredGeojson);
  });
});


// Return ZIP code boundary for one ZIP code
// Rebuilt? yes
app.get("/api/boundary/:zip", async function(request, response){
  await getUrlForFileFromBucket(`geojson/LA_County.geojson`).then(async url => {
    const geojson = await fetch(url).then(res => res.json());

    singleZIPBound = geojson.features.find(zip => zip.properties.zipcode == request.params.zip);

    return response.json(singleZIPBound);
  });
});


// Return all projects for one ZIP code
// Rebuilt? yes
app.get('/api/projects/:zip', async function(request, response){
  let projectsList = []

  firestore.collection("projects").doc(request.params.zip).listCollections().then(async years => {
    for (let year of years){
      await year.listDocuments().then(projects => {
        for (let project of projects){
          project.get().then(snapshot => {
            projectsList.push(snapshot.data())
          })
        }
      })
    }
  }).then(() => {
    return response.json(projectsList);
  });
});

app.listen(process.env.PORT || 8000);
