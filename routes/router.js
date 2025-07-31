const express = require("express");
const router = express.Router();
const dbController = require("./dbController.js");
const newsController = require("./newsController");
const packController = require("./packController.js");
const adminController = require("./adminController.js");
const tradeController = require("./tradeController.js");
const JWT = require("../JWT.js");
const parser = require("../Cloudinary.js");


//News Controller
router.get("/news", newsController.getNews);
router.post("/news",JWT.authenticateAdmin,parser.single("image"),newsController.postNews);
router.delete("/news/:id",JWT.authenticateAdmin,newsController.deleteNews);

//DB controller
router.post("/db", dbController.Register);
router.post("/login", dbController.Login);
router.get("/admin/db", JWT.authenticateAdmin,dbController.getAllUsers);
router.get("/admin/packs", dbController.getAllPacks);
router.get("/admin/cards/:packid", dbController.getCardsFromPack);
router.post("/admin/createCard", JWT.authenticateAdmin, dbController.createCard);
router.post("/admin/createPack",JWT.authenticateAdmin, dbController.createPack);
router.delete("/admin/cards/:cardid", JWT.authenticateAdmin, dbController.deleteCard);
router.delete("/admin/packs/:packid", JWT.authenticateAdmin,dbController.deletePack);
router.get("/user/search/:username",dbController.searchForUser);
router.get("/user/searchID/:userid", JWT.authenticateToken,dbController.getUserFromID)
router.get("/cards/search/:cardid",JWT.authenticateToken,dbController.getCardFromID);
router.get("/user",JWT.authenticateToken ,dbController.getUserInfo);
router.get("/user/cards/:userid",JWT.authenticateToken,dbController.getCardsFromUser);
router.patch("/user/cards/remove",JWT.authenticateAdmin,dbController.removeCardFromUser);
router.get("/cards",dbController.getAllCards);
router.patch("/user",JWT.authenticateToken,dbController.updateUser);

//Pack Controller
router.get("/user/packs",packController.getAvailablePacks);
router.get("/pack/getPack/:packid",JWT.authenticateToken, packController.getCardFromPack);
router.post("/pack/insertCard",JWT.authenticateAdmin,packController.insertCard);

//Admin Controller
router.get("/adminTickets", JWT.authenticateAdmin, adminController.getTickets);
router.post("/adminTickets", JWT.authenticateToken, adminController.postTicket);
router.get("/adminTickets/:ticketid",JWT.authenticateAdmin,adminController.getTicketRequest);
router.get("/adminTickets/getUser/:userid",JWT.authenticateToken ,adminController.getUserTickets);
router.patch("/adminTickets",JWT.authenticateAdmin,adminController.updateTicket);

//Trade Controller
router.post("/trade/create", JWT.authenticateToken,tradeController.sendTrade);
router.post("/trade/accept",JWT.authenticateToken,tradeController.acceptTrade);


module.exports = router;
