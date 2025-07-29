const { Server } = require("socket.io");
const jwt = require("../JWT");

const userSocketMap = new Map();
const socketUserMap = new Map();

let io;

function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust this in production!
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    let userID;
    socket.on("trade_request", (data) => {
      console.log("Received trade request:", data);
      io.to(data.recipientId).emit("incoming_trade", data);
    });

    socket.on("response_to_trade", (response) => {
      console.log("Trade response:", response);
      // process acceptance / rejection
    });

    socket.on("token", (token) => {
      try {
        userID = jwt.getUserID(token);
        if (!userID) {
          throw new Error("Invalid Token");
        }
        userSocketMap.set(userID, socket.id);
        socketUserMap.set(socket.id, userID);
      } catch (err) {
        console.error("Failed to decode token: ", err.message);
        socket.disconnect;
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      userSocketMap.delete(userID);
    });
  });
}

function sendTradeToUser(p1_id, p2_id, p1_card, p2_card) {
  const socketID = userSocketMap.get(parseInt(p2_id));
  const trade_data = {
    p1_id: p1_id,
    p2_id: p2_id,
    p1_card: p1_card,
    p2_card: p2_card,
  };
  console.log("sent trade request to:", p2_id);
  console.log(userSocketMap);
  console.log(socketID);
  if (socketID) {
    io.to(socketID).emit("trade_offer", trade_data);
  }
}

module.exports = { setupSocket, sendTradeToUser };
