// const packsData = [
//   {
//     id: 1,
//     header: "image/Pack1-Header.png",
//     body: "image/Pack1-Body.png",
//     query: "&q=brainrot",
//   },
//   {
//     id: 2,
//     header: "image/Pack2-Header.png",
//     body: "image/Pack2-Body.png",
//     query: "&q=Pokemon",
//   },
//   {
//     id: 3,
//     header: "image/Pack3-Header.png",
//     body: "image/Pack3-Body.png",
//     query: "&q=one-piece-anime",
//   },
//   {
//     id: 4,
//     header: "image/Pack4-Header.png",
//     body: "image/Pack4-Body.png",
//     query: "&q=DragonBall",
//   },
// ];

// function getPacks(req, res) {
//   res.json(packsData);
// }

// function getCards(req, res) {
//   let api = process.env.API_URL;
//   let apikey = `&api_key=${process.env.API_KEY}`;
//   const cardsData = req.query.q;
//   if (!cardsData) {
//     return res.status(400).send("Missing query");
//   }
//   const url = `${api}?${apikey}&q=${cardsData}&limit=100`;
//   fetch(url)
//     .then((response) => response.json())
//     .then((data) => {
//       if (!data.data || data.data.length === 0) {
//         console.log(url);
//         console.log(data);
//         return res.status(404).send("No data found");
//       }

//       const shuffled = data.data.sort(() => 0.5 - Math.random());
//       const selected = shuffled.slice(0, 6);

//       const cards = selected.map((gif, index) => ({
//         id: index + 1,
//         name: gif.title || `Gif ${index + 1}`,
//         image: gif.images.original.url,
//         description: "Lorem Ipsum is simply dummy text.",
//       }));

//       res.json(cards);
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error);
//       res.status(500).send("Internal Server Error");
//     });
// }
const pool = require("../pool");

function getAvailablePacks(req, res) {
  const query = `SELECT * FROM packs WHERE show_pack = TRUE order by packid asc`;

  pool
    .query(query)
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch((error) => {
      console.error("Error fetching packs:", error);
      res.status(500).json({ error: "Internal server error" });
    });
}

module.exports = {
  getAvailablePacks,
};
