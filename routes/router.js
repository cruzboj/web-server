const express = require("express");
const router = express.Router();
const generalController = require("./generalController");
const dbController = require("./dbController.js");
const newsController = require("./newsController");
const packController = require("./packController.js");
const adminController = require("./adminController.js");
const tradeController = require("./tradeController.js");
const upload = require("../NewsUpload.js");
const JWT = require("../JWT.js");

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
router.post(
  "/news",
  JWT.authenticateAdmin,
  upload.single("image"),
  newsController.postNews
);

//DB controller
router.get("/db", dbController.getDB);
router.post("/db", dbController.Register);
router.post("/login", dbController.Login);
router.post("/admin/db", dbController.getAllUsers);
router.get("/admin/packs", dbController.getAllPacks);
router.get("/admin/cards/:packid", dbController.getCardsFromPack);
router.post("/admin/createCard", JWT.authenticateToken, dbController.createCard);
router.post("/admin/createPack", dbController.createPack);
router.delete("/admin/cards/:cardid", dbController.deleteCard);
router.delete("/admin/packs/:packid", dbController.deletePack);
router.get("/users/search", dbController.searchForUser);
router.get("/user",JWT.authenticateToken,dbController.getUserInfo);

//Pack Controller
// router.get("/packs", packController.getPacks);
// router.get("/cards", packController.getCards);
router.get("/user/getPacks",packController.getAvailablePacks);
// router.get("/user/:packsid",);

//Admin Controller
router.get("/adminTickets", JWT.authenticateAdmin, adminController.getTickets);
router.patch("/adminTickets", JWT.authenticateAdmin, adminController.changeTicketStatus);
router.post("/adminTickets", JWT.authenticateAdmin, adminController.postTicket);

//Trade Controller
router.post("/trade/create", JWT.authenticateToken,tradeController.sendTrade);
router.post("/trade/respond", JWT.authenticateToken,tradeController.respondTrade);
router.get("/trade/:tradeid/cards", JWT.authenticateToken,tradeController.getTradeCards);


module.exports = router;
