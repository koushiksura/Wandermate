const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const nodemailer = require("nodemailer");

const Places = require("../models/Placeinfo");
const Guides = require("../models/Guide");

function CheckUser(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.usertype == "user") {
      return next();
    } else {
      return res.sendStatus(404);
    }
  }
  res.redirect("/users/login");
}

function IsAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.sendStatus(404);
}

function CheckGuide(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.usertype == "guide") {
      return next();
    } else {
      return res.sendStatus(404);
    }
  }
  res.redirect("/guides/login");
}

router.get("/", function (req, res) {
  Places.find({}, function (err, places) {
    if (err) {
      console.log(err);
    } else {
      Guides.find({}, function (err, guides) {
        if (err) {
          console.log(err);
        } else {
          console.log(places);
          res.render("index", { places: places, guides: guides });
        }
      });
    }
  });
});

router.post("/", IsAuth, urlencodedParser, function (req, res) {
  console.log(req.body);

  let s =
    req.body.message +
    "\r\n" +
    "\r\n" +
    req.body.name +
    "\r\n" +
    req.body.telephone +
    "\r\n" +
    req.body.email;

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "wandermate.help@gmail.com",
      pass: "wandermate123",
    },
  });

  var mailOptions = {
    from: "wandermate.help@gmail.com",
    to: "roshanreddyy@gmail.com, amulya.murukutla@gmail.com",
    subject: req.body.subject,
    text: s,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  res.redirect("/");
});

module.exports = router;
