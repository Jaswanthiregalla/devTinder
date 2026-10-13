const socket = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Chat = require("../models/chat");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      const token = cookies.token;

      if (!token) {
        return next(new Error("Please Login"));
      }

      //Using the same secret as my userAuth middleware
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const user = await User.findOne({ _id: decoded._id });

      if (!user) {
        return next(new Error("User not found"));
      }
      socket.userId = user._id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    // console.log("Authentication UserId:", socket.userId)
    //Checks the loggedIn user - own online status
    const userId = socket.userId.toString();
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set([socket.id]));
    } else {
      onlineUsers.get(userId).add(socket.id);
    }
    //Handle Events
    if (onlineUsers.get(userId).size === 1) {
      io.emit("onlineStatus", {
        statusUserId: userId,
        isOnline: true,
      });
    }

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);

      console.log(firstName + " Joined Room:  " + roomId);
      socket.join(roomId);

      //The target's online status
      socket.emit("onlineStatus", {
        statusUserId: targetUserId.toString(),
        isOnline: onlineUsers.has(targetUserId.toString()),
      });
    });
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, targetUserId, text }) => {
        // Save messages to the Database
        try {
          const userId = socket.userId;

          //Check the both UserId and targetUserId both are friends to make a chat
          const connection = await ConnectionRequest.findOne({
            status: "accepted",
            $or: [
              { fromUserId: userId, toUserId: targetUserId },
              { fromUserId: targetUserId, toUserId: userId },
            ],
          });
          if (!connection) {
            return socket.emit(
              "chatError",
              "You can only chat with your connections",
            );
          }
          const roomId = getSecretRoomId(userId, targetUserId);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({ senderId: userId, text });

          await chat.save();
          const savedMessage = chat.messages[chat.messages.length - 1];
          io.to(roomId).emit("messageReceived", { firstName, lastName, text, createdAt: savedMessage.createdAt});
        } catch (err) {
          console.log(err);
        }
      },
    );

    socket.on("disconnect", () => {
      const userId = socket.userId.toString();

      const sockets = onlineUsers.get(userId);
      if (!sockets) {
        return;
      }
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("onlineStatus", { statusUserId: userId, isOnline: false });
      }
    });
  });
};

module.exports = initializeSocket;
