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

function getPackcards(req, res) {
  const packid = req.params.packid;

  const query = `SELECT * FROM cards WHERE packid = $1 ORDER BY RANDOM() LIMIT 6`;
  pool
    .query(query, [packid])
    .then((response) => {
      res.status(200).json(response.rows);
    })
    .catch((error) => {
      console.error("Error fetching cards:", error);
      res.status(500).json({ error: "Internal server error" });
    });
}

module.exports = {
  getAvailablePacks,
  getPackcards,
};
