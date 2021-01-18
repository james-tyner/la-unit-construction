<template>
    <figure id="map-container">
        <div id="map"></div>
    </figure>
</template>

<script>
import * as turf from '@turf/turf';

export default {
    async asyncData(){
        const zipBoundaries = await fetch(`${process.env.apiUrl}/api/boundary/zips`).then(res => res.json());

        const cityBoundary = await fetch(`${process.env.apiUrl}/api/boundary/city`).then(res => res.json());

        return {
            zipBoundaries,
            cityBoundary
        }
    },
    head(){
        return {
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