const pool = require("../pool");
const socketTrade = require("../sockets/socketHandler");

function sendTrade(req, res) {
  const user1_id = req.body.user1_id;
  const user2_id = req.body.user2_id;
  const user1_card = req.body.user1_card;
  const user2_card = req.body.user2_card;

  if (!user1_id || !user1_card || !user2_card || !user2_id){
    return res.status(401).json({"error":"missing parameters"})
  }
  socketTrade.sendTradeToUser(user1_id, user2_id, user1_card, user2_card);

  return res.status(200).json({ status: "Trade Sent" });
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
}

module.exports = {
  sendTrade,
  acceptTrade,
};
