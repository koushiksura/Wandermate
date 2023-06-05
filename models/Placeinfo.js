const mongoose = require("mongoose");

let placesSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  bgimgs: {
    type: Array,
    default: void 0,
  },
  about: {
    type: String,
    required: true,
  },
  history: {
    type: String,
    required: true,
  },
  thingstodo: {
    type: [
      {
        img: { type: String },
        title: { type: String },
        description: { type: String },
      },
    ],
    default: undefined,
  },
  spots: {
    type: [
      {
        img: { type: String },
        name: { type: String, lowercase: true },
        description: { type: String },
      },
    ],
    default: undefined,
  },
});

let Placeinfo = mongoose.model("Placeinfo", placesSchema, "placeinfo");
module.exports = Placeinfo;
