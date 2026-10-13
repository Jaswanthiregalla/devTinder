require("dotenv").config();
require("./utils/cronjob.js");
const express = require("express");
const connectDB = require("./config/database");

const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/authRouter");
const { profileRouter } = require("./routes/profileRouter");
const { requestRouter } = require("./routes/requestRouter");
const { userRouter } = require("./routes/userRouter");
const paymentRouter = require("./routes/paymentRouter.js");
const http = require("http");
const cors = require("cors");
const initializeSocket = require("./utils/socket.js");
const chatRouter = require("./routes/chatRouter.js");

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
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);

initializeSocket(server);

connectDB()
  .then(() => {
    console.log("DB Connected Successfully");
    server.listen(process.env.PORT, () => {
      console.log("Server is running");
    });
  })
  .catch((err) => {
    console.error("DB Connection Failed", err);
  });
