<template>
    <div id="info-container">
        <main>
            <div id="zip-info">
                <h1>{{zip}}</h1>
                <h2 id="neighborhood-name">{{attributes.name}}</h2>

                <hr>

                <h2>{{commaSeparated(attributes.all)}}</h2>
                <h3 id="approved-units">units approved since 2013</h3>

                <hr>

                <h3>Number <span class="label">population</span></h3>
                <h3>Number <span class="label">minority</span></h3>
                <h3>Number <span class="label">of income spent on housing</span></h3>
                <h3>Number <span class="label">median income</span></h3>
                <h3>Number <span class="label">monthly housing cost</span></h3>
            </div>

            <div id="map-container">
                <div id="map"></div>
            </div>

            <!-- <div id="map-controls">
                <div class="year selected" value="all">All</div>
                <div class="year" value="2020">2020</div>
                <div class="year" value="2019">2019</div>
                <div class="year" value="2018">2018</div>
                <div class="year" value="2017">2017</div>
                <div class="year" value="2016">2016</div>
                <div class="year" value="2015">2015</div>
                <div class="year" value="2014">2014</div>
                <div class="year" value="2013">2013</div>
            </div> -->
        </main>

        <div id="projects-list">
            <h2>All Projects</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Address</th>
                        <th>Units</th>
                        <th>Stories</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="project in projects" :key="project.pcis_permit">
                        <td>{{humanDate(project.date._seconds * 1000)}}</td>
                        <td>{{project.address}}</td>
                        <td>{{commaSeparated(project.units)}}</td>
                        <td>{{project.stories}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import * as turf from '@turf/turf';

export default {
    async asyncData({ params }){
        const projects = await fetch(`${process.env.apiUrl}/api/projects/${params.zip}`).then(res => res.json())

        const attributes = await fetch(`${process.env.apiUrl}/api/neighborhoods/${params.zip}`).then(res => res.json())

        const zipBoundaries = await fetch(`${process.env.apiUrl}/api/boundary/${params.zip}`).then(res => res.json())

        let centerPoint = turf.center(zipBoundaries);
        let center = turf.getCoords(centerPoint)
        
        return {
            zip:params.zip,
            attributes,
            projects,
            zipBoundaries,
            center
        }
    },
    head(){
        return {
            title:`${this.zip} - Add it up.`,
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
        humanDate(date){
            let dateObj = new Date(date);
            return dateObj.toLocaleDateString("en-US", {
          month:"short",
          day:"2-digit",
          year:"numeric"
        });
        },
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
        })

        let bounds = new mapboxgl.LngLatBounds();

        // Add all markers for projects
        for (let project of this.projects){
            let popupHTML = `<div class="popup-text">
            <h4>${project.address}</h4>
            <p class="popup-units">${project.units} units, approved ${this.humanDate(project.date._seconds * 1000)}</p>
            <p class="popup-desc">${project.description}…</p>
            </div>`

            try {
                var marker = new mapboxgl.Marker({
                    color:"#754aed",
                    anchor:"bottom"
                })
                .setLngLat([JSON.parse(project.latlong).longitude, JSON.parse(project.latlong).latitude])
                .setPopup(new mapboxgl.Popup().setHTML(popupHTML))
                .addTo(map);

                bounds.extend([JSON.parse(project.latlong).longitude, JSON.parse(project.latlong).latitude])
            } catch {
                continue;
            }
        }

        map.fitBounds(bounds, { padding: 40 });

        map.on("load", () => {
            // Add all data sources
            map.addSource("boundary", {
                "type":"geojson",
                "data":this.zipBoundaries
            })

            // Add all layers based on data sources
            map.addLayer({
                "id":"boundary",
                "type":"line",
                "source":"boundary",
                "paint":{ "line-color":"#1dcc70", "line-width":3 }
            })
        })
    }
}
</script>

<style>
@import '~/assets/styles/css/info.min.css';
</style>