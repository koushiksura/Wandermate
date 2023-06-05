const mongoose = require("mongoose");

const chatdataschema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
  },
  guidename: {
    type: String,
    required: true,
    lowercase: true,
  },
  messages: {
    type: [
      {
        text: { type: String },
        sentby: { type: String },
        time: { type: String },
      },
    ],
  },
});

const Chatingdata = mongoose.model(
  "Chatingdata",
  chatdataschema,
  "chatingdata"
);
module.exports = Chatingdata;
