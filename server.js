const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").Server(app);
const dotenv = require("dotenv").config();
const io = require("socket.io")(http);
const mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const Message = mongoose.model("Message", {
  name: String,
  message: String,
});

const dbUrl = process.env.DB_CONNECTION;

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.get("/messages", (req, res) => {
  Message.find({}, (err, messages) => {
    res.send(messages);
  });
});

app.post("/messages", async (req, res) => {
  try {
    const message = new Message(req.body);

    const savedMessage = await message.save();
    console.log("saved");

    const censored = await Message.findOne({ message: "badword" });
    if (censored) await Message.remove({ _id: censored.id });
    else io.emit("message", req.body);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    return console.log("error", error);
  } finally {
    console.log("Message Posted");
  }
});

io.on("connection", () => {
  console.log("a user is connected");
});

mongoose.connect(dbUrl, (err) => {
  console.log("mongodb connected", err);
});

mongoose.connect(dbUrl, { useMongoClient: true }, (err) => {
  console.log("mongodb client connected", err);
});

const server = http.listen(3000, () => {
  console.log("Server is running on port", server.address().port);
});
