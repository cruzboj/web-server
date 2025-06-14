require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;
app.use(cors());

/*

*/

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/test', (req, res) => {
    res.send('Test!');
});

const path = require('path');
app.get('/cards', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'cards.json'));
});

app.listen(PORT, () => {
    console.log(`Server listen to http://localhost:${PORT}`);
})