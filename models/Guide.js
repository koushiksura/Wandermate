const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true },
  no_of_tourists: Number,
});

const BookingSchema = new mongoose.Schema({
  users: [UserSchema],
  date_n_time: { date: String, slot: String, time: String },
  type: String,
  place: String,
  tot_no_of_tourits: Number,
  current: Boolean,
  plan: String,
  days: Number,
  planid: String,
  rating: Number,
});

const GuideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  myrating: {
    type: Number,
    default: 0,
  },
  usertype: {
    type: String,
    default: "guide",
  },

  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  facebook: {
    type: String,
    required: true,
  },
  instagram: {
    type: String,
    required: true,
  },
  limit: {
    type: Number,
  },
  booking: [BookingSchema],
  languages: {
    type: [{ language: { type: String }, eff: { type: Number } }],
    default: void 0,
  },
  notifications: {
    type: [
      {
        senderid: { type: String },
        typeid: { type: String },
        img: { type: String },
        username: { type: String },
        unread: { type: Boolean, default: false },
      },
    ],
    default: void 0,
  },
  availabledates: {
    type: [
      {
        date: { type: String },
        plantype: { type: String },
        totalbookings: { type: Number, default: 0 },
        location: { type: String, lowercase: true },
        planid: { type: String },
        time: { type: [{ slot: String, timeslot: String, count: Number }] },
      },
    ],
    default: undefined,
  },
  notavailabledates: { type: Array, default: void 0 },
  timeslots: { type: Array, default: void 0 },
  plans: {
    type: [
      {
        plantype: { type: String },
        cost: { type: String },
        location: { type: String, lowercase: true },
        place: { type: String, lowercase: true },
        opentime: { type: String },
        closetime: { type: String },
        slotduration: { type: String },
        img: { type: String },
      },
    ],
    default: undefined,
  },
  testimonials: {
    type: [
      { username: { type: String, lowercase: true }, text: { type: String } },
    ],
  },
  rating: { type: String },
  img: { path: String, contentType: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const Guide = mongoose.model("Guide", GuideSchema);

module.exports = Guide;
