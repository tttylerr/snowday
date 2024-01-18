const express = require("express");
const path = require("path");
const axios = require("axios");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/index.html"));
});

app.get("/api/v1/snowday", async (req, res) => {
  const zipcode = req.query.zipcode;

  try {
    const forecasts = await getLatLong(zipcode);
    console.log(forecasts);
    res.send(forecasts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

// dont mess with

async function getLatLong(zipCode) {
  let forecasts = [];
  try {
    const apiUrl = `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=United States&format=json`;

    const response = await axios.get(apiUrl);

    if (response.data.length > 0) {
      const { lat, lon, display_name } = response.data[0];
      console.log(`Latitude: ${lat}, Longitude: ${lon}, City: ${display_name}`);
      const apiKey = process.env["weatherapi"];
      const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=4166a983a7849e871cba82ce681bada2`;

      const weatherResponse = await axios.get(baseUrl);

      if (weatherResponse.status === 200) {
        const nextDayForecasts = weatherResponse.data.list.filter((item) =>
          item.dt_txt.includes("06:00:00"),
        );

        nextDayForecasts.forEach((forecast) => {
          let fFaren = forecast.main.temp - 273.15;
          let fFaren2 = fFaren * 9;
          let fFaren3 = fFaren / 5;
          let fFaren4 = fFaren3 + 32;
          forecasts.push(
            `Time: ${forecast.dt_txt}, Temperature: ${Math.round(
              fFaren4,
            )} F, Weather: ${forecast.weather[0].description}`,
          );
          console.log(
            `Time: ${forecast.dt_txt}, Temperature: ${Math.round(
              fFaren4,
            )} F, Weather: ${forecast.weather[0].description}`,
          );
        });
      } else {
        console.log(`Error: ${weatherResponse.status}`);
      }
    }
    return forecasts;
  } catch (error) {
    console.error("Error fetching geocoding data:", error.message);
    throw error;
  }
}
