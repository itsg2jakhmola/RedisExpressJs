const express = require('express');
const axios = require('axios');
const redis = require('redis');

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

async function getPostById(req, res, next) {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
    //get data from response
    const data = response.data
    
    //Set redis
    client.setex(id, 3600, JSON.stringify(data))
    
    return res.json(data)

  } catch(err) {
    console.log("Something went wrong", err)
    res.status(500).send("Something went wrong")
  }
}

function redisCache(req, res, next) {
  const { id } = req.params;
  client.get(id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    //if no match found
    if(data !== null) {
      res.send(data)
    } else {
      //proceed to next middleware function
      next()
    }
  })
}

app.get('/post/:id', redisCache, getPostById)

app.listen(5000, () => {
  console.log(`App listening on port ${PORT}`);
});