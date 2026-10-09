const express = require("express");

const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionRequest");

const User = require("../models/user");

const sendEmail = require("../utils/sendEmail");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedRequestStatus = ["ignored", "interested"];

      if (!allowedRequestStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type " + status,
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const toUserExists = await User.findOne({ _id: toUserId });

      if (!toUserExists) {
        return res.status(404).send("ERROR: User not found");
      }

      const isConnectionSend = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (isConnectionSend) {
        throw new Error("Connection can't made");
      }

      const data = await connectionRequest.save();

      const emailResponse = await sendEmail.run();

      res.json({
        message: `${req.user.firstName} is ${status} in ${toUserExists.firstName}`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;
      // Validate the status of api
      const allowedReviewStatus = ["accepted", "rejected"];
      if (!allowedReviewStatus.includes(status)) {
        return res.status(400).send("Status is not valid");
      }

      // Jaswanthi -> Lokesh
      // LoggedInUser - Lokesh
      // connection request in db -> check -> status: interested

      const isReviewConnectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!isReviewConnectionRequest) {
        return res.status(404).send("Connection not found");
      }

      isReviewConnectionRequest.status = status;

      const data = await isReviewConnectionRequest.save();
      res.json({
        message: `Connection is ${status}`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR ", +err.message);
    }
  },
);

module.exports = { requestRouter };
