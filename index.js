require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const routerPath = require("./routes/router");
console.log(fs.existsSync(__dirname + "/image/Pack1-Header.png"));
app.use("/image", express.static(__dirname + "/image"));

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api", routerPath);
app.listen(PORT, () => {
  console.log(`Server listen to http://localhost:${PORT}`);
});
// let api = process.env.API_URL;
// let apikey = `&api_key=${process.env.API_KEY}`;

// let query = "&q=brainrot";
// let limit = "&limit=100";

// const Rnum = Math.floor(Math.random() * 100);



app.post("/admin/db", (req, res) => {
  const selectQuery = `SELECT * FROM users ORDER BY id`;

  pool
    .query(selectQuery)
    .then((result) => {
      res.status(200).json(result.rows);
    })
    .catch((error) => {
      console.error("Error retrieving users:", error);
      res.status(500).json({ error: "Database error" });
    });
});
