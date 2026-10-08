const express = require("express");

const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const ConnectionModel = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "about",
  "gender",
  "age",
];

//Get all the pending connection requests for loggedIn User

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    // In DB I want to fetch all my connection requests i got
    // status  => interested
    // The requests received person should be loggedIn before checking
    const loggedInUser = req.user;

    const reviewRequests = await ConnectionModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    if (reviewRequests.length === 0) {
      return res
        .status(200)
        .send({ message: "Empty Requests Found", data: reviewRequests });
    }

    res.json({
      message: "Connection Requests fetched Successfully",
      data: reviewRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//Get the matches of the connection

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const matchedConnections = await ConnectionModel.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = matchedConnections.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    if (!data.length) {
      return res.status(200).json({
        message: "Connection Matches",
        data,
      });
    }

    res.json({
      message: "Connection Matches",
      data,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;

    let limit = parseInt(req.query.limit) || 10;

    limit = limit > 50 ? 50 : limit;

    const skip = limit * (page - 1);

    // Get all the connections (send + received)

    const connections = await ConnectionModel.find({
      $or: [
        {
          fromUserId: loggedInUser._id,
        },
        {
          toUserId: loggedInUser._id,
        },
      ],
    }).select("fromUserId toUserId status");

    const hideUsersFromFeed = new Set();

    connections.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: {
            $nin: Array.from(hideUsersFromFeed),
          },
        },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
module.exports = { userRouter };
