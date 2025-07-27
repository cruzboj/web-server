const pool = require("../pool");

const packsData = [
  {
    id: 1,
    header: "image/Pack1-Header.png",
    body: "image/Pack1-Body.png",
    query: "&q=brainrot",
  },
  {
    id: 2,
    header: "image/Pack2-Header.png",
    body: "image/Pack2-Body.png",
    query: "&q=Pokemon",
  },
  {
    id: 3,
    header: "image/Pack3-Header.png",
    body: "image/Pack3-Body.png",
    query: "&q=one-piece-anime",
  },
  {
    id: 4,
    header: "image/Pack4-Header.png",
    body: "image/Pack4-Body.png",
    query: "&q=DragonBall",
  },
];

function getPacks(req, res) {
  res.json(packsData);
}

function getCards(req, res) {
  let api = process.env.API_URL;
  let apikey = `&api_key=${process.env.API_KEY}`;
  const cardsData = req.query.q;
  if (!cardsData) {
    return res.status(400).send("Missing query");
  }
  const url = `${api}?${apikey}&q=${cardsData}&limit=100`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data.data || data.data.length === 0) {
        console.log(url);
        console.log(data);
        return res.status(404).send("No data found");
      }

      const shuffled = data.data.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6);

      const cards = selected.map((gif, index) => ({
        id: index + 1,
        name: gif.title || `Gif ${index + 1}`,
        image: gif.images.original.url,
        description: "Lorem Ipsum is simply dummy text.",
      }));

      res.json(cards);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    });
}

function getPacks2(req, res) {
  const query = "select * from packs";
  pool.query(query).then((response) => {
    res.status(200).json(response.rows);
  });
}

async function getCardFromPack(req, res) {
  try {
    const userID = req.user.id;
    const packID = req.body.packid;

    const coinQuery = `
      SELECT users.coins, packs.cost 
      FROM users 
      CROSS JOIN packs 
      WHERE users.id = $1 AND packs.packid = $2
    `;
    const coinResult = await pool.query(coinQuery, [userID, packID]);

    if (coinResult.rows.length === 0) {
      return res.status(404).json({ error: "User or pack not found" });
    }

    const { coins, cost } = coinResult.rows[0];
    if (coins < cost) {
      return res.status(403).json({ error: "Not enough coins for pack" });
    }

    const cardsResult = await pool.query(
      "SELECT * FROM cards WHERE packid = $1",
      [packID]
    );
    const cards = getRandomCards(cardsResult.rows);
    if (cards.length === 0) {
      return res
        .status(403)
        .json({ error: "This pack has fewer cards than required" });
    }

    // Check ownership for all cards
    const ownedChecks = await Promise.all(
      cards.map((card) =>
        pool
          .query("SELECT * FROM usercards WHERE userid = $1 AND cardid = $2", [
            userID,
            card.id,
          ])
          .then((res) => ({...card, owned: res.rows.length > 0,}
          ))
      )
    );

    // Insert or update accordingly
    const updatePromises = ownedChecks.map((card) => {
      if (card.owned) {
        return pool.query(
          "UPDATE usercards SET quantity = quantity + 1 WHERE userid = $1 AND cardid = $2",
          [userID, card.id]
        );
      } else {
        return pool.query(
          "INSERT INTO usercards(userid, cardid, quantity) VALUES ($1, $2, 1)",
          [userID, card.id]
        );
      }
    });

    await Promise.all(updatePromises);

    return res
      .status(200)
      .json({ status: "Cards added successfully", cards: ownedChecks });
  } catch (err) {
    console.error("Error in getCardFromPack:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}



function getRandomCards(cards, count = 2) {
  if (!Array.isArray(cards) || cards.length <= count) {
    console.log("Card list is empty or not long enough");
    return [];
  }
  const cardsCopy = [...cards];

  for (let i = cardsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardsCopy[i], cardsCopy[j]] = [cardsCopy[j], cardsCopy[i]];
  }
  return cardsCopy.slice(0, count);
}

module.exports = {
  getPacks,
  getCards,
  getPacks2,
  getCardFromPack,
};
