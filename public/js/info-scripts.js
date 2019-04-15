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

function getSingleZIPBoundary(){
  return axios.get(`/api/cityGeoJSON/${requestedZip}`)
}

function getCityShape(){
  return axios.get(`/api/cityShape`)
}

function getMetroStations(){
  return axios.get("/api/metroJSON");
}

axios.all([getZIPCodeInfo(), getZIPCodeProjects()]).then(axios.spread(function(information, projects){

  Vue.directive('tooltip', VTooltip.VTooltip)

  var infoApp = new Vue({
    data: {
      zipCode:requestedZip,
      info:information.data[0],
      projects:projects.data,
      selectedYear:"",
      sidebarYear:"2019"
    },
    el:"#information",
    computed: {
      yearFiltered() {
        return this.projects.filter((project) => project.date.toString().startsWith(this.selectedYear))
      }
    },
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

    $("#loading").show();

    mapboxTiles.on("ready", function(){
      var map = L.mapbox.map('map')
        .addLayer(mapboxTiles)
        .setView([values[1], values[0]], 13.5);

      getMetroStations().then((result) => {
        var metroLayer = L.mapbox.featureLayer().addTo(map);

        metroLayer.on('layeradd', function(e) {
          var marker = e.layer,
            feature = marker.feature;
          var content = ('<p><strong>') + feature.properties.STATION + ('</strong></p><p>Metro ') + feature.properties.LINE + (' Line</p>');
          marker.bindPopup(content);
        });

        metroLayer.setGeoJSON(result.data);

        metroLayer.on('click', function(e) {
          map.panTo(e.layer.getLatLng());
        });
      });

      // MASK
      getCityShape().then((result) => {
        var borderLayer = L.geoJson(result.data, {
          style:{
            color:"#1b2c42",
            weight:0,
            fillColor:"#754aed",
            fillOpacity:0.15
          }
        }).addTo(map);
      });

      // add the ZIP code border to the map
      getSingleZIPBoundary().then((result) => {
        var borderLayer = L.geoJson(result.data, {
          style:{
            color:"#1dcc70",
            weight:3,
            fillOpacity:0
          }
        }).addTo(map);
      });

      var projectsLayer = L.mapbox.featureLayer().addTo(map);

      map.legendControl.addLegend(document.getElementById('legend').innerHTML);

      projectsLayer.on('layeradd', function(e) {
        var marker = e.layer,
          feature = marker.feature;
        var content = ('<p><strong>' + feature.properties.address + '</strong></p><p>') + (feature.properties.units == 0 ? "Unit count unavailable" : (feature.properties.units + " units")) + ('</p><p>' + feature.properties.date + '</p>');
        marker.bindPopup(content);
        $("#loading").hide();
      });

      projectsLayer.setGeoJSON(results.data);

      projectsLayer.on('click', function(e) {
        map.panTo(e.layer.getLatLng());
      });

      map.fitBounds(projectsLayer.getBounds());

      $("#year-selector .year").on("click", function(){
        let newYear = this.innerHTML;
        projectsLayer.setFilter(function(f) {
            return f.properties.date.toString().startsWith(newYear);
        });
        $("#year-selector .year").removeClass("active");
        $("#year-selector .yearReset").removeClass("active");
        $(this).addClass("active");
      });

      $("#year-selector .yearReset").on("click", function(){
        projectsLayer.setFilter(function(f){
          return true;
        });
        $("#year-selector .year").removeClass("active");
        $(this).addClass("active");
      });
    });
  });
});
