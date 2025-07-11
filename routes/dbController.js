const pool = require("../pool");

function getDB(req, res) {
  pool
    .query("select * from packtest;")
    .then((response) => {
      res.status(200).send(response.rows);
    })
    .catch((error) => {
      res.status(500).send("DB Error " + error);
    });
}

function postDB(req, res) {
  console.log(req.body);
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const insertQuery = `
    INSERT INTO users (username, password, email)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  pool
    .query(insertQuery, [username, password, email])
    .then((response) => {
      res.status(201).json(response.rows[0]);
    })
    .catch((err) => {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Insert failed", details: err });
    });
}

function postLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: "Missing fields",
      fields: `username: ${username} password: ${password}`,
    });
  }
  const searchQuery = `
    SELECT username, password, isadmin from users where username = $1`;

  pool
    .query(searchQuery, [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(401).send("Invalid Login");
      }
      const user = result.rows[0];
      if (user.password === password) {
        res
          .status(200)
          .send({ message: "Login Successful", isAdmin: user.isadmin });
      } else {
        res.status(401).send("Invalid Login");
      }
    })
    .catch((err) => {
      console.error("DB Error", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

function getAllUsers(req, res) {
  query = `select * from users order by id asc`;

  pool.query(query).then((response) => {
    if (response.rows.length === 0) {
      res.status(503).send("No matches");
    }
    res.status(200).send(response.rows);
  });
}

function getAllPacks(req, res) {
  query = "select * from packs order by packid asc";

  pool.query(query).then((response) => {
    if (response.rows.length === 0) {
      res.status(503).send("No matches");
    }
    res.status(200).send(response.rows);
  });
}

function getCardsFromPack(req, res) {
  query = "select * from cards  where packid = $1 order by id asc";
  packid = req.params.packid;
  console.log(packid);
  pool.query(query, [packid]).then((response) => {
    if (response.rows.length === 0) {
      return res.status(401).send(`No cards for ${packid}`);
    }
    return res.status(200).send(response.rows);
  });
}

function createPack(req, res) {
  query = "insert into packs (name,cost) values ($1,$2)";

  const packname = req.body.name;
  const cost = req.body.cost;

  pool
    .query(query, [packname, cost])
    .then((response) => {
      res.status(201).json({ response: "Pack Created" });
    })
    .catch((error) => {
      console.log(`error creating card:`, error);
      res.status(503).json({ error: "ERROR: " + error });
    });
}

function createCard(req, res) {
  query =
    "insert into cards (name,image_url,color_id,packid) values ($1,$2,$3,$4)";

  const name = req.body.name;
  const image_url = req.body.image_url;
  const color_id = req.body.color_id;
  const packid = req.body.packid;

  pool
    .query(query, [name, image_url, color_id, packid])
    .then((response) => {
      res.status(201).send("Card Created");
    })
    .catch((error) => {
      console.log(`error creating card:`, error);
    });
}

function deleteCard(req, res) {
  const query = "delete from cards where id = $1";
  const cardID = req.params.cardid;
  pool.query("select * from cards where id = $1", [cardID]).then((response) => {
    console.log(response.rows);
    if (response.rows.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }
    pool
      .query(query, [cardID])
      .then((response) => {
        res.status(200).json({ status: "Card deleted" });
      })
      .catch((error) => {
        res.status(500).send({ error: `Internal server error, ${error}` });
      });
  });
}

function deletePack(req, res) {
  const query = "delete from packs where packid = $1";
  const packID = req.params.packid;
  pool
    .query("select * from packs where packid = $1", [packID])
    .then((response) => {
      console.log(response.rows);
      if (response.rows.length === 0) {
        return res.status(404).json({ error: "Pack not found" });
      }
      pool
        .query(query, [packID])
        .then((response) => {
          res.status(200).json({ status: "Pack deleted" });
        })
        .catch((error) => {
          res.status(500).send({ error: `Internal server error, ${error}` });
        });
    });
}

function searchForUser(req,res){
  const query = "select * from users where username = $1";
  const username = req.query.username;
  pool.query(query,[username])
  .then((response) => {
    if (response.rows.length === 0){
      return res.status(404).json({"error":"user not found"});
    }
    return res.status(200).json(response.rows[0].id);
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({"error":"unkown error"});
  })
}

module.exports = {
  getDB,
  postDB,
  postLogin,
  getAllUsers,
  getAllPacks,
  getCardsFromPack,
  createPack,
  createCard,
  deleteCard,
  deletePack,
  searchForUser
};
