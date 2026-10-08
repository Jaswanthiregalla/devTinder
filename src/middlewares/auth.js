const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Add the token to cookie
    const cookies = req.cookies;

    const { token } = cookies;

    if (!token) {
     return res.status(401).send("Please Login!");
    }

    // Validate the cookie

    const decodedMessage = jwt.verify(token, "DEV@Tinder315");

    const { _id } = decodedMessage;

    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User doesn't exists");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
