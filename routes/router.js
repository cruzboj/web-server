const express = require("express");
const router = express.Router();
const generalController = require("./generalController");
const dbController = require("./dbController.js");
const newsController = require("./newsController");
const packController = require("./packController.js");
const adminController = require("./adminController.js");
const tradeController = require("./tradeController.js");
const upload = require("../NewsUpload.js");

// const db = require('../controllers/dbController');
// router.get('/tasks', db.getTasks);
// router.post('/tasks', db.addTask);
// router.patch('/tasks/:id', db.toggleTask);
// router.delete('/tasks/:id', db.deleteTask);

//General Controller
router.get("/", generalController.helloWorld);
router.get("/test", generalController.test);

//News Controller
router.get("/news", newsController.getNews);
router.post("/news", upload.single("image"), newsController.postNews);

//DB controller
router.get("/db", dbController.getDB);
router.post("/db", dbController.postDB);
router.post("/login", dbController.postLogin);
router.post("/admin/db", dbController.getAllUsers);
router.get("/admin/packs", dbController.getAllPacks);
router.get("/admin/cards/:packid", dbController.getCardsFromPack);
router.post("/admin/createCard", dbController.createCard);
router.post("/admin/createPack", dbController.createPack);
router.delete("/admin/cards/:cardid", dbController.deleteCard);
router.delete("/admin/packs/:packid", dbController.deletePack);
router.get("/users/search", dbController.searchForUser);

//Pack Controller
router.get("/packs", packController.getPacks);
router.get("/cards", packController.getCards);

//Admin Controller
router.get("/adminTickets", adminController.getTickets);
router.patch("/adminTickets", adminController.changeTicketStatus);
router.post("/adminTickets", adminController.postTicket);

//Trade Controller
router.post("/trade/create",tradeController.sendTrade);
router.post("/trade/respond",tradeController.respondTrade);
router.get("/trade/:tradeid/cards",tradeController.getTradeCards);

module.exports = router;
