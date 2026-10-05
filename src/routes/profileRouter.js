const express = require("express");

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const { validateProfileData } = require("../utils/validation");

const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.post("/profile/edit", userAuth, async (req, res) => {
  try {
    const isEditProfileDataValidated = validateProfileData(req);

    if (!isEditProfileDataValidated) {
      throw new Error("Profile Can't be Edit");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName} your profile data is successfully updated`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

profileRouter.patch("/profile/changepassword", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new Error("Current Password and New Password must be provided");
    }

    const isCurrentPasswordValid =
      await loggedInUser.validatePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      throw new Error("Current Password is incorrect");
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);

    loggedInUser.password = passwordHash;

    await loggedInUser.save();

    res.send("Password Changed Successfully");
  } catch (err) {
    res.status(400).send("Error " + err.message);
  }
});

module.exports = { profileRouter };
