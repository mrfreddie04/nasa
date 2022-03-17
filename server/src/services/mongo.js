const mongoose  = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect(url=MONGO_URL) {
  db = await mongoose.connect(url);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
  //await mongoose.connection.close();
}

module.exports = {
  mongoConnect,
  mongoDisconnect
}  