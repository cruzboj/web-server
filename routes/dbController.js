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

module.exports = {
    getDB,
    postDB
}