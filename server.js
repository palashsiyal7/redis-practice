const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("ioredis");

const redisClient = Redis.createClient({ port: 6380 });

// Default expiration
const DEFAULT_EXPIRATION = 3600;

redisClient.on("connect", () => {
  console.log("Redis client connected.");
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  const photos = await getOrSetCache(`photos?albumId=${albumId}`, async ()=>{
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      { params: { albumId } }
    );
    return data
  })
  res.json(photos);
});

app.get("/photos/:id", async (req, res) => {
  const photo = await getOrSetCache(`photos:${req.params.id}`, async ()=>{
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${req.params.id}`,
    );
    return data
  })
  res.json(photo);
});

function getOrSetCache(key,cb){
  return new Promise((resolve, reject)=>{
    redisClient.get(key, async (error, data)=>{
      if(error) return reject(error)
      if (data != null) return resolve(JSON.parse(data))
      const freshData = await cb()
      redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData))
      resolve(freshData)
    })
  })
}

app.listen(3001, () => {
  console.log("Server is running on port 3001.");
});
