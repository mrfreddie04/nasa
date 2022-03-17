const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const apiRouter = require("./routes/api");

const app = express();

app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.json());

app.use("/v1", apiRouter);
//app.use("/v2", apiRouter2);

app.get("/*", (req, res) => {
  console.log("index.html")
  res.sendFile(path.join(__dirname,"..","public","index.html"));
})

module.exports = app;