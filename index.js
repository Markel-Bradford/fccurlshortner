require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const regex = /^(https?:\/\/)(localhost|(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]{1,5})?(\/[^\s]*)?$/;


// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Url = require("./UrlSchema");
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function (req, res) {
  
  const url_input = req.body.url
  // Use regex to confirm that URL input is valid
  if (!regex.test(url_input)) {
    // If invalid, return json object with invalid url message
    res.json({error: "invalid url"})
  } 

  try {
    // Find the Url in the database by matching the input parsed from the body to an original_url 
    const urlInDB = await Url.findOne({original_url: url_input})

    // Set condition to save Urls if not in DB
    if (!urlInDB) {
      // Count number of documents in collection
      const count_url = await Url.countDocuments({});
      // Create new document in DB
      const newUrl = await Url.create({
        original_url: url_input,
        short_url: count_url + 1 // Incretement short Url by 1 based on document count
      })
      // Respond with original url and short url
      res.json({original_url: newUrl.original_url, short_url: newUrl.short_url})      
    } else {
      // If Url exists, return original url and short url
      res.json({original_url: urlInDB.original_url, short_url: urlInDB.short_url})
    }
  } catch (error) {
    console.error("Error in POST /api/shorturl:", error);
    return res.status(500).json({ error: "Server error" });
  }
})

app.get('/api/shorturl/:short_url', async function (req, res) {
  const shortUrlParam = req.params.short_url

  // Validate that short_url is a number
  if (!shortUrlParam || isNaN(shortUrlParam)) {
    return res.status(400).json({ error: 'invalid url' });
  }

try {
  // Find the url that matches the queried short_url
  const urlInDB = await Url.findOne({ short_url: Number(shortUrlParam) });
  // If url is not in DB, return error message
  if (!urlInDB) {
    res.json({error: "invalid url"})
  } 
    // If present in DB, redirect to original Url
  res.redirect(urlInDB.original_url)
  } catch (error) {
    console.error("Error in Get /api/shorturl/:short_url:", error);
    return res.status(500).json({ error: "Server error" });
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
