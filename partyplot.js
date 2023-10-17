const app = require("express")();
const axios = require("axios");
const Redis = require("ioredis");
const redisClient = new Redis({ port: 6383 }); // You need to use 'new Redis' to create a new instance
const DEFAULT_EXPIRATION = 3600;
app.get("/palashsiyal", async (req, res)=>{
    redisClient.get("palash", async(error,palash)=>{
        if (error) {console.log(error)}
        if (palash != null) {return res.json(JSON.parse(palash))} else {const {data}= await axios.get("https://jsonplaceholder.typicode.com/photos")
        redisClient.setex("palash",DEFAULT_EXPIRATION,JSON.stringify(data))
        res.json(data)}})})
app.listen(3003)
