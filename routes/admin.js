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

const Placeinfo = require("../models/Placeinfo");
const Guide = require("../models/Guide");
const User = require("../models/User");

function CheckUser(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.usertype == "admin") {
      return next();
    } else {
      console.log("dcz");
      return res.sendStatus(404);
    }
  }
  res.redirect("/users/login");
}

router.get("/dashboard", CheckUser, (req, res) => {
  console.log("heyy");

  res.render("admin.ejs", { layout: "adminlayout" });
});

var p = 0;
router.get("/cities", CheckUser, (req, res) => {
  if (req.query.pg) {
    p = p + 1;
  } else {
    if (req.query.pgg) {
      p = p - 1;
    } else {
      p = 0;
    }
  }
  Placeinfo.find({})
    .limit(9)
    .skip(p * 9)
    .then((x) => {
      res.render("admin.ejs", { layout: "adminlayout", places: x, p: p });
    })
    .catch((x) => {
      return res.redirect("dashboard");
    });
});

router.get("/addcity", CheckUser, (req, res) => {
  res.render("adminaddcity", { layout: "adminlayout" });
});

router.post("/thingstodo", CheckUser, (req, res) => {
  console.log(req.query.id);
  console.log(req.body);
  console.log(req.files);
  if (req.files[0]) {
    var k = fs.readFileSync(req.files[0].path);
    var path = "/uploads/" + req.files[0].filename;
  } else {
    var path = "/uploads/suriya1.jpg1573825247106.jpeg";
  }
  Placeinfo.findOne({ _id: req.query.id })
    .then((x) => {
      Placeinfo.updateOne(
        { _id: req.query.id },
        {
          $push: {
            thingstodo: {
              img: path,
              title: req.body.title,
              description: req.body.description,
            },
          },
        }
      )
        .then((y) => {
          res.redirect("/admin/cityinfo?id=" + x._id);
        })
        .catch((z) => {
          res.render("cityinfo", { layout: "adminlayout", place: x });
        });
    })
    .catch((err) => {
      res.redirect("cities");

      console.log(err);
    });
});

router.post("/spots", CheckUser, (req, res) => {
  console.log(req.query.id);
  console.log(req.body);
  console.log(req.files);
  if (req.files[0]) {
    var k = fs.readFileSync(req.files[0].path);
    var path = "/uploads/" + req.files[0].filename;
  } else {
    var path = "/uploads/suriya1.jpg1573825247106.jpeg";
  }
  Placeinfo.findOne({ _id: req.query.id })
    .then((x) => {
      Placeinfo.updateOne(
        { _id: req.query.id },
        {
          $push: {
            spots: {
              img: path,
              name: req.body.title,
              description: req.body.description,
            },
          },
        }
      )
        .then((y) => {
          res.redirect("/admin/cityinfo?id=" + x._id);
        })
        .catch((z) => {
          res.render("cityinfo", { layout: "adminlayout", place: x });
        });
    })
    .catch((err) => {
      res.redirect("cities");

      console.log(err);
    });
});

router.post("/about", CheckUser, (req, res) => {
  console.log(req.query.id);
  console.log(req.body);

  Placeinfo.findOne({ _id: req.query.id })
    .then((x) => {
      x.about = req.body.about;
      x.save()
        .then((y) => {
          res.redirect("/admin/cityinfo?id=" + x._id);
        })
        .catch((err) => {
          res.redirect("cities");

          console.log(err);
        });
    })
    .catch((err) => {
      res.redirect("cities");

      console.log(err);
    });
});

router.post("/history", CheckUser, (req, res) => {
  console.log(req.query.id);
  console.log(req.body);

  Placeinfo.findOne({ _id: req.query.id })
    .then((x) => {
      x.history = req.body.history;
      x.save()
        .then((y) => {
          res.redirect("/admin/cityinfo?id=" + x._id);
        })
        .catch((err) => {
          res.redirect("cities");

          console.log(err);
        });
    })
    .catch((err) => {
      res.redirect("cities");

      console.log(err);
    });
});

router.get("/cityinfo", CheckUser, (req, res) => {
  console.log(req.query);
  Placeinfo.findOne({ _id: req.query.id })
    .then((x) => {
      res.render("cityinfo", { layout: "adminlayout", place: x });
    })
    .catch((err) => {
      res.redirect("cities");

      console.log(err);
    });
});

router.post("/addcity", CheckUser, (req, res) => {
  console.log(req.body);
  console.log(req.files);
  var bgimgs = [];
  if (req.files.length != 0) {
    for (var i = 0; i < req.files.length; i++) {
      bgimgs.push("/uploads/" + req.files[i].filename);
    }
  }
  let newPlace = new Placeinfo();

  (newPlace.name = req.body.city),
    (newPlace.bgimgs = bgimgs),
    (newPlace.history = " "),
    (newPlace.about = " "),
    (newPlace.thingstodo = []);

  newPlace
    .save()
    .then((x) => {
      res.redirect("cities");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/images", CheckUser, (req, res) => {
  console.log(req.body);

  console.log(req.files);
  var bgimgs = [];
  if (req.files.length != 0) {
    for (var i = 0; i < req.files.length; i++) {
      bgimgs.push("/uploads/" + req.files[i].filename);
    }
  }
  Placeinfo.findOne({ _id: req.body.city }).then((x) => {
    var bgimgs = x.bgimgs;
    if (req.files.length != 0) {
      for (var i = 0; i < req.files.length; i++) {
        bgimgs.push("/uploads/" + req.files[i].filename);
      }
    }
    x.bgimgs = bgimgs;
    x.save()
      .then((a) => {
        res.redirect("cityinfo?id=" + req.body.city);
      })
      .catch((err) => {
        console.log(err);
        res.redirect("cities");
      });
  });
});

router.post("/delimgs", CheckUser, (req, res) => {
  console.log(req.body);

  var bgimgs = [];
  Placeinfo.findOne({ _id: req.body.place }).then((x) => {
    var bgimgs = x.bgimgs;
    if (req.body.length != 0) {
      console.log("bingo");

      for (var j = bgimgs.length - 1; j >= 0; --j) {
        if (bgimgs[j] == req.body.img) {
          var k = bgimgs.splice(j, 1);

          console.log(k);
        }
      }
    }
    x.bgimgs = bgimgs;
    x.save()
      .then((a) => {
        res.redirect("cityinfo?id=" + req.body.place);
      })
      .catch((err) => {
        console.log(err);
        res.redirect("cities");
      });
  });
});

router.post("/delthings", CheckUser, (req, res) => {
  console.log(req.body);

  var bgimgs = [];

  Placeinfo.updateOne(
    { _id: req.body.place },
    { $pull: { thingstodo: { $elemMatch: { _id: req.body.id } } } }
  )
    .then((x) => {
      res.redirect("/admin/cityinfo?id=" + req.body.place);
    })
    .catch((err) => {
      console.log(err);
    });
});

var p = 0;
router.get("/allusers", (req, res) => {
  if (req.query.pg) {
    p = p + 1;
  } else {
    if (req.query.pgg) {
      p = p - 1;
    } else {
      p = 0;
    }
  }
  User.find({})
    .limit(9)
    .skip(p * 9)
    .then((x) => {
      res.render("allusers", { users: x, layout: "adminlayout", p: p });
    })
    .catch((err) => {
      console.log(err);
    });
});

var p = 0;
router.get("/allguides", CheckUser, (req, res) => {
  if (req.query.pg) {
    p = p + 1;
  } else {
    if (req.query.pgg) {
      p = p - 1;
    } else {
      p = 0;
    }
  }
  Guide.find({})
    .limit(9)
    .skip(p * 9)
    .then((x) => {
      res.render("allguides", { users: x, layout: "adminlayout", p: p });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
