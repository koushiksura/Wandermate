window.onscroll = function () {
  var navbar = document.getElementById("nav");
  var wander = document.getElementById("wander");
  var mate = document.getElementById("mate");
  var items = document.getElementsByClassName("items");
  var count = document.getElementById("count");

  if (window.pageYOffset < 50) {
    navbar.style.background = "rgba(0, 0, 0, 0)";
    wander.style.color = "#ffffff";
    mate.style.color = "#06b995";
    for (var i = 0; i < items.length; i++) {
      items[i].style.color = "#ffffff";
      items[i].onmouseover = function () {
        items[i].style.color = "#06b995";
      };
    }
  } else {
    navbar.style.backgroundImage =
      "url('https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ6fR7ttWrgpXuaAX0B5EYjuscS_8_FHRe2iGUw0j2L4vxuRzj4')";
    wander.style.color = "#5e72e4";
    mate.style.color = "#f0f1f2";
    for (var i = 0; i < items.length; i++) {
      items[i].style.color = "#ffffff";
      items[i].onmouseover = function () {
        items[i].style.color = "black";
      };
    }
  }
};

function skycons(img) {
  var icon1, ion2;
  if (img === "clear-day") {
    icon1 = "far";
    icon2 = "fa-sun";
  } else if (img === "clear-night") {
    icon1 = "fas";
    icon2 = "fa-moon";
  } else if (img === "partly-cloudy-day") {
    icon1 = "fas";
    icon2 = "fa-cloud-sun";
  } else if (img === "partly-cloudy-night") {
    icon1 = "fas";
    icon2 = "fa-cloud-moon";
  } else if (img === "cloudy") {
    icon1 = "fas";
    icon2 = "fa-cloud";
  } else if (img === "rain") {
    icon1 = "fas";
    icon2 = "fa-cloud-rain";
  } else if (img === "sleet") {
    icon1 = "far";
    icon2 = "fa-snowflake";
  } else if (img === "snow") {
    icon1 = "far";
    icon2 = "fa-snowflake";
  } else if (img === "wind") {
    icon1 = "fas";
    icon2 = "fa-wind";
  } else if (img === "fog") {
    icon1 = "fas";
    icon2 = "fa-smog";
  }
  document.getElementById("icon").classList.add(icon1, icon2);
}

function weather(lat, lng) {
  var url =
    "https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/3df797b4eafbe34d7c0873f563151828/" +
    lat.toString() +
    "," +
    lng.toString() +
    "?exclude=currently,flags,hourly?units=si";
  $.getJSON([url], function (forecast) {
    console.log(forecast);
    var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    var day = document.getElementsByClassName("days");
    var max = document.getElementsByClassName("max");
    var min = document.getElementsByClassName("min");
    var p = document.getElementsByClassName("p");
    document.getElementById("sum").innerHTML = forecast.daily.data[0].summary;
    document.getElementById("wind").innerHTML =
      forecast.daily.data[0].windSpeed;
    document.getElementById("prep").innerHTML =
      Math.round(forecast.daily.data[0].precipProbability * 100).toString() +
      "%";
    document.getElementById("mintemp").innerHTML =
      forecast.daily.data[0].apparentTemperatureLow;
    document.getElementById("temp").innerHTML =
      forecast.daily.data[0].apparentTemperatureHigh.toString() + "°F";
    for (var i = 1; i < 8; i++) {
      var time = new Date(forecast.daily.data[i].time * 1000);
      day[i - 1].innerHTML = days[time.getDay()];
      max[i - 1].innerHTML = forecast.daily.data[i].apparentTemperatureHigh;
      min[i - 1].innerHTML = forecast.daily.data[i].apparentTemperatureLow;
      var prep = Math.round(forecast.daily.data[i].precipProbability * 100);
      p[i - 1].innerHTML = prep.toString() + "%";
    }
    skycons(forecast.daily.data[0].icon);
  });
}

function initMap() {
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: { lat: -34.397, lng: 150.644 },
  });
  var geocoder = new google.maps.Geocoder();

  document.getElementsByTagName("BODY")[0].onload = function () {
    geocodeAddress(geocoder, map);
  };
}

function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById("address").innerHTML;
  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      resultsMap.setCenter(results[0].geometry.location);
      var lat = results[0].geometry.location.lat();
      var lng = results[0].geometry.location.lng();
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location,
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
    weather(lat, lng);
  });
}

var divs = document.getElementsByClassName("card4");
for (var i = 0; i < divs.length; i++) {
  divs[i].onmouseover = function () {
    this.style.zIndex = "1";
    this.style.borderRadius = "3px";
  };
  divs[i].onmouseout = function () {
    this.style.zIndex = "0";
    this.style.borderRadius = "0px";
  };
}

function change(ind) {
  var pages = document.getElementsByClassName("btn-light");

  for (var i = 1; i <= pages.length; i++) {
    if (i === ind) {
      document.getElementById(i.toString()).style.display = "inline-block";
      pages[i - 1].style.backgroundColor = "#2196f3";
      pages[i - 1].style.color = "#ffffff";
    } else {
      document.getElementById(i.toString()).style.display = "none";
      pages[i - 1].style.backgroundColor = "#f8f9fa";
      pages[i - 1].style.color = "#000000";
    }
  }
}
