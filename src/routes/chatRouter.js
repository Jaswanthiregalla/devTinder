const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.params;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate(({path: "messages.senderId", select: "firstName lastName"}));

    if (!chat) {
      return res.json([]);
    }

    res.json(chat)
  } catch (err) {
    console.log(err);
  }
});
module.exports = chatRouter;
