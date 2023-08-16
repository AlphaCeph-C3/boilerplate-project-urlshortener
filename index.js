require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const fs = require('fs');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const filePath = `${process.cwd()}/urlData.json`;

app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;
  try {
    // checking if the url is valid
    const newUrl = new URL(url);
    console.log(newUrl.protocol);
    if (newUrl.protocol !== 'http:' && newUrl.protocol !== 'https:')
      throw new Error('this is invalid url');
    const fileExists = fs.existsSync(filePath);
    const original_url = url;
    if (fileExists) {
      // reading from the file to see append the key and value pair
      fs.readFile(filePath, 'utf-8', (err, fd) => {
        if (err) throw err;
        const jsonData = JSON.parse(fd);
        const length = Object.keys(jsonData).length;
        jsonData[`${length + 1}`] = url;
        fs.writeFile(filePath, JSON.stringify(jsonData), (err) => {
          if (err) {
            console.log(err);
          }
        });
        res.json({
          original_url,
          short_url: length + 1,
        });
      });
    } else {
      const data = { 1: url };
      fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {
          console.log(err);
        }
      });
      res.json({
        original_url,
        short_url: 1,
      });
    }
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:key', function (req, res) {
  try {
    const { key } = req.params;
    fs.readFile(filePath, 'utf-8', (err, fd) => {
      const jsonData = JSON.parse(fd);
      res.redirect(jsonData[key]);
    });
  } catch (err) {
    res.json({ error: 'No such url is found' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
