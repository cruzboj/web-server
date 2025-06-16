require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;
app.use(cors());

/*
  API Key: 2X6nJ0ypZg0zYl1Xaqe1Xndxq7vHptaNIEc
  https://api.giphy.com
*/

let api = "https://api.giphy.com/v1/gifs/search?";
let apikey = "&api_key=nJ0ypZg0zYl1Xaqe1Xndxq7vHptaNIEc"
let qyery = "&q=brainrot";
let limit = "&limit=100";

const Rnum = Math.floor(Math.random() * 100);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/test', (req, res) => {
    res.send('Test!');
});

app.get('/cards', (req, res) => {
    const Rnum = Math.floor(Math.random() * 100);
    const url = api + apikey + qyery + limit;
    
    fetch(url).then(response => response.json())
      .then(data => {
        if(!data.data || data.data.length === 0) {
          res.status(404).send('No data found');
          return;
        } else {
          const shuffled = data.data.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 6);
  
          const cards = selected.map((gif, index) => ({
            id: index + 1,
            name: gif.title || `Gif ${index + 1}`,
            image: gif.images.original.url,
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
          }));
            res.json(cards);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
      });
    // שורה זו לא צריכה להיות פה
    // res.sendFile(path.join(__dirname, 'data', 'cards.json'));
});
  
app.listen(PORT, () => {
    console.log(`Server listen to http://localhost:${PORT}`);
})