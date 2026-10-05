const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 30,
      validate(value) {
        if (!validator.isAlpha(value)) {
          throw new Error("First name is not valid " + value);
        }
      },
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password is not strong enough. It should contain at least 8 characters, including uppercase, lowercase, number and symbol.",
          );
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
      validate: {
        validator(value) {
          return Number.isInteger(value);
        },
        message: "Age must be an integer",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is not a valid gender",
      },
    },

    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPfWZVq1NdZGS8yZsi2zktk6uffKEd87nKaU_h8wU9Xg&s",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Photo URL is not valid " + value);
        }
      },
    },
    about: {
      type: String,
      default: "This is about section. You can write about yourself here.",
      trim: true,
      maxLength: 500,
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true },
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "DEV@Tinder315", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;

  const passwordHash = this.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
