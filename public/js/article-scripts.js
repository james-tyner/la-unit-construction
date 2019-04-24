Chart.defaults.global.defaultFontFamily = 'Roboto Condensed';

var yearlyChart = document.getElementById('yearly-chart').getContext('2d');
var chart1 = new Chart(yearlyChart, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
        labels: ['2013', '2014', '2015', '2016', '2017', '2018'],
        datasets: [{
            label: 'New housing units approved',
            backgroundColor: '#333333',
            hoverBackgroundColor:"#754aed",
            data: [761, 2326, 8003, 14604, 14656, 17090]
        }]
    },

    // Configuration options go here
    options: {}
});

var mostActiveChart = document.getElementById("most-active-chart").getContext("2d");
var chart2 = new Chart(mostActiveChart, {
  type:"bar",
  data:{
    labels:["90015: South Park", "90094: Playa Vista", "90014: Los Angeles", "91601: North Hollywood", "90028: Hollywood", "90045: LAX Area / Westchester", "90026: Echo Park / Silver Lake", "91367: Woodland Hills", "90012: Civic Center / Chinatown", "90025: Sawtelle / West LA"],
    datasets:[{
      label:"New housing units approved",
      backgroundColor:"#333333",
      hoverBackgroundColor:"#1dcc70",
      data:[4558, 2661, 2299, 2260, 2213, 1887, 1426, 1419, 1398, 1397]
    }]
  },
  options:{
    title:{
      text:"Los Angeles ZIP codes with the most new housing units approved",
      fontSize:14,
      fontFamily:"Roboto",
      fontWeight:"bold",
      fontColor:"#1b2c42",
      display:true
    }
  }
})

var leastActiveChart = document.getElementById("least-active-chart").getContext("2d");
var chart3 = new Chart(leastActiveChart, {
  type:"bar",
  data:{
    labels:["*91504: Burbank / Glenoaks", "*90717: Lomita / Rancho Palos Verdes", "*91505: Burbank", "*91105: Pasadena", "*91214: La Crescenta", "*90212: Beverly Hills", "*91205: Glendale / Tropico", "90732: Rancho Palos Verdes", "*90063: City Terrace", "*91340: San Fernando", "*90402: Santa Monica", "90293: Playa del Rey", "91344: Granada Hills", "91345: Mission Hills", "91307: West Hills"],
    datasets:[{
      label:"New housing units approved",
      backgroundColor:"#333333",
      hoverBackgroundColor:"#1dcc70",
      data:[0, 0, 0, 1, 1, 1, 2, 11, 17, 17, 18, 20, 35, 37, 38]
    }]
  },
  options:{
    title:{
      text:"Los Angeles ZIP codes with the fewest new housing units approved",
      fontSize:14,
      fontFamily:"Roboto",
      fontWeight:"bold",
      fontColor:"#1b2c42",
      display:true
    }
  }
})
