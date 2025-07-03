const express = require('express');
const router = express.Router();
const api = require("./api");
const upload = require("../multer");

// const db = require('../controllers/dbController');
// router.get('/tasks', db.getTasks);
// router.post('/tasks', db.addTask);
// router.patch('/tasks/:id', db.toggleTask);
// router.delete('/tasks/:id', db.deleteTask);

router.get("/news", api.getNews);
router.get("/", api.helloWorld);
router.get("/test", api.test);
router.get("/db", api.getDB);

router.post("/db", api.postDB);
router.post("/news", upload.single("image"), api.postNews);

module.exports = router;