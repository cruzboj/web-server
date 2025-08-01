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

async function getCardFromPack(req, res) {
  try {
    const userID = req.user.id;
    const packID = req.params.packid;

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
          .then((res) => ({ ...card, owned: res.rows.length > 0 }))
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

    pool.query("update users set coins=coins-$1 where id=$2", [cost, userID]);
    return res
      .status(200)
      .json({ status: "Cards added successfully", cards: ownedChecks });
  } catch (err) {
    console.error("Error in getCardFromPack:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function getRandomCards(cards) {
  const cardsCopy = [...cards];

  for (let i = cardsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardsCopy[i], cardsCopy[j]] = [cardsCopy[j], cardsCopy[i]];
  }
  const count = Math.min(6, cardsCopy.length);
  return cardsCopy.slice(0, count);
}

async function insertCard(req, res) {
  const userid = req.body.userid;
  const cardid = req.body.cardid;
  if (!userid || !cardid) {
    return res.status(401).json({ error: "invalid parameters" });
  }
  const userCheck = await pool.query("select * from users where id = $1", [
    userid,
  ]);
  const cardCheck = await pool.query("select * from cards where id = $1", [
    cardid,
  ]);
  if (userCheck.rows.length === 0 || cardCheck.rows.length === 0) {
    return res.status(404).json({ error: "user or card are invalid" });
  }
  const query = `
  INSERT INTO usercards (userid, cardid, quantity)
  VALUES ($1, $2, 1)
  ON CONFLICT (userid, cardid)
  DO UPDATE SET quantity = usercards.quantity + 1
`;
  pool
    .query(query, [userid, cardid])
    .then((response) => {
      return res.status(200).json({ status: "card inserted succesfully" });
    })
    .catch((err) => {
      console.log("error inserting card into user", err);
      return res.status(500).json({ error: "internal server error" });
    });
}

module.exports = {
  getAvailablePacks,
  getCardFromPack,
  insertCard,
};
