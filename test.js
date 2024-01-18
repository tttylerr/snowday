const axios = require("axios");

async function getLatLong(zipCode) {
  try {
    const apiUrl = `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=United States&format=json`;

    const response = await axios.get(apiUrl);

    if (response.data.length > 0) {
      const { lat, lon, display_name } = response.data[0];
      console.log(`Latitude: ${lat}, Longitude: ${lon}, City: ${display_name}`);
      const apiKey = process.env["weatherapi"];
      const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=4166a983a7849e871cba82ce681bada2`;

      axios
        .get(baseUrl)
        .then((response) => {
          if (response.status === 200) {
            const nextDayForecasts = response.data.list.filter((item) =>
              item.dt_txt.includes("06:00:00"),
            );

            nextDayForecasts.forEach((forecast) => {
              let fFaren = forecast.main.temp - 273.15;
              let fFaren2 = fFaren * 9;
              let fFaren3 = fFaren / 5;
              let fFaren4 = fFaren3 + 32;
              console.log(
                `Time: ${forecast.dt_txt}, Temperature: ${Math.round(
                  fFaren4,
                )} F, Weather: ${forecast.weather[0].description}`,
              );
            });
          } else {
            console.log(`Error: ${response.status}`);
          }
        })
        .catch((error) => {
          console.log("error ", error.message);
        });
    } else {
      console.log("No results found for the provided zip code.");
    }
  } catch (error) {
    console.error("Error fetching geocoding data:", error.message);
  }
}

// Replace '90210' with the desired zip code
getLatLong("48131");

let req = new XMLHttpRequest();
req.open("POST", "/api/v1/snowday");
req.onreadystatechange = function () {
  console.log(req.responseText);
}
req.send();
