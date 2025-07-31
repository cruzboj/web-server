const pool = require("../pool");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your secret";
const TOKEN_EXPIRATION = "365d";

function getDB(req, res) {
  //To delete
  pool
    .query("select * from packtest;")
    .then((response) => {
      res.status(200).send(response.rows);
    })
    .catch((error) => {
      res.status(500).send("DB Error " + error);
    });
}

async function Register(req, res) {
  //Register
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const usernameCheck = await pool.query(
    "select * from users where username = $1",
    [username]
  );
  const emailCheck = await pool.query("select * from users where email = $1", [
    email,
  ]);
  if (usernameCheck.rows.length !== 0 || emailCheck.rows.length !== 0) {
    return res
      .status(401)
      .json({ error: "Username or Email are already taken" });
  }

  const insertQuery = `
	INSERT INTO users (username, password, email)
	VALUES ($1, $2, $3)
	RETURNING *;
  `;

  pool
    .query(insertQuery, [username, password, email])
    .then((response) => {
      res.status(201).json({ status: "Account Created Succesfully" });
    })
    .catch((err) => {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

function Login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      error: "Missing fields",
    });
  }

  const searchQuery = `
	SELECT id,username, password, isadmin from users where username = $1`;

  pool
    .query(searchQuery, [username])
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(401).send("Invalid Login");
      }
      const user = result.rows[0];
      if (user.password === password) {
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            isAdmin: user.isadmin,
          },
          SECRET_KEY,
          { expiresIn: TOKEN_EXPIRATION }
        );
        res.status(200).send({
          message: "Login Successful",
          isAdmin: user.isadmin,
          token: token,
        });
      } else {
        res.status(401).send("Invalid Login");
      }
    })
    .catch((err) => {
      console.error("DB Error", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

function getUserInfo(req, res) {
  //Get user info for login
  const userID = req.user.id;
  const query =
    "SELECT id, username, isadmin, coins, email, password FROM users WHERE id = $1";
  pool.query(query, [userID]).then((response) => {
    if (response.rows.length === 0) {
      return res.status(404).send("User Not found");
    }
    return res.status(200).send(response.rows[0]);
  });
}

function getAllUsers(req, res) {
  //Get all users info
  query = `select * from users order by id asc`;

  pool
    .query(query)
    .then((response) => {
      if (response.rows.length === 0) {
        res.status(503).send("No matches");
      }
      res.status(200).send(response.rows);
    })
    .catch((err) => {
      console.log("error getting all user data", err);
      return res.status(500).json({ error: "Internal Server Error" });
    });
}

function getAllPacks(req, res) {
  query = "select * from packs order by packid asc";

  pool
    .query(query)
    .then((response) => {
      if (response.rows.length === 0) {
        res.status(503).send("No matches");
      }
      res.status(200).send(response.rows);
    })
    .catch((err) => {
      console.log("error fetching all packs", err);
      return res.status(500).json({ error: "Internal Server Error" });
    });
}

async function getCardsFromPack(req, res) {
  packid = req.params.packid;
  const packCheck = await pool.query("select * from packs where packid=$1", [
    packid,
  ]);
  if (packCheck.rows.length === 0) {
    return res.status(504).json({ error: "Pack Not Found" });
  }
  query = "select * from cards where packid = $1 order by id asc";
  pool.query(query, [packid]).then((response) => {
    if (response.rows.length === 0) {
      return res.status(404).send(`No cards for this pack`);
    }
    return res.status(200).send(response.rows);
  });
}

function createPack(req, res) {
  //Create a pack
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
      res.status(500).json({ error: "Internal Server Error" });
    });
}

async function createCard(req, res) {
  query =
    "insert into cards (name,image_url,color_id,packid) values ($1,$2,$3,$4)";

  const name = req.body.name;
  const image_url = req.body.image_url;
  const color_id = req.body.color_id;
  const packid = req.body.packid;

  const packCheck = await pool.query("select * from packs where packid=$1", [
    packid,
  ]);

  if (!name || !image_url || !color_id || !packid) {
    return res.status(403).json({ error: "Missing parameters" });
  }
  if (color_id > 2 || color_id < 1) {
    return res.status(403).json({ error: "Invalid Card Color" });
  }
  if (packCheck.rows.length === 0) {
    return res.status(404).json({ error: "Pack not found" });
  }

  pool
    .query(query, [name, image_url, color_id, packid])
    .then((response) => {
      res.status(201).send("Card Created");
    })
    .catch((error) => {
      console.log(`error creating card:`, error);
      return res.status(500).json({ error: "Internal Server Error" });
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

function searchForUser(req, res) {
  const query = "select * from users where username = $1";
  const username = req.params.username;
  pool
    .query(query, [username])
    .then((response) => {
      if (response.rows.length === 0) {
        return res.status(404).json({ error: "user not found" });
      }
      return res.status(200).json(response.rows[0].id);
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "unkown error" });
    });
}

function getUserFromID(req, res) {
  const userID = req.params.userid;
  const query = "select * from users where id = $1";
  pool
    .query(query, [userID])
    .then((response) => {
      if (response.rows.length === 0) {
        return res.status(404).json({ error: "userID not found" });
      }
      return res.status(200).json(response.rows[0].username);
    })
    .catch((err) => {
      console.log("error getting user from id: ", err);
      return res.status(500).json({ error: "error getting user from id" });
    });
}

function getCardFromID(req, res) {
  const cardID = req.params.cardid;
  const query = "select * from cards where id = $1";
  pool
    .query(query, [cardID])
    .then((response) => {
      if (response.rows.length === 0) {
        return res.status(404).json({ error: "userID not found" });
      }
      return res.status(200).json(response.rows[0]);
    })
    .catch((err) => {
      console.log("error getting card from id: ", err);
      return res.status(500).json({ error: "error getting card from cardID" });
    });
}

function getCardsFromUser(req, res) {
  const userID = req.params.userid;
  const query =
    "select usercards.cardid,usercards.quantity,cards.name,cards.image_url,cards.color_id,cards.packid from usercards inner join cards on usercards.cardid = cards.id  where userid = $1";
  pool
    .query(query, [userID])
    .then((response) => {
      return res.status(200).json(response.rows);
    })
    .catch((err) => {
      console.log("getCardsFromUser", err);
      return res.status(500).json({ error: "error getting user data" });
    });
}

async function removeCardFromUser(req, res) {
  const userid = req.body.userid;
  const cardid = req.body.cardid;

  const client = await pool.connect(); // pg syntax

  try {
    await client.query("BEGIN");

    // First, try to delete the row if quantity = 1
    await client.query(
      "DELETE FROM usercards WHERE userid = $1 AND cardid = $2 AND quantity = 1",
      [userid, cardid]
    );

    // If quantity > 1, decrement it
    await client.query(
      "UPDATE usercards SET quantity = quantity - 1 WHERE userid = $1 AND cardid = $2 AND quantity > 1",
      [userid, cardid]
    );

    await client.query("COMMIT");
    res.status(200).json({ status: "Card updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to decrement card quantity:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}

function getAllCards(req, res) {
  const query = "select * from cards";
  pool.query(query).then((response) => {
    res.status(200).json(response.rows);
  });
}

async function updateUser(req, res) {
  const { username, password, email, id } = req.body;

  if (!username || !password || !email || !id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if username is already taken by another user
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND id <> $2",
      [username, id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    await pool.query(
      "UPDATE users SET username = $1, password = $2, email = $3 WHERE id = $4",
      [username, password, email, id]
    );

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getDB,
  Register,
  Login,
  getAllUsers,
  getAllPacks,
  getCardsFromPack,
  createPack,
  createCard,
  deleteCard,
  deletePack,
  searchForUser,
  getUserInfo,
  getCardsFromUser,
  getCardFromID,
  getUserFromID,
  removeCardFromUser,
  getAllCards,
  updateUser,
};
