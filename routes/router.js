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
router.get("/news", newsController.getNews);//V
router.post("/news",JWT.authenticateAdmin,parser.single("image"),newsController.postNews);//V
router.delete("/news/:id",JWT.authenticateAdmin,newsController.deleteNews);//V

//DB controller
router.post("/db", dbController.Register);//V
router.post("/login", dbController.Login);//V
router.get("/admin/db", JWT.authenticateAdmin,dbController.getAllUsers);//V
router.get("/admin/packs", dbController.getAllPacks);//V
router.get("/admin/cards/:packid", dbController.getCardsFromPack);//V
router.post("/admin/createCard", JWT.authenticateAdmin, dbController.createCard);//V
router.post("/admin/createPack",JWT.authenticateAdmin, dbController.createPack);//V
router.delete("/admin/cards/:cardid", JWT.authenticateAdmin, dbController.deleteCard);//V
router.delete("/admin/packs/:packid", JWT.authenticateAdmin,dbController.deletePack);//V
router.get("/user/search/:username",dbController.searchForUser);//v
router.get("/user/searchID/:userid", JWT.authenticateToken,dbController.getUserFromID)//v
router.get("/cards/search/:cardid",JWT.authenticateToken,dbController.getCardFromID);//v
router.get("/user",JWT.authenticateToken ,dbController.getUserInfo);//v
router.get("/user/cards/:userid",JWT.authenticateToken,dbController.getCardsFromUser);//v
router.patch("/user/cards/remove",JWT.authenticateAdmin,dbController.removeCardFromUser);//v
router.get("/cards",dbController.getAllCards);//v
router.patch("/user",JWT.authenticateToken,dbController.updateUser);//v

//Pack Controller
router.get("/user/packs",packController.getAvailablePacks);//v
router.get("/pack/getPack/:packid",JWT.authenticateToken, packController.getCardFromPack);//X---------------
router.post("/pack/insertCard",JWT.authenticateAdmin,packController.insertCard);//v

//Admin Controller
router.get("/adminTickets", JWT.authenticateAdmin, adminController.getTickets);//v
router.post("/adminTickets", JWT.authenticateToken, adminController.postTicket);//v
router.get("/adminTickets/:ticketid",JWT.authenticateAdmin,adminController.getTicketRequest);//v
router.get("/adminTickets/getUser/:userid",JWT.authenticateToken ,adminController.getUserTickets);
router.patch("/adminTickets",JWT.authenticateAdmin,adminController.updateTicket);//v

//Trade Controller
router.post("/trade/create", JWT.authenticateToken,tradeController.sendTrade);//v
router.post("/trade/accept",JWT.authenticateToken,tradeController.acceptTrade);//v


module.exports = router;
