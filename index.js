const express = require("express");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //*
app.use(limiter);

const PORT = 3000;

const data = fs.readFileSync(`${__dirname}/data/cities.json`, "utf-8");
const parsedData = JSON.parse(data);

let parsedCities = parsedData.cities;

app.get("/", (req, res) => {
  res.status(200).json("Welcome to the worldwise server");
});

app.get("/cities", (req, res) => {
  try {
    res.status(200).json(parsedCities);
  } catch (error) {
    res.status(400).json("Error fetching from API");
  }
});

app.get("/cities/:id", (req, res) => {
  const id = req.params.id;

  try {
    const citySelected = parsedCities.find((el) => el.id === +id);
    if (citySelected) return res.status(200).json(citySelected);
    else throw new Error("Selected Id does not exist 😓");
    // res.status(200).json(getOneCity(id));
  } catch (error) {
    res.status(400).json({ error: error.message });
    // throw new Error("Error fetching from API")
  }
});

app.post("/cities", (req, res) => {
  const { cityName, country, date, notes, emoji, position } = req.body;
  const randomId = Math.floor(Math.random() * 100000000); //i could have used a 3rd party but this is a small use case.
  try {
    if (!cityName || !country || !date || !position)
      throw new Error("Input all required fields");
    parsedCities.push({ ...req.body, id: randomId });
    res.status(200).json(parsedCities[parsedCities.length - 1]);
  } catch (error) {
    res.status(400).json({ error: error.message });
    // throw new Error("Error fetching from API");
  }
});

app.delete("/cities/:id", (req, res) => {
  const id = req.params.id;
  try {
    parsedCities = parsedCities.filter((el) => el.id !== +id);

    return res.status(200).json(parsedCities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("*", (req, res) => {
  res.status(404).json("Route does not exist");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
