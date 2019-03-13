const requestedZip = new URLSearchParams(window.location.search).get('zip');

function getZIPCodeInfo() {
  return axios.get(`/api/neighborhoods/${requestedZip}`);
}

function getZIPCodeProjects() {
  return axios.get(`/api/projects/${requestedZip}`);
}

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
        if (val == "null" || val == null){
          return 0;
        } else {
          return val;
        }
      }
    }
  });
}));
