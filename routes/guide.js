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
const Guide = require("../models/Guide");
const User = require("../models/User");
const News = require("../models/News");
const Tp = require("../models/tour_plans");
bodyParser = require("body-parser").json();
const validatePhoneNumber = require("validate-phone-number-node-js");

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
  return res.send(404);
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

router.get("/signup", (req, res) => {
  res.render("guidesignup.ejs", { errors: [] });
});

router.post(
  "/signup",
  urlencodedparser,
  [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("username").not().isEmpty().withMessage("Username is required"),
    check("about").not().isEmpty().withMessage("About is required"),
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
    check("country").not().isEmpty().withMessage("Name is required"),
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
    const country = req.body.country;
    const about = req.body.about;
    const facebook = req.body.facebook;
    const instagram = req.body.instagram;
    console.log("posted");

    let errors = validationResult(req);
    const result = validatePhoneNumber.validate(phone_number);
    if (result === false) {
      error = {
        param: "phone number",
        msg: "enter a valid phone number",
        value: phone_number,
      };
      errors.errors.push(error);
    }
    Guide.findOne({ username: username }).then(function (user) {
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

    console.log(errors.errors);
    if (errors.errors.length > 0) {
      console.log("im here");
      res.render("guidesignup.ejs", {
        errors: errors.errors,
      });
    } else {
      var emp = new Array();
      let newGuide = new Guide({
        name: name,
        email: email,
        username: username,
        password: password,
        phone_number: phone_number,
        city: city,
        country: country,
        about: about,
        facebook: facebook,
        instagram: instagram,
        languages: emp,
        plans: emp,
        notavailabledates: emp,
        availabledates: emp,
        timeslots: emp,
        limit: 15,
      });
      console.log(req.files);
      if (req.files[0]) {
        var k = fs.readFileSync(req.files[0].path);
        newGuide.img.path = "/uploads/" + req.files[0].filename;
        newGuide.img.contentType = "image/png";
      } else {
        newGuide.img.path = "/uploads/suriya1.jpg1573825247106.jpeg";
        newGuide.img.contentType = "image/png";
      }

      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newGuide.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          newGuide.password = hash;
          console.log("created");
          newGuide
            .save()
            .then((user) => res.redirect("./login"))
            .catch((err) => console.log(err));
        })
      );

      res.redirect("/guides/login");
    }
  }
);
router.get("/login", (req, res) => {
  res.render("guidelogin.ejs");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local2", {
    successRedirect: "/guides/guideprofile",
    failureRedirect: "/guides/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/forgot", function (req, res) {
  res.render("forgot", {
    user: req.user,
  });
});

router.post("/forgot", function (req, res, next) {
  console.log("posted");
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        Guide.findOne({ username: req.body.username }, function (err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            console.log("No account with that email address exists.");
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
            pass: "$200Found",
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
            "/guides/reset/" +
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
      res.redirect("./forgot");
    }
  );
});

router.get("/reset/:token", function (req, res) {
  Guide.findOne(
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
            Guide.findOne(
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

router.get("/dashboard", CheckGuide, (req, res) => {
  console.log(req.user);

  res.render("dashboard", { user: req.user });
});

var p = 0;
router.get("/guideprofile", CheckGuide, async (req, res) => {
  var datetime = new Date();
  date = datetime.toISOString().slice(0, 10);
  date1 = date.split("-");
  console.log(date1);
  var date2 = date1[0] + "/" + date1[1] + "/" + date1[2];
  var user = req.user;
  Guide.findOne({ username: req.user.username }).then((myuser) => {
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
    user = myuser;
    myuser.save();
  });
  // var user=Guide.findOne({username:req.user.username})
  console.log(
    "-----------------------------------------------------------------------"
  );

  user = user.toJSON();
  console.log("here");
  if (req.user.booking.length != 0) {
    for (var i = 0; i < req.user.booking.length; i++) {
      await User.findOne({ username: req.user.booking[i].users[0].username })
        .lean()
        .then(async (x) => {
          console.log(x);

          await Object.assign(user.booking[i], {
            img: x.img.path,
            phone_number: x.phone_number,
          });
          console.log(user.booking[i].img);
        })
        .catch(async (y) => {
          await Object.assign(user.booking[i], {
            img: "/uploads/765-default-avatar.png",
            phone_number: "no number",
          });
        });
    }
  }
  console.log("----------------");
  console.log(user.booking);
  var currentbookings = [];
  if (req.user.booking.length != 0) {
    console.log(",nmn");
    for (var i = 0; i < req.user.booking.length; i++) {
      if (
        req.user.booking[i].current == true &&
        req.user.booking[i].plan == "tourplan"
      ) {
        console.log(",nmnddd");
        var m2 = new Date(req.user.booking[i].date_n_time.date);
        currentbookings.push(
          m2.getFullYear() +
            "/" +
            (m2.getMonth() + 1).toString().padStart(2, "0") +
            "/" +
            m2.getDate().toString().padStart(2, "0")
        );
        console.log(req.user.booking[i].days);
        for (var j1 = 0; j1 < req.user.booking[i].days - 1; j1++) {
          console.log("working");
          m2.setDate(m2.getDate() + 1);
          currentbookings.push(
            m2.getFullYear() +
              "/" +
              (m2.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              m2.getDate().toString().padStart(2, "0")
          );
        }
        var m2 = new Date(req.user.booking[i].date_n_time.date);

        for (var j2 = 0; j2 < req.user.booking[i].days - 1; j2++) {
          console.log("working2");
          m2.setDate(m2.getDate() - 1);
          currentbookings.push(
            m2.getFullYear() +
              "/" +
              (m2.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              m2.getDate().toString().padStart(2, "0")
          );
        }
      }
    }
  }
  console.log("----------------");
  console.log(user.booking);

  Tp.find({ guide: req.user.username }).then((x) => {
    if (req.query.pg) {
      p = p + 1;
    } else {
      p = 0;
    }
    prev = [];
    for (var q = 0; q < user.booking.length; q++) {
      if (user.booking[q].current != true) {
        prev.push(user.booking[q]);
      }
    }

    var booking = [];
    if (p == 0) {
      booking = prev.slice(0, 3);
    } else {
      booking = prev.slice(p * 3, p * 3 + 3);
    }
    console.log(req.query.pg);
    console.log(p);
    console.log(
      "=========================================================================================================="
    );
    console.log(booking);

    console.log(
      "=========================================================================================================="
    );
    console.log(user.booking);

    res.render("guideprofile", {
      user: user,
      tours: x,
      p: p,
      booking: booking,
      booked: currentbookings,
    });
  });
});
router.get("/newtrip/singleplace", CheckGuide, (req, res) => {
  console.log(req.user);
  Tp.findOne({ guide: req.user.username }).then((x) => {
    console.log(x);
    if (x == null) {
      res.render("singleplace");
    } else {
      res.redirect("/guides/guideprofile");
    }
  });
});
router.post("/newtrip/singleplace", CheckGuide, (req, res) => {
  console.log(req.user);
  if (req.user) {
    var location = req.body.location;
    var city = req.body.city;
    var cost = req.body.cost;
    var opentime = req.body.opentime;
    var closetime = req.body.closetime;
    var slotduration = req.body.duration;
    console.log(req.files);
    if (req.files.length != 0) {
      var a = fs.readFileSync(req.files[0].path);
      path = "/uploads/" + req.files[0].filename;
      contentType = "image/png";
    } else {
      path = "/uploads/" + "places/Hyderabad/imgs/bg0.jpg";
      contentType = "image/png";
    }

    // t1=opentime.split(':')
    // var mins = 30*Number(slotduration)*t1[1];
    // var hours=t1[0];
    // d=new Date();
    // d.setHours(0);
    // d.setMinutes(0);
    // d.setHours(hours);
    // d.setMinutes(mins);
    console.log("im here");
    function addMinutes(time, minutes) {
      console.log("called");
      var date = new Date(
        new Date("01/01/2015 " + time).getTime() + minutes * 60000
      );
      var tempTime =
        (date.getHours().toString().length == 1
          ? "0" + date.getHours()
          : date.getHours()) +
        ":" +
        (date.getMinutes().toString().length == 1
          ? "0" + date.getMinutes()
          : date.getMinutes());
      return tempTime;
    }

    var starttime = opentime;
    var interval = 30 * Number(slotduration);
    var endtime = closetime;
    var timeslots = [];

    starttime1 = addMinutes(starttime, interval);

    while (starttime1 <= endtime) {
      timeslots.push(starttime);

      starttime = addMinutes(starttime, interval);

      starttime1 = addMinutes(starttime, interval);
      if (starttime > starttime1) {
        break;
      }
      console.log("------------");
      console.log(starttime);
      console.log(starttime1);
      console.log("------------");
    }

    console.log(timeslots);

    console.log(req.user._id);
    console.log(req.body);

    async function fordates(user) {
      var p1 = user.plans[user.plans.length - 1];
      console.log(p1);

      /////////////////////////////////////////
      var gtimeslots = user.timeslots;
      var final = [];
      var finaltimes = [];

      for (var j = 0; j < gtimeslots.length; ++j) {
        var ti = gtimeslots[j].split(":");
        ti = ti[0];
        if (Number(ti) < 12) {
          var slot = "mrng";
        } else if (Number(ti) < 18) {
          var slot = "afternoon";
        } else {
          var slot = "evng";
        }
        var p = user.plans;
        console.log(p);

        p = p[p.length - 1];
        console.log(p);
        var plantype = p.plantype;
        var placename = p.location;
        console.log(plantype);
        finaltimes.push({ slot: slot, timeslot: gtimeslots[j], count: 0 });
      }

      ///////////////////////////////////////

      for (var i = 0; i < user.availabledates.length; i++) {
        if (user.availabledates[i].totalbookings == 0) {
          console.log(user.availabledates[i].date);
          await Guide.updateOne(
            {
              _id: req.user._id,
              "availabledates.date": user.availabledates[i].date,
            },
            {
              $set: {
                "availabledates.$.plantype": p1.plantype,
                "availabledates.$.planid": p1._id,
                "availabledates.$.location": p1.location,
                "availabledates.$.time": finaltimes,
              },
            }
          ).then((x) => console.log("planupdate"));
        }
      }
    }

    if (req.user.plans.length < 1) {
      Guide.findOne({ _id: req.user._id }).then((user) => {
        Guide.updateOne(
          { _id: req.user._id },
          {
            $push: {
              plans: {
                plantype: "singleplace",
                location: location,
                place: city,
                cost: cost,
                opentime: opentime,
                closetime: closetime,
                slotduration: slotduration,
                img: path,
              },
              timeslots: {
                $each: timeslots,
              },
            },
          }
        ).then((x) => console.log("updated"));
      });
    } else {
      var remove = req.user.timeslots;
      Guide.updateOne(
        { _id: req.user._id },
        {
          $pullAll: { timeslots: remove },
        }
      ).then((x) => console.log("updated"));

      Guide.findOne({ _id: req.user._id }).then((user) => {
        Guide.updateOne(
          { _id: req.user._id },
          {
            $push: {
              plans: {
                plantype: "singleplace",
                location: location,
                place: city,
                cost: cost,
                opentime: opentime,
                closetime: closetime,
                slotduration: slotduration,
                img: path,
              },
              timeslots: {
                $each: timeslots,
              },
            },
          }
        ).then((x) => console.log("updated"));
        Guide.findOne({ _id: req.user._id }).then((user) => {
          fordates(user);
        });
      });
    }
    return res.redirect("/guides/guideprofile#caleandar");
  }
  return res.redirect("/guides/newtrip/singleplace");
});

router.post("/guideprofile/cal", CheckGuide, async (req, res) => {
  var currentbookings = [];
  if (req.user.booking.length != 0) {
    console.log(",nmn");
    for (var i = 0; i < req.user.booking.length; i++) {
      if (
        req.user.booking[i].current == true &&
        req.user.booking[i].plan == "tourplan"
      ) {
        console.log(",nmnddd");
        var m2 = new Date(req.user.booking[i].date_n_time.date);
        currentbookings.push(
          m2.getFullYear() +
            "/" +
            (m2.getMonth() + 1).toString().padStart(2, "0") +
            "/" +
            m2.getDate().toString().padStart(2, "0")
        );
        console.log(req.user.booking[i].days);
        for (var j1 = 0; j1 < req.user.booking[i].days - 1; j1++) {
          console.log("working");
          m2.setDate(m2.getDate() + 1);
          currentbookings.push(
            m2.getFullYear() +
              "/" +
              (m2.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              m2.getDate().toString().padStart(2, "0")
          );
        }
        var m2 = new Date(req.user.booking[i].date_n_time.date);

        for (var j2 = 0; j2 < req.user.booking[i].days - 1; j2++) {
          console.log("working2");
          m2.setDate(m2.getDate() - 1);
          currentbookings.push(
            m2.getFullYear() +
              "/" +
              (m2.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              m2.getDate().toString().padStart(2, "0")
          );
        }
      }
    }
  }
  console.log(currentbookings);
  console.log(req.body);
  var dates = req.body.dates;
  dates = dates.split("-");
  console.log(dates);
  var tda = new Date();
  var tmon = tda.getMonth();

  // tda.setDate(1);
  var all_days = [];
  while (tda.getMonth() == tmon) {
    var da1 =
      tda.getFullYear() +
      "/" +
      (tda.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      tda.getDate().toString().padStart(2, "0");
    all_days.push(da1);
    tda.setDate(tda.getDate() + 1);
  }
  var tda = new Date();
  tda.setDate(1);
  tda.setMonth(tmon + 1);
  var tmon = tda.getMonth();
  while (tda.getMonth() == tmon) {
    console.log("entered");
    var da1 =
      tda.getFullYear() +
      "/" +
      (tda.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      tda.getDate().toString().padStart(2, "0");
    all_days.push(da1);
    tda.setDate(tda.getDate() + 1);
  }

  console.log(all_days);

  const myArray = new Set(all_days);
  const toRemove = new Set(dates);

  const difference = new Set([...myArray].filter((x) => !toRemove.has(x)));

  // const curbok = new Set(currentbookings);
  // console.log(curbok)
  //
  // const dif1= new Set([...difference].filter((x) => !curbok.has(x)));
  var available_dates = Array.from(difference);

  console.log("not available");
  console.log(dates);
  console.log(available_dates);
  console.log("available_dates");

  async function callme(user) {
    if (user.availabledates) {
      var guidedates = [];
      for (var i = 0; i < user.availabledates.length; ++i) {
        guidedates.push(user.availabledates[i].date);
        console.log("guidedates");
      }
      if (dates.length) {
        console.log("im here");
        for (var i = 0; i < dates.length; ++i) {
          for (var j = 0; j < user.availabledates.length; ++j) {
            if (dates[i] == user.availabledates[j].date) {
              await Guide.updateOne(
                { _id: req.user._id, "availabledates.date": dates[i] },
                { $set: { "availabledates.$.plantype": "notavailable" } }
              ).then((x) => console.log("notavailable"));
              // Guide.updateOne({_id:req.user._id},
              //   {$push:{notavailabledates:dates[i]}}
              // ).then(x=>console.log('notavailable'))
            }
          }
        }
      }
      console.log("checking");
      var check = [];
      for (var i = 0; i < available_dates.length; ++i) {
        console.log(available_dates[i]);
        for (var j = 0; j < user.availabledates.length; ++j) {
          console.log(user.availabledates[j].date);
          if (available_dates[i] == user.availabledates[j].date) {
            console.log("hey");

            if (user.availabledates[j].plantype == "notavailable") {
              console.log("gothere");
              for (var m = 0; m < user.plans.length; m++) {
                if (user.plans[m].id == user.availabledates[j].planid) {
                  var plantype = user.plans[m].plantype;
                }
              }
              console.log("before change plans");
              console.log(plantype);

              await Guide.updateOne(
                {
                  _id: req.user._id,
                  "availabledates.date": available_dates[i],
                },
                { $set: { "availabledates.$.plantype": plantype } }
              ).then((x) => console.log("changed plan type"));
            }
          }
        }
      }
      var all = new Set(available_dates);
      var already = new Set(guidedates);
      var noalready = new Set(user.notavailabledates);
      console.log("noalready");
      console.log(noalready);
      console.log("toRemove");
      var tooo = Array.from(toRemove);
      console.log(toRemove);
      var tobeadded = new Set([...all].filter((x) => !toRemove.has(x)));
      var tobeadded = new Set([...tobeadded].filter((x) => !already.has(x)));

      var tobeadded = Array.from(tobeadded);
      console.log("im back");
      console.log(tobeadded);
      var gtimeslots = user.timeslots;
      var final = [];
      var finaltimes = [];

      for (var j = 0; j < gtimeslots.length; ++j) {
        var ti = gtimeslots[j].split(":");
        ti = ti[0];
        if (Number(ti) < 12) {
          var slot = "mrng";
        } else if (Number(ti) < 18) {
          var slot = "afternoon";
        } else {
          var slot = "evng";
        }
        var p = user.plans;
        console.log(p);

        p = p[p.length - 1];
        console.log(p);
        var plantype = p.plantype;
        var placename = p.location;
        console.log(plantype);
        finaltimes.push({ slot: slot, timeslot: gtimeslots[j], count: 0 });
      }
      var p = user.plans;
      console.log(p);

      p = p[p.length - 1];
      console.log(p);
      var plantype = p.plantype;
      var placename = p.location;
      console.log(p);
      for (var i = 0; i < tobeadded.length; ++i) {
        final.push({
          date: tobeadded[i],
          location: placename,
          planid: p._id,
          plantype: plantype,
          time: finaltimes,
        });
      }

      console.log(final);
      var remove = user.notavailabledates;
      Guide.updateOne(
        { _id: req.user._id },
        {
          $pullAll: { notavailabledates: remove },
        }
      ).then((x) => console.log("updated"));
      dates.pop();
      console.log("dates");
      console.log(dates);
      console.log("too");
      console.log(tooo);
      if (tooo[tooo.length - 1] == "-") {
        tooo.pop();
      }
      // for(var r=0;r<currentbookings.length;r++){
      //   tooo.push(currentbookings[r])
      // }
      // t1o = new Set(tooo)
      // tooo = Array.from(t1o)
      Guide.updateOne(
        { _id: req.user._id },
        {
          $push: {
            notavailabledates: {
              $each: tooo,
            },

            availabledates: {
              $each: final,
            },
          },
        }
      ).then((x) => console.log("updated1"));
    } else {
      var gtimeslots = user.timeslots;
      var final = [];
      var finaltimes = [];

      for (var j = 0; j < gtimeslots.length; ++j) {
        var ti = gtimeslots[j].split(":");
        ti = ti[0];
        if (Number(ti) < 12) {
          var slot = "mrng";
        } else if (Number(ti) < 18) {
          var slot = "afternoon";
        } else {
          var slot = "evng";
        }
        var p = user.plans;
        console.log(p);

        p = p[p.length - 1];
        console.log(p);
        var plantype = p.plantype;
        var placename = p.location;
        console.log(plantype);
        finaltimes.push({ slot: slot, timeslot: gtimeslots[j], count: 0 });
      }
      var p = user.plans;
      console.log(p);

      p = p[p.length - 1];
      console.log(p);
      var plantype = p.plantype;
      var placename = p.location;
      console.log(plantype);
      for (var i = 0; i < available_dates.length; ++i) {
        final.push({
          date: available_dates[i],
          location: placename,
          planid: p._id,
          plantype: plantype,
          time: finaltimes,
        });
      }

      await Guide.updateOne(
        { _id: req.user._id },
        {
          $push: {
            notavailabledates: {
              $each: dates,
            },

            availabledates: {
              $each: final,
            },
          },
        }
      ).then((x) => console.log("updated"));
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////
  // changeplantodates(user){
  //   for (var i = 0; i < user.availabledates.length; i++) {
  //
  //   }
  // }

  ///////////////////////////////////////////////////////////////////////////////////
  Guide.findOne({ _id: req.user._id }).then((user) => {
    // if(user.plans.length <= 1){
    callme(user);
    // }
    // else:{
    //
    // }
  });
  res.send("");
});

router.get("/newtrip/daylong", CheckGuide, (req, res) => {
  Tp.findOne({ guide: req.user.username }).then((x) => {
    console.log(x);
    if (x == null) {
      res.render("daylong");
    } else {
      res.redirect("/guides/guideprofile");
    }
  });
});
router.post("/newtrip/daylong", CheckGuide, (req, res) => {
  console.log(req.user);
  if (req.user) {
    var location = req.body.city;
    var cost = req.body.cost;
    var opentime = req.body.opentime;
    var closetime = req.body.closetime;
    console.log(req.files);
    var a = fs.readFileSync(req.files[0].path);
    path = "/uploads/" + req.files[0].filename;
    contentType = "image/png";
    // t1=opentime.split(':')
    // var mins = 30*Number(slotduration)*t1[1];
    // var hours=t1[0];
    // d=new Date();
    // d.setHours(0);
    // d.setMinutes(0);
    // d.setHours(hours);
    // d.setMinutes(mins);
    console.log("im here");

    console.log(req.user._id);
    console.log(req.body);
    var timeslots = new Array();

    async function fordates(user) {
      var p1 = user.plans[user.plans.length - 1];
      console.log(p1);

      /////////////////////////////////////////
      var gtimeslots = user.timeslots;
      var final = [];
      var finaltimes = [];

      for (var j = 0; j < gtimeslots.length; ++j) {
        var ti = gtimeslots[j].split(":");
        ti = ti[0];
        if (Number(ti) < 12) {
          var slot = "mrng";
        } else if (Number(ti) < 18) {
          var slot = "afternoon";
        } else {
          var slot = "evng";
        }
        var p = user.plans;
        console.log(p);

        p = p[p.length - 1];
        console.log(p);
        var plantype = p.plantype;
        var placename = p.location;
        console.log(plantype);
        finaltimes.push({ slot: slot, timeslot: gtimeslots[j], count: 0 });
      }

      ///////////////////////////////////////

      for (var i = 0; i < user.availabledates.length; i++) {
        if (user.availabledates[i].totalbookings == 0) {
          console.log(user.availabledates[i].date);
          await Guide.updateOne(
            {
              _id: req.user._id,
              "availabledates.date": user.availabledates[i].date,
            },
            {
              $set: {
                "availabledates.$.plantype": p1.plantype,
                "availabledates.$.planid": p1._id,
                "availabledates.$.location": p1.location,
                "availabledates.$.time": finaltimes,
              },
            }
          ).then((x) => console.log("planupdate"));
        }
      }
    }

    if (req.user.plans.length < 1) {
      Guide.findOne({ _id: req.user._id }).then((user) => {
        Guide.updateOne(
          { _id: req.user._id },
          {
            $push: {
              plans: {
                plantype: "daylong",
                location: location,
                cost: cost,
                opentime: opentime,
                closetime: closetime,
                img: path,
              },
              timeslots: {
                $each: timeslots,
              },
            },
          }
        ).then((x) => console.log("updated"));
      });
    } else {
      var remove = req.user.timeslots;
      Guide.updateOne(
        { _id: req.user._id },
        {
          $pullAll: { timeslots: remove },
        }
      ).then((x) => console.log("updated"));

      Guide.findOne({ _id: req.user._id }).then((user) => {
        Guide.updateOne(
          { _id: req.user._id },
          {
            $push: {
              plans: {
                plantype: "daylong",

                location: location,
                cost: cost,
                opentime: opentime,
                closetime: closetime,

                img: path,
              },
              timeslots: {
                $each: timeslots,
              },
            },
          }
        ).then((x) => console.log("updated"));
        Guide.findOne({ _id: req.user._id }).then((user) => {
          fordates(user);
        });
      });
    }
    return res.redirect("/guides/guideprofile#caleandar");
  }
  return res.redirect("/guides/newtrip/daylong");

  res.render("daylong");
});

router.post("/testimonial", CheckGuide, async (req, res) => {
  console.log("hey there");
  console.log(req.body.userid);
  var test = [];
  await User.findOne({ username: req.body.userid }).then((u) => {
    console.log(u);
    var a = req.user.img.path;
    var b = u.username;
    test.push({
      senderid: req.user.username,
      img: a,
      username: b,
      testid: "testimonial",
      unread: true,
    });
    console.log(test);
  });
  console.log(test);
  await User.updateOne(
    { username: req.body.userid },
    {
      $push: {
        notifications: {
          $each: test,
        },
      },
    }
  )
    .then((x) => console.log("updated"))
    .catch((x) => console.log(x));

  res.send("");
});

router.post("/noti", CheckGuide, async (req, res) => {
  console.log("hey there");
  console.log(req.body.notiid);
  var test = [];
  await Guide.updateOne(
    { _id: req.user._id, "notifications._id": req.body.notiid },
    {
      $set: { "notifications.$.unread": false },
    }
  )
    .then((x) => console.log("updated"))
    .catch((x) => console.log(x));

  res.send("");
});

router.post("/updatenotis", CheckGuide, async (req, res) => {
  await Guide.findOne({ _id: req.user._id }).then((x) => {
    var upnotis = {
      data: x.notifications,
    };
    res.send(upnotis);
  });
});

router.post("/addlanguage", CheckGuide, async (req, res) => {
  await Guide.findOne({ _id: req.user._id }).then((x) => {
    console.log(req.body);
    test = [{ language: req.body.lang, eff: Number(req.body.eff) * 10 }];
    Guide.updateOne(
      { _id: x._id },
      {
        $push: {
          languages: {
            $each: test,
          },
        },
      }
    )
      .then((x) => console.log("updated"))
      .catch((x) => console.log(x));

    res.send("");
  });
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/guides/login");
});
router.get("/editprofile", CheckGuide, (req, res) => {
  res.render("editprofile", { user: req.user });
});
router.post("/editprofile", CheckGuide, (req, res) => {
  console.log("asgdsfdngh");
  console.log(req.user.username);
  console.log(req.body);
  Guide.findById(req.user.id).then((x) => {
    x.name = req.body.name;
    x.email = req.body.email;
    x.phone_number = req.body.phone_number;
    x.city = req.body.city;
    x.country = req.body.country;
    x.about = req.body.about;
    x.facebook = req.body.facebook;
    x.instagram = req.body.instagram;
    if (req.files[0]) {
      var k = fs.readFileSync(req.files[0].path);
      x.img.path = "/uploads/" + req.files[0].filename;
    }
    x.save().then(res.redirect("/guides/guideprofile"));
  });
});

router.post("/news", CheckGuide, (req, res) => {
  var img = "uploads/places/Hyderabad/imgs/bg0.jpg";
  console.log(req.body);
  if (req.files[0]) {
    var k = fs.readFileSync(req.files[0].path);
    img = "/uploads/" + req.files[0].filename;
  }
  var news = new News({
    place: req.body.place,
    news: req.body.hiddenfield,
    guide: req.user.username,
    title: req.body.title,
    img: img,
    guideimg: req.user.img.path,
    upvotes: [],
    time: new Date(),
  });
  news.save();
  res.redirect("/guides/guideprofile");
});

router.post("/upvote", async (req, res) => {
  try {
    console.log(req.body);
    let id = req.body.newsid;
    const news = await News.find({ _id: id });
    // News.updateOne({_id:req.body.newsid},{$push:{upvotes:new Date(),array_length:}}).then(console.log("updated"))
    news.upvotes.append(new Date());
    news.array_length = news.array_length + 1;
    await news.save();
  } catch (e) {
    res.status(400).send({ e });
  }
  // res.redirect('//')
});

router.get("/tour_plan_details", CheckGuide, async (req, res) => {
  try {
    var tour = await Tp.find({ guide: req.user.username, _id: req.query.id });

    console.log(tour);
    var opted = tour[0].dates;
    console.log("pppppppppppppppppppp");
    console.log(opted);
    var booked = [];
    for (var i = 0; i < req.user.booking.length; i++) {
      console.log("entered");
      if (
        req.user.booking[i].current == true &&
        req.user.booking[i].plan == "tourplan"
      ) {
        console.log("runig");
        booked.push(req.user.booking[i].date_n_time.date);
        var t2 = new Date(req.user.booking[i].date_n_time.date);

        days1 = req.user.booking[i].days;
        for (var m = 0; m < days1 - 1; m++) {
          t2.setDate(t2.getDate() + 1);
          booked.push(
            t2.getFullYear() +
              "/" +
              (t2.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              t2.getDate().toString().padStart(2, "0")
          );
        }
        var t2 = new Date(req.user.booking[i].date_n_time.date);

        for (var m = 0; m < days1 - 1; m++) {
          t2.setDate(t2.getDate() - 1);
          booked.push(
            t2.getFullYear() +
              "/" +
              (t2.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              t2.getDate().toString().padStart(2, "0")
          );
        }

        console.log("exited");
      }
    }
    b1 = new Set(booked);
    booked = Array.from(b1);
    console.log(opted);
    console.log("opted");
    console.log(booked);
    res
      .status(200)
      .render("edittourplan", { tour: tour, booked: booked, opted: opted });
  } catch (e) {
    res.status(404).send(e);
  }
});

router.post("/deltour", CheckGuide, (req, res) => {
  console.log(req.body.id);
  Tp.deleteOne({ _id: req.body.id })
    .then((x) => {
      console.log("deleted");
      res.redirect("/guides/guideprofile");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/tourcal", CheckGuide, (req, res) => {
  console.log("hey");
  console.log(req.body);
  var dates1 = req.body.dates;
  console.log(dates1);
  console.log(req.body.dates);
  console.log(req.body.id);
  guide = req.user;
  dates1 = dates1.split("-");
  console.log(dates1);
  hold = [];
  for (var m = 0; m < guide.booking.length; m++) {
    if (
      guide.booking[m].current == true &&
      guide.booking[m].plan == "tourplan"
    ) {
      hold.push(guide.booking[m].date_n_time.date);
      var t2 = new Date(guide.booking[m].date_n_time.date);

      days1 = guide.booking[m].days;
      for (var i = 0; i < days1 - 1; i++) {
        t2.setDate(t2.getDate() + 1);
        hold.append(
          t2.getFullYear() +
            "/" +
            (t2.getMonth() + 1).toString().padStart(2, "0") +
            "/" +
            t2.getDate().toString().padStart(2, "0")
        );
      }
      var t2 = new Date(guide.booking[m].date_n_time.date);
      for (var i = 0; i < days1 - 1; i++) {
        t2.setDate(t2.getDate() - 1);
        hold.append(
          t2.getFullYear() +
            "/" +
            (t2.getMonth() + 1).toString().padStart(2, "0") +
            "/" +
            t2.getDate().toString().padStart(2, "0")
        );
      }
    }
  }
  var booked = new Set(hold);

  var dated = new Set(dates1);
  var datees = new Set([...dated].filter((x) => !booked.has(x)));

  var dates = Array.from(datees);
  console.log("booked");
  console.log(booked);
  console.log("dates");
  console.log(dates);
  Tp.findOne({ guide: req.user.username, _id: req.body.id }).then((x) => {
    var da = x.dates;
    // Tp.updateOne({guide:req.user.username,_id:req.body.id},{$pullAll:da}).then(y=>{
    //   Tp.updateOne({})
    // })
    x.dates = dates;
    x.save().then((a) => {
      console.log("done");
    });
  });
});

module.exports = router;
