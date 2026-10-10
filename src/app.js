require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");

const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/authRouter");
const { profileRouter } = require("./routes/profileRouter");
const { requestRouter } = require("./routes/requestRouter");
const { userRouter } = require("./routes/userRouter");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
  .then(() => {
    console.log("DB Connected Successfully");
    app.listen(process.env.PORT, () => {
      console.log("Server is running");
    });
  })
  .catch((err) => {
    console.error("DB Connection Failed", err);
  });
