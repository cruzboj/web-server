const pool = require("../pool");
const socketTrade = require("../sockets/socketHandler");

function searchUser(username) {
  const query = "select * from users where username = $1";
  return pool.query(query, [username]);
}

// function sendTrade(req, res) {
//   const fromUser = req.body.fromUser;
//   const toUserName = req.body.toUser;
//   searchUser(toUserName).then((response) => {
//     if (response.rows.length === 0) {
//       return res.status(404).json({ error: `User ${toUserName} not found` });
//     }
//     const toUser = response.rows[0].id;
//     query =
//       "insert into trades (player1_id,player2_id,status) values ($1,$2,'pending')";
//     pool
//       .query(query, [fromUser, toUser])
//       .then((response) => {
//         return res.status(200).json({ status: "trade created" });
//       })
//       .catch((error) => {
//         console.log(error);
//         return res.status(500).json({ error: "error creating trade" });
//       });
//   });
// }

function sendTrade(req, res) {
  const user1_id = req.body.user1_id;
  const user2_id = req.body.user2_id;
  const user1_card = req.body.user1_card;
  const user2_card = req.body.user2_card;

  socketTrade.sendTradeToUser(user1_id, user2_id, user1_card, user2_card);

  res.status(200).json({"status":"Trade Sent"})
}

async function acceptTrade(req, res) {
  const user1_id = req.body.user1_id;
  const user2_id = req.body.user2_id;
  const user1_card = req.body.user1_card;
  const user2_card = req.body.user2_card;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Give user1 the card from user2
    await client.query(
      `INSERT INTO usercards (userid, cardid, quantity)
       VALUES ($1, $2, 1)
       ON CONFLICT (userid, cardid)
       DO UPDATE SET quantity = usercards.quantity + 1;`,
      [user1_id, user2_card]
    );

    // Give user2 the card from user1
    await client.query(
      `INSERT INTO usercards (userid, cardid, quantity)
       VALUES ($1, $2, 1)
       ON CONFLICT (userid, cardid)
       DO UPDATE SET quantity = usercards.quantity + 1;`,
      [user2_id, user1_card]
    );

    await client.query("COMMIT");
    socketTrade.sendTradeConfirmation(user1_id);
    res.status(200).json({ status: "Trade Successful" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error accepting trade:", error);
    res.status(500).json({ error: "Error trading" });
  } finally {
    client.release();
  }
  // const query =   `BEGIN;
  //                 INSERT INTO usercards (userid, cardid, quantity)
  //                 VALUES ($1, $2, 1)
  //                 ON CONFLICT (userid, cardid)
  //                 DO UPDATE SET quantity = usercards.quantity + 1;
  //                 INSERT INTO usercards (userid, cardid, quantity)
  //                 VALUES ($3, $4, 1)
  //                 ON CONFLICT (userid, cardid)
  //                 DO UPDATE SET quantity = usercards.quantity + 1;
  //                 COMMIT;
  //                 `;

  // pool.query(query,[user1_id,user2_card,user2_id,user1_card])
  // .then((response) => {
  //   return res.status(200).json({"status":"Trade Successful"})
  // })
  // .catch((error) => {
  //   console.log("error accepting trade", error);
  //   return res.status(500).json({"error":"error trading"});
  // })
}

function respondTrade(req, res) {
  const status = req.body.status;
  const tradeId = req.body.tradeId;

  if (status != "accepted" && status != "declined") {
    return res.status(500).json({ error: "invalid trade" });
  }
  pool
    .query("select * from trades where tradeid = $1", [tradeId])
    .then((response) => {
      if (response.rows.length === 0) {
        return res.status(404).json({ error: "trade not found" });
      }
      const query = "update trades set status = $1 where tradeid = $2";
      pool
        .query(query, [status, tradeId])
        .then((innerResponse) => {
          return res
            .status(200)
            .json({ status: `trade status changed to ${status}` });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: "internal server error" });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "internal server error" });
    });
}

function getTradeCards(req, res) {
  const tradeID = req.params.tradeid;
  const tradeQuery = "select * from trades where tradeID = $1";
  pool.query(tradeQuery, [tradeID]).then((response) => {
    if (response.rows.length === 0) {
      return res.status(404).json({ error: "trade not found" });
    }
    const player1_id = response.rows[0].player1_id;
    const player2_id = response.rows[0].player2_id;
    const playerQuery = `SELECT
                uc.userid,
                u.username,
                c.id,
                c.name,
                uc.quantity
                FROM usercards uc
                JOIN cards c ON uc.cardid = c.id
                JOIN users u ON uc.userid = u.id
                WHERE uc.userid = $1 OR uc.userid = $2
                ORDER BY uc.userid, c.name;`;
    pool
      .query(playerQuery, [player1_id, player2_id])
      .then((response) => {
        if (response.rows.length === 0) {
          return res.status(404).json({ error: "cards unavailable" });
        }
        res.status(200).json(response.rows);
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ error: "internal server error" });
      });
  });
}

module.exports = {
  sendTrade,
  respondTrade,
  getTradeCards,
  acceptTrade,
};
