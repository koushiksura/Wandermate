const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const API_Schema = new mongoose.Schema({
  // tokens:[{
  //     token:{
  //         type:String,
  //         required:true
  //     }
  // }],
  token: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  subscription_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  price: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    default: "guide-only",
  },
  plan: {
    type: String,
    default: "monthly",
  },
});

// API_Schema.methods.completeAPI = async function (){
//     const api = this
//     console.log("Entered")
//     const token = jwt.sign({ _id: api._id.toString() }, 'An easy code to crack')
//     console.log(token)
//     api.token = await bcrypt.hash(token.split(".")[0],8)
//     await api.save()
// }

API_Schema.pre("save", async function (next) {
  console.log("+++++++++++++++hello++++++++++++++");
  const api = this;
  const token = jwt.sign({ _id: api._id.toString() }, "An easy code to crack");
  console.log(token.split(".")[0]);
  let api_key = await bcrypt.hash(token, 8);
  console.log(api_key);
  // api.tokens = api.tokens.concat({ token:api_key })
  api.token = api_key;
  console.log(api);
  next();
});

API_Schema.statics.checkAPI = async function (api) {
  const api_key = await API.findOne({ token: api });
  if (!api_key) {
    return { result: false };
  } else {
    if (api_key.expiry > Date.now) {
      isexpired = true;
    } else {
      isexpired = false;
    }
    return { result: true, isexpired };
  }
};

const API = mongoose.model("API", API_Schema);

module.exports = API;
