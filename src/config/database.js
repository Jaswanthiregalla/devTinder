const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://jaswanthiregalla2655_db_user:ACMrv5cRLRVDDz8b@namastenode.oj7bubp.mongodb.net/devTinder",
  );
};

module.exports = connectDB;
