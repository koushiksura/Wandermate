const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CustomStrategy = require("passport-custom").Strategy;
const User = require("../models/User");
const Guide = require("../models/Guide");

module.exports = function (passport) {
  passport.use(
    "local1",
    new CustomStrategy(function (req, done) {
      User.findOne({ username: req.body.username })
        .then((user) => {
          if (!user) {
            return done(
              null,
              false,
              req.flash("error", "Username does not exist")
            );
          }
          bcrypt.compare(
            req.body.password,
            user.password,
            function (err, isMatch) {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(
                  null,
                  false,
                  req.flash("error", "Incorrect username or password")
                );
              }
            }
          );
        })
        .catch((err) => console.log(err));
    })
  );

  passport.use(
    "local2",
    new CustomStrategy(function (req, done) {
      Guide.findOne({ username: req.body.username })
        .then((user) => {
          if (!user) {
            return done(
              null,
              false,
              req.flash("error", "Username does not exist")
            );
          }
          bcrypt.compare(
            req.body.password,
            user.password,
            function (err, isMatch) {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(
                  null,
                  false,
                  req.flash("error", "Incorrect username or password")
                );
              }
            }
          );
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id + "," + user.usertype);
  });

  passport.deserializeUser(function (id, done) {
    usertype = id.split(",")[1];
    id1 = id.split(",")[0];
    if (usertype == "user" || usertype == "admin") {
      User.findById(id1, function (err, user) {
        console.log("onion");
        done(err, user);
      });
    } else {
      Guide.findById(id1, function (err, user) {
        console.log("onion");
        done(err, user);
      });
    }
  });
};
