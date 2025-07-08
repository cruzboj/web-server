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
        res.status(200).send({message:"Login Successful",isAdmin:user.isadmin});
      } else {
        res.status(401).send("Invalid Login");
      }
    })
    .catch((err) => {
      console.error("DB Error", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

module.exports = {
  getDB,
  postDB,
  postLogin
};
