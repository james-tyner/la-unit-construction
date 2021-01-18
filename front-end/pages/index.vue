<template>
  <div id="homepage-wrapper">
    <div id="city-summary">
      <div id="top-splitter">
        <div id="all-time-units">
          <h1>{{commaSeparated(summary.sum.all_time)}}</h1>
          <h2>units approved in the city of Los Angeles since 2013</h2> 
        </div>

        <homepage-chart id="chart-container" :chart-data="summary.sum" :height="100" :width="750"></homepage-chart>
      </div>

      <h2 id="most-active-header">Most active ZIP codes</h2>
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

      <homepage-map></homepage-map>

      <div id="zip-navigator-list">
        <nuxt-link :to="'/info/' + zip" :key="zip" v-for="zip in Object.keys(zipData)" class="zip-link-row">
          <h2 class="zip-link-number">{{zip}}</h2> <h3 class="zip-link-text">{{zipData[zip]["area_description"]["name"]}}</h3>
        </nuxt-link>
      </div>
      
    </main>
  </div>
</template>

<script>
import HomepageMap from "~/components/HomepageMap.vue";
import HomepageChart from "~/components/HomepageChart.vue";

export default {
  components:{
    HomepageMap,
    HomepageChart
  },
  async asyncData(){
    const summary = await fetch(`${process.env.apiUrl}/api/neighborhoods/summary`).then(res => res.json());

    const zipData = await fetch(`${process.env.apiUrl}/api/neighborhoods`).then(res => res.json())

    return {
      zipData,
      summary
    }
  },
  head(){
    return {
      title:"Add it up."
    }
  },
  methods:{
    commaSeparated(number){
      while (/(\d+)(\d{3})/.test(number.toString())){
        number = number.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
      }
      return number;
    }
  }
}
</script>

<style>
@import '~/assets/styles/css/homepage.min.css';
</style>