require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
// const { Pool } = require("pg");
// const multer = require("multer");
const routerPath = require("./routes/router");
console.log(fs.existsSync(__dirname + "/image/Pack1-Header.png"));


// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false, // required for Neon SSL
//   },
// });

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

let api = process.env.API_URL;
let apikey = `&api_key=${process.env.API_KEY}`;

let query = "&q=brainrot";
let limit = "&limit=100";

const Rnum = Math.floor(Math.random() * 100);

// app.use("/image", express.static(__dirname + "/image"));

// const newsStorage = multer.diskStorage({
//   destination: "./image/news",
//   filename: (req, file, cb) => {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage: newsStorage });
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.get("/test", (req, res) => {
//   res.json({ message: "Test!" });
// });


app.use("/api", routerPath);
// app.get("/news", (req, res) => {
//   pool.query(`
//     select * from news
//     `).then(response => {
//       res.status(200).json(response.rows);
//     })
//     .catch(err => {console.error(err)
//       res.status(500).send("DB Error");
//     })
// const filePath = path.join(__dirname, "data", "news.json");
// fs.readFile(filePath, "utf8", (err, data) => {
//   if (err) {
//     console.error("Error reading file:", err);
//     return res.status(500).send("News not found");
//   }

//   try {
//     const news = JSON.parse(data);
//     res.status(200).json(news);
//   } catch (parseError) {
//     console.error("Invalid JSON:", parseError);
//     res.status(500).send("Invalid JSON format");
//   }
// });
// });



// app.post("/news", upload.single("image"), (req, res) => {
//   const { title, description, color } = req.body;
//   const imgPath = "/image/news/" + req.file.filename;

//   pool
//     .query(
//       `
//     INSERT INTO news (title,description,img_path,color) values ($1,$2,$3,$4)`,
//       [title, description, imgPath, color]
//     )
//     .then(() => {
//       res.status(200).send("News added!");
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Error Inserting");
//     });
// });

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

app.get("/packs", (req, res) => {
  res.json(packsData);
});

app.get("/cards", (req, res) => {
  const cardsData = req.query.q;
  if (!cardsData) {
    return res.status(400).send("Missing query");
  }
  const url = `${api}${apikey}&q=${cardsData}&limit=100`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data.data || data.data.length === 0) {
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
});

app.listen(PORT, () => {
  console.log(`Server listen to http://localhost:${PORT}`);
});

// app.get("/db", (req, res) => {
//   pool
//     .query("select * from packtest;")
//     .then((response) => {
//       res.status(200).send(response.rows);
//     })
//     .catch((error) => {
//       res.status(500).send("DB Error " + error);
//     });
// });

// app.post("/db", (req, res) => {
//   const { username, password, email } = req.body;

//   if (!username || !password || !email) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   const insertQuery = `
//     INSERT INTO users (username, password, email)
//     VALUES ($1, $2, $3)
//     RETURNING *;
//   `;

//   pool
//     .query(insertQuery, [username, password, email])
//     .then((response) => {
//       res.status(201).json(response.rows[0]);
//     })
//     .catch((err) => {
//       console.error("Insert error:", err);
//       res.status(500).json({ error: "Insert failed", details: err });
//     });
// });

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({
        error: "Missing fields",
        fields: `username: ${username} password: ${password}`,
      });
  }
  const searchQuery = `
    SELECT username, password from users where username = $1`;

  pool
    .query(searchQuery, [username])
    .then((result) => {
      if (result.rows.length === 0) {
        res.status(401).send("Invalid Login");
      }
      const user = result.rows[0];
      if (user.password === password) {
        res.status(200).send("Login Successful");
      } else {
        res.status(401).send("Invalid Login");
      }
    })
    .catch((err) => {
      console.error("DB Error", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

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