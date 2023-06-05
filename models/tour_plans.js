const mongoose = require("mongoose");
const validator = require("validator");

const tp_Schema = new mongoose.Schema({
  guide: {
    type: String,
  },
  name: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  num_of_days: {
    type: Number,
    required: true,
  },
  plans: [
    {
      day: {
        type: String,
        required: true,
        trim: true,
      },
      order: {
        type: Number,
        required: true,
      },
      place: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      start_time: {
        type: String,
        required: true,
      },
      end_time: {
        type: String,
        required: true,
      },
    },
  ],
  images: [
    {
      img: {
        type: String,
      },
    },
  ],
  cost: {
    type: Number,
    required: true,
  },
  dates: {
    type: Array,
    default: void 0,
  },
});

const TP = mongoose.model("TP", tp_Schema);

module.exports = TP;
