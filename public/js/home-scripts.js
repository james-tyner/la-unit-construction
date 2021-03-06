$(".has-article").on("mouseenter", function(){
  $(".reference", this).show();
});

$(".has-article").on("mouseleave", function(){
  $(".reference", this).hide();
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

function commaSeparated(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}

function getZIPCodeInfo() {
  return axios.get(`/api/neighborhoods`);
}

function getCountyMap() {
  return axios.get(`/api/neighborhoods/LA_County/geojson`);
}

function getCityShape(){
  return axios.get(`/api/cityShape`)
}

function getMetroStations(){
  return axios.get("/api/metroJSON");
}

axios.get("/api/cityGeoJSON").then(function(cityGeo){

  L.mapbox.accessToken = 'pk.eyJ1IjoiamFtZXN0eW5lciIsImEiOiJjajFudmdsZmMwMHF6MnF0YXBoenJ4ZDRiIn0.1bj8d2G_o-fofYOH18BEqA';

  var center = new Promise(function(resolve, reject) {
    // calculate the geographic center of the projects
    var features = turf.featureCollection(cityGeo.data.features);
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

    $("#loading").show();

    mapboxTiles.on("ready", function(){
      var map = L.mapbox.map('chloropleth')
        .addLayer(mapboxTiles)
        .setView([values[1], values[0]], 10);

      var popup = new L.Popup({ autoPan: false });

      var projectsLayer = L.geoJson(cityGeo.data,  {
        style: getStyle,
        onEachFeature: onEachFeature
      }).addTo(map);

      $("#show-zips").on("change", function(){
        if($(this).is(':checked')) {
          map.addLayer(projectsLayer);
        } else {
          map.removeLayer(projectsLayer);
        }
      });

      map.legendControl.addLegend(document.getElementById('legend').innerHTML);

      function getStyle(feature) {
        return {
            weight: 2,
            opacity: 0.1,
            color: 'black',
            fillOpacity: 0.7,
            fillColor: getColor(feature.properties.units.unitsAll)
        };
      }

      // get color depending on number of units
      function getColor(d) {
        return d > 2000 ? '#392775' :
            d > 1500  ? '#5135A5' :
            d > 1000  ? '#6943D5' :
            d > 500  ? '#754AED' :
            d > 250   ? '#835CEF' :
            d > 50   ? '#916EF1' :
            d > 10   ? '#9F80F3' :
            d == 0 ? "#cccccc" :
            '#AD92F5';
      }

      function onEachFeature(feature, layer) {
        layer.on({
            mousemove: mousemove,
            mouseout: mouseout,
            click: zoomToFeature
        });
      }

      var closeTooltip;

      function mousemove(e) {
        var layer = e.target;

        popup.setLatLng(e.latlng);
        popup.setContent('<div class="marker-title">' + layer.feature.properties.zipcode + ' - ' + layer.feature.properties.description + '</div>' +
            commaSeparated(layer.feature.properties.units.unitsAll) + ' units approved since 2013<br/>Median income: $' + commaSeparated(layer.feature.properties.costs.medianIncome) + '<br/>Monthly housing cost: $' + commaSeparated(layer.feature.properties.costs.medianHousingCost));

        if (!popup._map) popup.openOn(map);
        window.clearTimeout(closeTooltip);

        // highlight feature
        layer.setStyle({
            weight: 3,
            opacity: 0.3,
            fillOpacity: 0.9
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
      }

      function mouseout(e) {
          projectsLayer.resetStyle(e.target);
          closeTooltip = window.setTimeout(function() {
              map.closePopup();
          }, 100);
      }

      function zoomToFeature(e) {
          map.fitBounds(e.target.getBounds());
      }

      $("#loading").hide();

      getMetroStations().then((result) => {
        // METRO STATIONS LAYER
        var metroLayer = L.mapbox.featureLayer();

        metroLayer.on('layeradd', function(e) {
          var marker = e.layer,
            feature = marker.feature;
          var content = ('<p><strong>') + feature.properties.STATION + ('</strong></p><p>') + feature.properties.LINE + (' Line</p>');
          marker.bindPopup(content);
        });

        metroLayer.setGeoJSON(result.data);

        $("#show-metro").on("change", function(){
          if($(this).is(':checked')) {
            map.addLayer(metroLayer);
          } else {
            map.removeLayer(metroLayer);
          }
        })

        // TRANSIT ORIENTED COMMUNITIES LAYER
        var tocBuffer = new Promise((resolve, reject) => {
          var stations = turf.featureCollection(result.data.features);
          var bufferedStations = turf.buffer(stations, 0.5, {units:"miles"});
          if (bufferedStations){
            resolve(bufferedStations);
          } else {
            console.log("Turf did not resolve the station buffer")
          }
        });

        tocBuffer.then((stationZones) => {
          var tocLayer = L.geoJson(stationZones, {
            style:{
              weight:1,
              color:"green"
            }
          });

          $("#show-toc-zones").on("change", function(){
            if($(this).is(':checked')) {
              map.addLayer(tocLayer);
            } else {
              map.removeLayer(tocLayer);
            }
          })
        })
      });

        $("#show-city-limits").on("change", function(){
          if ($(this).is(":checked")){
            $("#loading").show();
            getCityShape().then((result) => {
              cityLimits = L.geoJson(result.data,  {
                style: {
                  weight:2,
                  color:"black"
                }
              });

              map.addLayer(cityLimits);
              $("#loading").hide();
            })
          } else {
            map.removeLayer(cityLimits);
          }
        })
      })
    });
  });

let summaryApp = new Vue({

});
