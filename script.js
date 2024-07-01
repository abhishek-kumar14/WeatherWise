
let weather = {
  apiKey: "aba6ff9d6de967d5eac6fd79114693cc",
  fetchWeather: function (city, units = "metric") {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=" +
        units +
        "&appid=" +
        this.apiKey
    )
      .then((response) => {
        if (!response.ok) {
          alert("No weather found.");
          throw new Error("No weather found.");
        }
        return response.json();
      })
      .then((data) => this.displayWeather(data, units));
  },
  displayWeather: function (data, units) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;
    const temperatureUnit = units === "metric" ? "°C" : "°F";
    const speedUnit = units === "metric" ? "km/h" : "mph";
    
    document.querySelector(".city").innerText = "Weather in " + name;
    document.querySelector(".icon").src =
      "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = temp + temperatureUnit;
    document.querySelector(".humidity").innerText =
      "Humidity: " + humidity + "%";
    document.querySelector(".wind").innerText =
      "Wind speed: " + speed + " " + speedUnit;
    document.querySelector(".weather").classList.remove("loading");
    document.body.style.backgroundImage =
      "url('https://source.unsplash.com/1600x900/?" + name + "')";
    this.addRecentSearch(name);
  },
  fetchForecast: function (city, units = "metric") {
    fetch(
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
        city +
        "&units=" +
        units +
        "&appid=" +
        this.apiKey
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("No forecast found.");
        }
        return response.json();
      })
      .then((data) => this.displayForecast(data, units));
  },
  displayForecast: function (data, units) {
    const forecastEl = document.querySelector(".forecast");
    forecastEl.innerHTML = "";
    for (let i = 0; i < data.list.length; i += 8) {
      const { dt_txt } = data.list[i];
      const { icon, description } = data.list[i].weather[0];
      const { temp } = data.list[i].main;
      const temperatureUnit = units === "metric" ? "°C" : "°F";
      const day = document.createElement("div");
      day.classList.add("day");
      day.innerHTML = `
        <div>${new Date(dt_txt).toLocaleDateString("en-US", { weekday: "long" })}</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
        <div>${temp}${temperatureUnit}</div>
      `;
      forecastEl.appendChild(day);
    }
  },
  search: function () {
    const city = document.querySelector(".search-bar").value;
    const units = document.querySelector(".unit-toggle .active").classList.contains("celsius") ? "metric" : "imperial";
    this.fetchWeather(city, units);
    this.fetchForecast(city, units);
  },
  addRecentSearch: function (city) {
    const recentSearchesEl = document.querySelector(".recent-searches");
    if ([...recentSearchesEl.children].some(el => el.innerText === city)) return;
    const searchItem = document.createElement("div");
    searchItem.classList.add("search-item");
    searchItem.innerText = city;
    searchItem.addEventListener("click", () => {
      document.querySelector(".search-bar").value = city;
      this.search();
    });
    recentSearchesEl.appendChild(searchItem);
  },
};

let geocode = {
  reverseGeocode: function (latitude, longitude) {
    var apikey = "90a096f90b3e4715b6f2e536d934c5af";
    var api_url = "https://api.opencagedata.com/geocode/v1/json";
    var request_url =
      api_url +
      "?" +
      "key=" +
      apikey +
      "&q=" +
      encodeURIComponent(latitude + "," + longitude) +
      "&pretty=1" +
      "&no_annotations=1";
    var request = new XMLHttpRequest();
    request.open("GET", request_url, true);
    request.onload = function () {
      if (request.status == 200) {
        var data = JSON.parse(request.responseText);
        weather.fetchWeather(data.results[0].components.city);
        weather.fetchForecast(data.results[0].components.city);
      } else if (request.status <= 500) {
        console.log("unable to geocode! Response code: " + request.status);
        var data = JSON.parse(request.responseText);
        console.log("error msg: " + data.status.message);
      } else {
        console.log("server error");
      }
    };
    request.onerror = function () {
      console.log("unable to connect to server");
    };
    request.send();
  },
  getLocation: function() {
    function success (data) {
      geocode.reverseGeocode(data.coords.latitude, data.coords.longitude);
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, console.error);
    }
    else {
      weather.fetchWeather("Delhi");
      weather.fetchForecast("Delhi");
    }
  }
};

document.querySelector(".search button").addEventListener("click", function () {
  weather.search();
});

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    weather.search();
  }
});

document.querySelector(".unit-toggle").addEventListener("click", function (event) {
  if (event.target.classList.contains("celsius") || event.target.classList.contains("fahrenheit")) {
    document.querySelectorAll(".unit-toggle span").forEach(span => span.classList.toggle("active"));
    weather.search();
  }
});

geocode.getLocation();
