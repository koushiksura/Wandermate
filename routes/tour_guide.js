const Tp = require("../models/tour_plans");
const Guide = require("../models/Guide");

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { check, validationResult } = require("express-validator");
const session = require("express-session");
const multer = require("multer");
const router = new express.Router();
const verify = require("./validating_form");

var urlencodedparser = bodyParser.urlencoded({ extended: false });

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

router.post(
  "/tour_plan",
  CheckGuide,
  urlencodedparser,
  verify,
  async (req, res) => {
    try {
      console.log(
        "-------------------------main function------------------------------"
      );
      console.log(req.body);
      // console.log(req.files)
      var tp = new Tp();
      var order = 0;
      var plans = [];
      var name, cost, city, days;
      for (var key in req.body) {
        order += 1;
        if (key !== "dates") {
          var items = req.body[key].split(",");
          console.log(items);
          day = items[0];
          city = items[1];
          place = items[2];
          start_time = items[3];
          end_time = items[4];
          var temp_js = { day, order, place, start_time, end_time };
          plans.push(temp_js);
          name = items[5];
          cost = parseInt(items[6]);
          days = items[7];
        }
      }

      console.log("finding guide");
      Guide.findOne({ username: req.user.username })
        .then(async (guide) => {
          if (guide.availabledates) {
            var dates = req.body["dates"].split("-");

            if (guide.availabledates.length != 0) {
              console.log("bjbj");
              console.log(days);
              for (var j = 0; j < dates.length; j++) {
                console.log("enteredhere");
                var m1 = dates[j];
                if (m1 != "" || m1 != "-") {
                  var m2 = new Date(m1);
                  var check = [];
                  check.push(
                    m2.getFullYear() +
                      "/" +
                      (m2.getMonth() + 1).toString().padStart(2, "0") +
                      "/" +
                      m2.getDate().toString().padStart(2, "0")
                  );
                  console.log(m1);
                  for (var i1 = 0; i1 < days - 1; i1++) {
                    console.log("collectiong dates1");
                    m2.setDate(m2.getDate() + 1);
                    check.push(
                      m2.getFullYear() +
                        "/" +
                        (m2.getMonth() + 1).toString().padStart(2, "0") +
                        "/" +
                        m2.getDate().toString().padStart(2, "0")
                    );
                  }
                  var m2 = new Date(m1);
                  console.log(m2);
                  for (var i2 = 0; i2 < days - 1; i2++) {
                    console.log("collectiong dates2");
                    m2.setDate(m2.getDate() - 1);
                    check.push(
                      m2.getFullYear() +
                        "/" +
                        (m2.getMonth() + 1).toString().padStart(2, "0") +
                        "/" +
                        m2.getDate().toString().padStart(2, "0")
                    );
                  }
                  console.log("im check");
                  console.log(check);

                  var clear = 0;
                  for (var k = 0; k < check.length; k++) {
                    console.log("entered");

                    for (var a = 0; a < guide.availabledates.length; a++) {
                      console.log("dead");
                      if (
                        check[k] == guide.availabledates[a].date &&
                        guide.availabledates[a].totalbookings != 0
                      ) {
                        clear = 1;
                        console.log("entered1");
                      }
                    }
                  }
                  if (clear == 1) {
                    function arrayRemove(arr, value) {
                      return arr.filter(function (ele) {
                        return ele != value;
                      });
                    }

                    var result = arrayRemove(
                      dates,
                      m1.getFullYear() +
                        "/" +
                        (m1.getMonth() + 1).toString().padStart(2, "0") +
                        "/" +
                        m1.getDate().toString().padStart(2, "0")
                    );
                    var dates = result;
                    console.log(
                      "jhvcbhjbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
                    );
                    console.log(dates);
                  } else {
                    console.log("check");
                    console.log(check);
                    for (var i10 = 0; i10 < check.length; i10++) {
                      console.log("jai");
                      for (var k = 0; k < guide.availabledates.length; k++) {
                        console.log("hindi");
                        if (guide.availabledates[k].date == check[i10]) {
                          console.log("hind");
                          guide.availabledates[k].plantype = "tourplan";
                          await guide.save();
                        }
                      }
                    }
                  }
                  hold = [];
                  for (var m = 0; m < guide.booking.length; m++) {
                    console.log("enter heree......");
                    console.log(guide.booking);
                    if (
                      guide.booking[m].current == true &&
                      guide.booking[m].plan == "tourplan"
                    ) {
                      console.log("pushed");
                      hold.push(guide.booking[m].date_n_time.date);
                      var t2 = new Date(guide.booking[m].date_n_time.date);

                      days1 = guide.booking[m].days;
                      for (var i = 0; i < days1 - 1; i++) {
                        console.log("bnbj");
                        t2.setDate(t2.getDate() + 1);
                        hold.push(
                          t2.getFullYear() +
                            "/" +
                            (t2.getMonth() + 1).toString().padStart(2, "0") +
                            "/" +
                            t2.getDate().toString().padStart(2, "0")
                        );
                      }
                      var t2 = new Date(guide.booking[m].date_n_time.date);
                      for (var i = 0; i < days1 - 1; i++) {
                        console.log("cnbj");
                        t2.setDate(t2.getDate() - 1);
                        hold.push(
                          t2.getFullYear() +
                            "/" +
                            (t2.getMonth() + 1).toString().padStart(2, "0") +
                            "/" +
                            t2.getDate().toString().padStart(2, "0")
                        );
                      }
                      console.log("all dates gathered");
                    }
                    console.log("exit");
                  }
                  var booked = new Set(hold);
                  var dated = new Set(dates);
                  var datees = new Set(
                    [...dated].filter((x) => !booked.has(x))
                  );

                  var dates = Array.from(datees);
                  console.log(datees);
                  console.log("-----");
                  console.log(dates);
                }
              }

              console.log("removing available dates");

              var removedate = [];
              for (var i = 0; i < guide.availabledates.length; i++) {
                console.log("entereduuu");
                if (
                  guide.availabledates[i].plantype == "singleplace" ||
                  guide.availabledates[i].plantype == "daylong"
                ) {
                  console.log("ent");
                  if (guide.availabledates[i].totalbookings != 0) {
                    console.log("entereduuuuuuuuuuuu");
                    removedate.push(guide.availabledates[i]);
                  }
                }
              }
              console.log(removedate);
              var myplans = guide.plans;
              console.log(req.user._id);
              Guide.findOne({ _id: req.user._id }).then(async (x) => {
                console.log(x);
                console.log("found");

                x.availabledates = removedate;
                x.plans = myplans;
                await x.save();
                console.log("done");
              });
              // Guide.updateOne({'_id':req.user._id},{
              // $pullAll: { availabledates:removedate},
              //
              //
              // }).then(x=>{console.log(x);console.log('done')})
            } else {
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
              var dated = new Set(dates);
              var datees = new Set([...dated].filter((x) => !booked.has(x)));

              var dates = Array.from(datees);
              console.log(datees);
              console.log("-----");
              console.log(dates);
            }
          }
          console.log(dates);
          tp.dates = dates;
          tp.name = name;
          tp.city = city;
          tp.plans = plans;
          tp.cost = cost;
          tp.num_of_days = days;
          tp.guide = req.user.username;
          if (req.files[0].originalname !== "blob") {
            var i;
            var images = [];
            for (i = 0; i < req.files.length; i++) {
              var img = "/uploads/" + req.files[i].filename;
              var img_path = { img };
              images.push(img_path);
            }
            tp.images = images;
          }

          await tp.save();
          // console.log(tp)
          res.status(201).end();
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (e) {
      res.send(e);
    }
  }
);

router.get("/tour_plan", CheckGuide, (req, res) => {
  res.status(200).render("guides");
});

router.get("/tour_plan_details", CheckGuide, async (req, res) => {
  try {
    console.log(
      "-----------------------------------------Entered new page--------------------------"
    );
    var tour = await Tp.find({ guide: req.user.username })
      .sort({ _id: -1 })
      .limit(1);
    console.log(tour[0].plans);
    // var tour_plan =
    var tour_plan = JSON.stringify(tour);
    // var tour_plan = await Tp.find({ _id:tour[0]._id })
    console.log(tour_plan);
    res.status(200).render("detailed_view_of_tour_plan", { tour });
  } catch (e) {
    res.status(404).send(e);
  }
});

module.exports = router;
