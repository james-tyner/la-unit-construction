const requestedZip = new URLSearchParams(window.location.search).get('zip');

if (!requestedZip){
  window.location.replace("https://additup.jamestyner.com");
}

document.title = `${requestedZip} | Add it up.`;

function getZIPCodeInfo() {
  return axios.get(`/api/neighborhoods/${requestedZip}`);
}

function getZIPCodeProjects() {
  return axios.get(`/api/projects/${requestedZip}`);
}

axios.get("/api/neighborhoods").then(function(response){
  let neighborhoods = []
  for (var i=0; i < response.data.length; i++){
    neighborhoods.push({
      "label":(response.data[i].zipCode + " - " + response.data[i].description).toString(),
      "value":response.data[i].zipCode
    });
  }

  $('#search input').autocomplete({
    source: neighborhoods,
    minLength: 2,
    select: function(event, ui) {
      $("#search input").val(ui.item.value);
      $("#search").submit();
    }
  });
});

axios.all([getZIPCodeInfo(), getZIPCodeProjects()]).then(axios.spread(function(information, projects){

  var infoApp = new Vue({
    data: {
      zipCode:requestedZip,
      info:information.data[0],
      projects:projects.data
    },
    el:"#information",
    filters: {
      commaSeparated:function(val){
        while (/(\d+)(\d{3})/.test(val.toString())){
          val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
        }
        return val;
      },
      zeroIfNull:function(val){
        if (val == "null" || val == null || !val){
          return 0;
        } else {
          return val;
        }
      },
      humanDate:function(val){
        var d = new Date(val);
        d = d.toLocaleDateString("en-US", {
          month:"short",
          day:"2-digit",
          year:"numeric"
        });
        return d;
      },
      pluralizeUnits:function(val){
        if (val == 1){
          return (val.toString() + " unit")
        } else {
          return (val.toString() + " units")
        }
      },
      pluralizeStories:function(val){
        if (val == 1){
          return (val.toString() + " story")
        } else {
          return (val.toString() + " stories")
        }
      }
    }
  });
}));


axios.get(`/api/neighborhoods/${requestedZip}/geojson`).then(function(results){
  L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXN0eW5lciIsImEiOiJjajFudmdsZmMwMHF6MnF0YXBoenJ4ZDRiIn0.1bj8d2G_o-fofYOH18BEqA';

  var center = new Promise(function(resolve, reject) {
    // calculate the geographic center of the projects
    var features = turf.featureCollection(results.data.features);
    var centerCoords = turf.center(features);
    if (centerCoords){
      var coordsArray = turf.getCoords(centerCoords)
      resolve(coordsArray);
    } else {
      console.log("Center did not resolve")
    }
  });

  center.then(function(values) {
    var mapboxTiles = L.mapbox.tileLayer('mapbox.light');

    mapboxTiles.on("ready", function(){
      var map = L.mapbox.map('map')
        .addLayer(mapboxTiles)
        .setView([values[1], values[0]], 13.5);

      var projectsLayer = L.mapbox.featureLayer().addTo(map);

      projectsLayer.on('layeradd', function(e) {
        var marker = e.layer,
          feature = marker.feature;
        var content = ('<p><strong>' + feature.properties.address + '</strong></p><p>') + (feature.properties.units == 0 ? "Unit count unavailable" : (feature.properties.units + " units")) + ('</p><p>' + feature.properties.date + '</p>');
        marker.bindPopup(content);
      });

      projectsLayer.setGeoJSON(results.data);

      projectsLayer.on('click', function(e) {
        map.panTo(e.layer.getLatLng());
      });

      map.fitBounds(projectsLayer.getBounds());
    });
  });
});

// Need code to filter by year
// https://docs.mapbox.com/mapbox.js/example/v1.0.0/filtering-markers/
