const express = require("express");
const { check, validationResult } = require("express-validator");
// const session = require('express-session');
const router = express.Router();
const bodyparser = require("body-parser");
var fs = require("fs");
var multer = require("multer");
const bcrypt = require("bcryptjs");
var passport = require("passport");
var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var urlencodedparser = bodyparser.urlencoded({ extended: false });
const User = require("../models/User");
const recommend = require("collaborative-filter");
const Guide = require("../models/Guide");
let Placeinfo = require("../models/Placeinfo");
let Tour_plans = require("../models/tour_plans");
let WishList = require("../models/WishList");
bodyParser = require("body-parser").json();
router.get("/login", (req, res) => res.render("guidelogin"));
router.get("/signup", (req, res) => res.render("usersignup", { errors: [] }));
const validatePhoneNumber = require("validate-phone-number-node-js");

function CheckUser(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("here");
    console.log("loged");
    console.log(req.user);
    if (req.user.usertype == "user") {
      console.log("logging");
      return next();
    } else if (req.user.usertype == "admin") {
      return res.redirect("/admin/cities");
    } else {
      return res.sendStatus(404);
    }
  }
  res.redirect("/users/login");
}

function IsAuth(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect("/users/dashboard");
}

router.post(
  "/signup",
  urlencodedparser,
  [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("username").not().isEmpty().withMessage("Username is required"),
    check("password").not().isEmpty().withMessage("password is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Please enter a password at least 6 character."),
    check("password")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
      .withMessage(
        "Passwordmust contain one uppercase letter one lower case letter and one special character  "
      ),
    check("password1")
      .not()
      .equals("password")
      .withMessage("Passwords do not match"),
    check("phone_number")
      .not()
      .isEmpty()
      .withMessage("phone number is required"),
    check("city").not().isEmpty().withMessage("city is required"),
    check("state").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required"),
    check("email").isEmail().withMessage("Enter valid email"),
  ],
  (req, res) => {
    console.log(req.body);
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    const password1 = req.body.password1;
    const email = req.body.email;
    const phone_number = req.body.phone_number;
    const city = req.body.city;
    const state = req.body.state;
    const result = validatePhoneNumber.validate(phone_number);

    let errors = validationResult(req);
    if (result === false) {
      error = {
        param: "phone number",
        msg: "enter a valid phone number",
        value: phone_number,
      };
      errors.errors.push(error);
    }

    User.findOne({ username: username }).then(function (user) {
      error = {
        param: "username",
        msg: "User already exist",
        value: username,
      };
      errors.errors.push(error);
      // res.render('signup.ejs',{
      //   errors:errors,
      //   username:username,
      //   name:name,
      //   city:city,
      //   state:state,
      //   email:email,
      //   phone_number:phone_number
      //
      // })
    });

    if (errors.errors.length > 0) {
      console.log("im here");
      return res.render("register.ejs", {
        errors: errors,
      });
    } else {
      let newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        phone_number: phone_number,
        city: city,
        state: state,
        booking: new Array(),
      });

      let userlist = new WishList({
        username: name,
        boards: [],
      });

      console.log(req.files);
      if (req.files[0]) {
        var k = fs.readFileSync(req.files[0].path);
        newUser.img.path = "/uploads/" + req.files[0].filename;
        newUser.img.contentType = "image/png";
      } else {
        newUser.img.path = "/uploads/suriya1.jpg1573825247106.jpeg";
        newUser.img.contentType = "image/png";
      }
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          newUser.password = hash;
          console.log("created");
          newUser
            .save()
            .then(function (user) {
              return res.redirect("./login");
            })
            .catch((err) => console.log(err));
        })
      );

      return res.redirect("/users/login");
    }
  }
);

router.post("/login", IsAuth, (req, res, next) => {
  passport.authenticate("local1", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

router.post("/dashboard", CheckUser, (req, res) => {
  var cityNames = req.body.city;
  var cityName = cityNames.split(",")[0];
  res.redirect("/places/" + cityName);
});

router.get("/dashboard", CheckUser, async (req, res) => {
  const user_bookings = await User.find({ _id: req.user._id });
  const bookings = [];
  console.log(user_bookings);
  // console.log(user_bookings[0].booking)
  for (let i = 0; i < user_bookings[0].booking.length; i++) {
    if (user_bookings[0].booking[i].current === true) {
      bookings.push(user_bookings[0].booking[i]);
    }
  }
  // console.log(bookings)
  Guide.find({}, function (err, guides) {
    if (err) {
      console.log(err);
    } else {
      Placeinfo.find({}, function (err, places) {
        if (err) {
          console.log(err);
        } else {
          Tour_plans.find({}, function (err, plans) {
            if (err) {
              console.log(err);
            } else {
              res.render("landing-page", {
                bookings: bookings,
                user: req.user,
                guides: guides,
                places: places,
                plans: plans,
                layout: "layout1",
              });
              // console.log(req.user)
            }
          });
        }
      });
    }
  });
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
router.get("/forgot", function (req, res) {
  console.log(req.user);
  res.render("forgot", {
    user: req.user,
  });
});
router.post("/forgot", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ username: req.body.username }, function (err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("./forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true, // use SSL
          auth: {
            user: "koushiks666@gmail.com",
            pass: "Narayanaetechno@1",
          },
        });

        var mailOptions = {
          to: user.email,
          from: "koushiks666@gmail.com",
          subject: "Node.js Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/users/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash(
            "info",
            "An e-mail has been sent to " +
              user.email +
              " with further instructions."
          );
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("login");
    }
  );
});
router.get("/reset/:token", function (req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("./forgot");
      }
      res.render("reset", {
        user: req.user,
      });
    }
  );
});

router.post(
  "/reset/:token",
  urlencodedparser,
  [
    check("password").not().isEmpty().withMessage("password is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Please enter a password at least 6 character."),
    check("password")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
      .withMessage(
        "Passwordmust contain one uppercase letter one lower case letter and one special character  "
      ),
    check("password1")
      .not()
      .equals("password")
      .withMessage("Passwords do not match"),
  ],
  function (req, res) {
    let errors = validationResult(req);
    if (errors.errors.lenght > 0) {
      console.log("im here");
      res.render("reset", {
        errors: errors,
      });
    } else {
      console.log(req.body);
      async.waterfall(
        [
          function (done) {
            User.findOne(
              {
                resetPasswordToken: req.params.token,
                resetPasswordExpires: { $gt: Date.now() },
              },
              function (err, user) {
                if (!user) {
                  req.flash(
                    "error",
                    "Password reset token is invalid or has expired."
                  );
                  console.log(
                    "Password reset token is invalid or has expired."
                  );
                  return res.redirect("./forgot");
                }

                bcrypt.genSalt(10, (err, salt) =>
                  bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) {
                      console.log(err);
                    }
                    console.log(user.password);
                    user.password = hash;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    console.log(user.password);
                    console.log("created");
                    user.save(function (err) {
                      req.logIn(user, function (err) {
                        console.log("done");
                        done(err, user);
                      });
                    });
                  })
                );
              }
            );
          },
          function (user, done) {
            console.log("mail");
            var smtpTransport = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true, // use SSL
              auth: {
                user: "koushiks666@gmail.com",
                pass: "Narayanaetechno@1",
              },
            });
            var mailOptions = {
              to: user.email,
              from: "koushiks666@gmail.com",
              subject: "Your password has been changed",
              text:
                "Hello,\n\n" +
                "This is a confirmation that the password for your account " +
                user.email +
                " has just been changed.\n",
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              req.flash("success", "Success! Your password has been changed.");
              done(err);
            });
          },
        ],
        function (err) {
          console.log("im1");
          res.redirect("../login");
        }
      );
    }
  }
);

router.post("/noti", CheckUser, async (req, res) => {
  console.log("hey there");
  console.log(req.body.notiid);
  var test = [];
  await User.updateOne(
    { _id: req.user._id, "notifications._id": req.body.notiid },
    {
      $set: { "notifications.$.unread": false },
    }
  )
    .then((x) => console.log("updated"))
    .catch((x) => console.log(x));

  res.send("");
});
router.post("/testimonial/", urlencodedparser, function (req, res) {
  console.log(req.body);
  Guide.updateOne(
    { username: req.body.guidename },
    {
      $push: {
        testimonials: { username: req.body.username, text: req.body.text },
      },
    },
    function (err) {
      console.log(err);
    }
  );
  res.redirect("/users/dashboard");
});

router.get("/", CheckUser, async (req, res) => {
  var datetime = new Date();
  date = datetime.toISOString().slice(0, 10);
  date1 = date.split("-");
  console.log(date1);
  var date2 = date1[0] + "/" + date1[1] + "/" + date1[2];
  var user = req.user;
  User.findOne({ username: req.user.username }).then((myuser) => {
    for (var i = 0; i < myuser.booking.length; i++) {
      d2 = new Date();
      console.log(i);
      if (myuser.booking[i].current == true) {
        console.log("camehere");
        d1 = new Date(myuser.booking[i].date_n_time.date);
        console.log(d1);
        console.log(d2);

        if (d1 <= d2) {
          console.log("heyy");
          if (
            myuser.booking[i].plan == "tourplan" ||
            myuser.booking[i].plan == "daylong"
          ) {
            myuser.booking[i].current = false;
          } else if (myuser.booking[i].plan == "singleplace") {
            console.log("yes");
            if (d1 == d2) {
              d2 = new Date().getHours;
              d1 = myuser.booking[i].date_n_time.time;
              d1 = d1.split(":");
              if (Number(d2) > Number(d1[0])) {
                myuser.booking[i].current = false;
              }
            } else if (d1 < d2) {
              console.log("yes1");

              myuser.booking[i].current = false;
            }
          }
        }
        console.log("hip hip hurray");
      }
    }
    myuser.save();
  });
  res.render("profile", { user: user, date: date });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/users/login");
}

router.post("/", isLoggedIn, (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    // todo: don't forget to handle err

    if (!user) {
      req.flash("error", "No account found");
      return res.redirect("/users/login");
    }

    // good idea to trim
    var name = req.body.name.trim();
    var email = req.body.email.trim();
    var username = req.body.username.trim();
    var number = req.body.phone.trim();
    var city = req.body.city.trim();
    var state = req.body.state.trim();

    if (!name || !email || !username || !number || !city || !state) {
      req.flash("error", "One or more fields are empty");
      return res.redirect("/users");
    }

    user.name = name;
    user.email = email;
    user.username = username;
    user.phone_number = number;
    user.city = city;
    user.state = state;

    user.save(function (err) {
      // todo: don't forget to handle err

      res.redirect("/users");
    });
  });
});

router.post("/st", async (req, res) => {
  var guide = await Guide.findOne({ username: req.body.guide });
  for (var i = 0; i < guide.booking.length; i++) {
    if (
      guide.booking[i].date_n_time.date == req.body.date &&
      guide.booking[i].date_n_time.time == req.body.time
    ) {
      guide.booking[i].rating = req.body.st;
    }
  }
  guide.myrating =
    (guide.myrating + Number(req.body.st)) / guide.booking.length;
  await guide.save();
  var user = req.user;
  for (var i = 0; i < user.booking.length; i++) {
    if (user.booking[i]._id == req.body.id) {
      user.booking[i].rating = req.body.st;
    }
  }
  await req.user.save();
});

module.exports = router;
