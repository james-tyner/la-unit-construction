axios.get("/api/neighborhoods").then(function(response){
  let neighborhoods = []
  for (var i=0; i < response.data.length; i++){
    neighborhoods.push({
      "label":(response.data[i].zipCode + " - " + response.data[i].description).toString(),
      "value":response.data[i].zipCode
    });
  }

  $("#search").submit(function (e) {
    var validationFailed = true;
    let formZip = $("#search input").val();

    for (var j = 0; j < neighborhoods.length; j++){
     if (neighborhoods[j].value != formZip){
       continue;
     } else {
       validationFailed = false;
       break;
     }
    }

    if (validationFailed) {
      e.preventDefault();
      return false;
    }
  });

  $('#search input').autocomplete({
    source: neighborhoods,
    minLength: 2,
    select: function(event, ui) {
      $("#search input").val(ui.item.value);
      $("#search").submit();
    }
  });
});
