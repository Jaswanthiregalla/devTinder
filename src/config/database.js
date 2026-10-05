const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://jaswanthiregalla2655_db_user:DI7UmztwwOnnz8qY@namastenode.oj7bubp.mongodb.net/devTinder",
  );
};

module.exports = connectDB;
