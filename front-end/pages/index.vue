<template>
  <div id="homepage-wrapper">
    <div id="city-summary">
      <div id="all-time-units">
        <h1>{{commaSeparated(summary.sum.all_time)}}</h1>
        <h2>units approved in the city of Los Angeles since 2013</h2> 
      </div>

      <h2 id="most-active-header">Most active</h2>
      <div id="top-five">
        
        <nuxt-link :to="'/info/' + zip.zip" v-for="zip in summary['top-five']" :key="zip.zip">
          <h2>{{zip.zip}}</h2>
          <h3>{{zipData[zip.zip]["area_description"]["name"]}}</h3>
          <h3><span class="small-unit-number">{{commaSeparated(zip.units)}} units</span></h3>
        </nuxt-link>
      </div>
    </div>

    <main>
      <h2>Find your neighborhood</h2>

      <figure id="map-container">
        <div id="map"></div>
      </figure>

      <div id="zip-navigator-list">
        <nuxt-link :to="'/info/' + zip" :key="zip" v-for="zip in Object.keys(zipData)" class="zip-link-row">
          <h2 class="zip-link-number">{{zip}}</h2> <h3 class="zip-link-text">{{zipData[zip]["area_description"]["name"]}}</h3>
        </nuxt-link>
      </div>
      
    </main>
  </div>
</template>

<script>
import * as turf from '@turf/turf';

export default {
  async asyncData(){
    const zipBoundaries = await fetch(`${process.env.apiUrl}/api/boundary/zips`).then(res => res.json());

    const cityBoundary = await fetch(`${process.env.apiUrl}/api/boundary/city`).then(res => res.json());

    const summary = await fetch(`${process.env.apiUrl}/api/neighborhoods/summary`).then(res => res.json());

    const zipData = await fetch(`${process.env.apiUrl}/api/neighborhoods`).then(res => res.json())

    return {
      zipBoundaries,
      cityBoundary,
      zipData,
      summary
    }
  },
  head(){
    return {
      title:"Add it up.",
      link:[
        {
            href:'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css',
            rel:'stylesheet'
        }
      ],
      script:[
        {
            src:'https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js'
        }
      ]
    }
  },
  methods:{
    commaSeparated(number){
      while (/(\d+)(\d{3})/.test(number.toString())){
        number = number.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
      }
      return number;
    }
  },
  mounted(){
    const mapboxgl = require('mapbox-gl');  

    const map = new mapboxgl.Map({
      accessToken:process.env.mapboxApiKey,
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center:[-118.2448473,34.053718],
      zoom:9
    })

    map.on("load", () => {
      // Add all data sources
      map.addSource("boundaries", {
        "type":"geojson",
        "data":this.zipBoundaries,
        "generateId":true
      })

      map.addSource("city-boundary", {
        "type":"geojson",
        "data":this.cityBoundary
      })

      // Add all layers based on data sources
      map.addLayer({
        "id":"city-boundary",
        "type":"line",
        "source":"city-boundary",
        "paint":{
          "line-color":"#333333",
          "line-width":3
        }
      })

      map.addLayer({
        "id":"boundaries",
        "type":"fill",
        "source":"boundaries",
        "paint":{ 
          "fill-color":"#754aed",
          "fill-opacity":[
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.5
          ]
        }
      })
    })

    // create the popup that will go over the ZIP when hovered
    let popup = new mapboxgl.Popup({
      closeButton:false,
      closeOnClick:false
    })

    let popupTemplate = (zip) => {
      return `<h5 class='map-zip-code'>${zip}</h5>`
    }

    // create the hover effect with the popup
    let zipArea = null;

    map.on("mousemove", "boundaries", event => {
      map.getCanvas().style.cursor = "pointer";

      if (zipArea){
        map.removeFeatureState({
          source:"boundaries",
          id:zipArea
        })
      }

      if (event.features.length > 0){
        //change the opacity
        zipArea = event.features[0].id;

        map.setFeatureState({
          source:"boundaries",
          id:zipArea
        }, {
          hover: true
        })

        // add the popup
        let coordinates = event.features[0].geometry;
        let centerPoint = turf.center(coordinates);
        let center = turf.getCoords(centerPoint)


        let zipCode = event.features[0].properties.zipcode;

        popup.setLngLat([center[0], center[1]]).setHTML(popupTemplate(zipCode)).addTo(map);
      }
    })

    map.on("mouseleave", "boundaries", event => {
      // accommodate mouse leave
      if (zipArea){
        map.setFeatureState({
          source:"boundaries",
          id:zipArea
        }, {
          hover: false
        })
      }

      map.getCanvas().style.cursor = "";
      popup.remove();
    })

    map.on("click", "boundaries", event => {
      let zipCode = event.features[0].properties.zipcode;

      this.$router.push(`/info/${zipCode}`);
    })
  }

}
</script>

<style>
@import '~/assets/styles/css/homepage.min.css';
</style>