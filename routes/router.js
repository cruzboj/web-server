const express = require('express');
const router = express.Router();
const generalController = require("./generalController");
const dbController = require("./dbController.js");
const newsController = require("./newsController");
const packController = require("./packController.js");
const upload = require("../multer");

// const db = require('../controllers/dbController');
// router.get('/tasks', db.getTasks);
// router.post('/tasks', db.addTask);
// router.patch('/tasks/:id', db.toggleTask);
// router.delete('/tasks/:id', db.deleteTask);
router.get("/", generalController.helloWorld);
router.get("/test", generalController.test);

router.get("/news", newsController.getNews);
router.post("/news", upload.single("image"), newsController.postNews);


router.get("/db", dbController.getDB);
router.post("/db", dbController.postDB);
router.post("/login", dbController.postLogin);

router.get("/packs",packController.getPacks);
router.get("/cards",packController.getCards);

module.exports = router;