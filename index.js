const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("ioredis");

const redisClient = Redis.createClient({ port: 6382 });

const DEFAULT_EXPIRATION = 3600;

redisClient.on("connect", () => {
  console.log("Redis client connectedddd");
});

redisClient.on("error", (error) => {
  console.log("Redis client issue");
});
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  redisClient.get("photos", async (error, photos) => {
    if (error) console.error(error);
    if (photos != null) {
      console.log("cache hit");
      return res.json(JSON.parse(photos));
    } else {
      console.log("cache miss");
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/photos",
        { params: { albumId } }
      );
      redisClient.setex("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
      res.json(data);
    }
  });
});

// app.get("/photos/:id", async (req, res) => {
//     const { data } = await axios.get(
//       `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
//     );
//     res.json(data);
//   });    

app.listen(3002);
