const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const Guides = require("../models/Guide");
const User = require("../models/User");
const Tour_plans = require("../models/tour_plans");
const Chatingdata = require("../models/Chatingdata");
var events = require("events");
var eventEmitter = new events.EventEmitter();

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

router.get("/", CheckUser, function (req, res) {
  res.render("place", { user: req.user, places: places });
});

ObjectId = require("mongodb").ObjectId;

router.post("/tripplan", CheckUser, urlencodedParser, function (req, res) {
  data_form = req.body;
  console.log(
    "--------------------------------------------------------------------------------------------------------------"
  );
  console.log(data_form);
  Tour_plans.findOne({ _id: ObjectId(data_form.plans_id) })
    .catch((err) => {
      console.log(err);
    })
    .then((data) => {
      console.log("we");
      console.log(data_form);
      var date = data_form.date;
      console.log(date);
      console.log(typeof date);
      var d = new Date(date);

      var itemOne = {
        users: { username: req.user.username },
        date_n_time: { date: data_form.date },
        place: data.city,
        days: data.num_of_days,
        current: true,
        plan: "tourplan",
        planid: data._id,
      };

      var chat = new Chatingdata({
        username: req.user.username,
        guidename: data.guide,
        messages: [],
      });
      chat.save();
      Guides.updateOne(
        { username: data.guide },
        { $push: { booking: itemOne } },
        function () {}
      );

      var itemOne1 = {
        guide: data.guide,
        date_n_time: { date: data_form.date },
        place: data.city,
        days: data.num_of_days,
        current: true,
        plan: "tourplan",
        planid: data._id,
      };

      User.updateOne(
        { username: req.user.username },
        { $push: { booking: itemOne1 } },
        function () {}
      );

      Tour_plans.find({ guide: data.guide })
        .catch((err) => {
          console.log(err);
        })
        .then((all_data) => {
          for (var k = 0; k < all_data.length; k++) {
            console.log("k value");
            console.log(k);
            for (var j = 0; j < all_data[k].num_of_days; j++) {
              console.log("j value");
              console.log(j);
              console.log(d);
              var next = new Date(d);
              next.setDate(d.getDate() + j);
              console.log(next);
              var m1, d1, yr1;

              yr1 = next.getFullYear();
              m1 = next.getMonth() + 1;
              if (m1 < 10) {
                m1 = "0" + m1;
              }
              d1 = next.getDate();
              if (d1 < 10) {
                d1 = "0" + d1;
              }
              var date1 =
                yr1.toString() + "/" + m1.toString() + "/" + d1.toString();
              console.log(date1);
              if (all_data[k].dates.includes(date1)) {
                console.log("date found");
                all_data[k].dates.pull(date1);
              }

              var prev = new Date(d);
              prev.setDate(d.getDate() - j);
              console.log(next);

              yr1 = prev.getFullYear();
              m1 = prev.getMonth() + 1;
              if (m1 < 10) {
                m1 = "0" + m1;
              }
              d1 = prev.getDate();
              if (d1 < 10) {
                d1 = "0" + d1;
              }
              date2 =
                yr1.toString() + "/" + m1.toString() + "/" + d1.toString();
              console.log(date2);
              if (all_data[k].dates.includes(date2)) {
                console.log("date found");
                all_data[k].dates.pull(date2);
              }
            }
            all_data[k].dates.pull(date);
            console.log("all sat------------------");
            console.log(all_data[k]);
            Tour_plans.updateOne(
              { _id: all_data[k]._id },
              all_data[k],
              function () {}
            );
          }
        });
    });

  res.redirect("/users#currentbookings");
});

var data;
var value_form;
var place_id;
router.get("/form", CheckUser, function (req, res) {
  console.log(req.url);

  if (data == undefined) {
    res.render("form", { user: req.user, guides: false, value: false });
    place_id = req.query.id;
    place_id = place_id.toLowerCase();
  } else {
    value_form = data;
    data = undefined;

    if (value_form.type == "solo") {
      Guides.find(
        {
          $and: [
            { "availabledates.plantype": "singleplace" },
            { "availabledates.location": place_id },
            { "availabledates.date": value_form.date },
            { "availabledates.time.count": 0 },
            { "availabledates.time.slot": value_form.slot },
          ],
        },
        function (err, guides) {
          if (err) {
            console.log(err);
          } else {
            console.log(guides);
            var guides_count = [];
            var time = undefined;
            var i, j, k, b;
            for (i = 0; i < guides.length; i++) {
              var count = guides[i].limit - value_form.number;
              console.log(count);
              if (count >= 0) {
                for (j = 0; j < guides[i].availabledates.length; j++) {
                  if (
                    guides[i].availabledates[j].date == value_form.date &&
                    guides[i].availabledates[j].plantype == "singleplace" &&
                    guides[i].availabledates[j].location == place_id
                  ) {
                    var slots = guides[i].availabledates[j].time;
                    for (k = 0; k < slots.length; k++) {
                      if (
                        slots[k].count == 0 &&
                        slots[k].slot == value_form.slot
                      ) {
                        if (time == undefined) {
                          time = [];
                          time.push(slots[k].timeslot);
                        } else {
                          time.push(slots[k].timeslot);
                        }
                      }
                    }
                  }
                }
              }
              if (time) {
                guides_count.push({
                  name: guides[i].username,
                  time: time,
                  guide: guides[i],
                });
                time = undefined;
              }
            }
            console.log(guides_count);
            res.render("form", {
              user: req.user,
              guides: guides_count,
              value: value_form,
            });
          }
        }
      );
    }

    if (value_form.type == "group") {
      Guides.find(
        {
          $and: [
            { "availabledates.plantype": "singleplace" },
            { "availabledates.location": place_id },
            { "availabledates.date": value_form.date },
            { "availabledates.time.count": { $ne: -1 } },
            { "availabledates.time.slot": value_form.slot },
          ],
        },
        function (err, guides) {
          if (err) {
            console.log(err);
          } else {
            console.log(guides);
            var guides_count = [];
            var time = undefined;
            var i, j, k, b;
            for (i = 0; i < guides.length; i++) {
              var no = guides[i].limit - value_form.number;
              for (j = 0; j < guides[i].availabledates.length; j++) {
                if (
                  guides[i].availabledates[j].date == value_form.date &&
                  guides[i].availabledates[j].plantype == "singleplace" &&
                  guides[i].availabledates[j].location == place_id
                ) {
                  var slots = guides[i].availabledates[j].time;
                  for (k = 0; k < slots.length; k++) {
                    if (
                      slots[k].slot == value_form.slot &&
                      slots[k].count <= no
                    ) {
                      if (time == undefined) {
                        time = [];
                        time.push(slots[k].timeslot);
                      } else {
                        time.push(slots[k].timeslot);
                      }
                    }
                  }
                }
              }

              if (time) {
                guides_count.push({
                  name: guides[i].username,
                  time: time,
                  guide: guides[i],
                });
                time = undefined;
              }
            }

            res.render("form", {
              user: req.user,
              guides: guides_count,
              value: value_form,
            });
          }
        }
      );
    }
  }
});

router.post("/form", CheckUser, urlencodedParser, function (req, res) {
  data = req.body;
  console.log(data);
  res.redirect("/place/form");
});

router.post("/booked", CheckUser, function (req, res) {
  var guide_info = req.body;

  console.log(guide_info);
  console.log(value_form);
  console.log(place_id);

  if (value_form.type == "solo") {
    Guides.find({ username: guide_info.name }, function (err, guides) {
      if (err) {
        console.log(err);
      } else {
        var chat = new Chatingdata({
          username: req.user.username,
          guidename: guides[0].username,
          messages: [
            {
              text: "Hello this is " + req.user.username,
              sentby: "user",
              time: new Date(),
            },
          ],
        });
        chat.save();

        var guide = guides[0];
        var check;
        var j;
        for (j = 0; j < guide.availabledates.length; j++) {
          if (
            guide.availabledates[j].date == value_form.date &&
            guide.availabledates[j].plantype == "singleplace"
          ) {
            var slots = guide.availabledates[j].time;
            var i;
            for (i = 0; i < slots.length; i++) {
              if (
                slots[i].timeslot == guide_info.time &&
                slots[i].slot == value_form.slot
              ) {
                console.log("yes");
                guide.availabledates[j].totalbookings =
                  guide.availabledates[j].totalbookings + 1;
                slots.splice(i, 1);
                check = 1;
                i = i - 1;
                break;
              }
            }
            if (check == 1) {
              break;
            }
          }
        }

        var itemOne = {
          users: {
            username: req.user.username,
            no_of_tourists: value_form.number,
          },
          date_n_time: {
            date: value_form.date,
            slot: value_form.slot,
            time: guide_info.time,
          },
          type: "solo",
          place: place_id,
          tot_no_of_tourits: value_form.number,
          current: true,
          plan: "singleplace",
        };

        guide.booking.push(itemOne);

        itemOne = {
          guide: guide.username,
          date_n_time: {
            date: value_form.date,
            slot: value_form.slot,
            time: guide_info.time,
          },
          type: "solo",
          place: place_id,
          tot_no_of_tourits: value_form.number,
          current: true,
          plan: "singleplace",
        };

        console.log(req.user.username);
        User.updateOne(
          { username: req.user.username },
          { $push: { booking: itemOne } },
          function () {}
        );

        var myquery = { username: guide_info.name };
        var newvalues = { $set: guides[0] };
        Guides.updateOne(myquery, newvalues, function (err, res) {
          if (err) throw err;
          console.log("1 document updated");
        });
      }
    });
  }

  if (value_form.type == "group") {
    Guides.find({ username: guide_info.name }, function (err, guides) {
      if (err) {
        console.log(err);
      } else {
        var guide = guides[0];
        var check;
        var j;
        for (j = 0; j < guide.availabledates.length; j++) {
          if (
            guide.availabledates[j].date == value_form.date &&
            guide.availabledates[j].plantype == "singleplace"
          ) {
            var slots = guide.availabledates[j].time;
            var i;
            for (i = 0; i < slots.length; i++) {
              if (
                slots[i].timeslot == guide_info.time &&
                slots[i].slot == value_form.slot
              ) {
                console.log("yes");
                guide.availabledates[j].totalbookings =
                  guide.availabledates[j].totalbookings + 1;
                slots[i].count = slots[i].count + parseInt(value_form.number);
                check = 1;
                i = i - 1;
                break;
              }
            }
            if (check == 1) {
              break;
            }
          }
        }

        //current==true and plan
        var added = 0;
        for (var k = 0; k < guide.booking.length; k++) {
          console.log(guide.booking[k]);
          if (
            guide.booking[k].type == "group" &&
            guide.booking[k].date_n_time.date == value_form.date &&
            guide.booking[k].date_n_time.slot == value_form.slot &&
            guide.booking[k].date_n_time.time == guide_info.time
          ) {
            console.log("no");
            guide.booking[k].users.push({
              username: "current_user",
              no_of_tourists: value_form.number,
            });
            guide.booking[k].tot_no_of_tourits =
              guide.booking[k].tot_no_of_tourits + value_form.number;
            added = 1;
          }
        }
        if (added == 0) {
          var itemOne = {
            users: {
              username: req.user.username,
              no_of_tourists: value_form.number,
            },
            date_n_time: {
              date: value_form.date,
              slot: value_form.slot,
              time: guide_info.time,
            },
            type: "group",
            place: place_id,
            tot_no_of_tourits: value_form.number,
            current: true,
            plan: "singleplace",
          };

          guide.booking.push(itemOne);
        }
        itemOne = {
          guide: guide.username,
          date_n_time: {
            date: value_form.date,
            slot: value_form.slot,
            time: guide_info.time,
          },
          type: "solo",
          place: place_id,
          tot_no_of_tourits: value_form.number,
          current: true,
          plan: "singleplace",
        };

        var chat = new Chatingdata({
          username: req.user.username,
          guidename: guide.username,
          messages: [],
        });
        chat.save();

        User.updateOne(
          { username: req.user.username },
          { $push: { booking: itemOne } },
          function () {}
        );

        var myquery = { username: guide_info.name };
        var newvalues = { $set: guides[0] };
        Guides.updateOne(myquery, newvalues, function (err, res) {
          if (err) throw err;
          console.log("1 document updated");
        });
      }
    });

    //
    // var itemOne = Bookings({place:place_id,user:{user:'current_user',number:value_form.number},guide:req.body.submit,date:{date:value_form.date,slot:value_form.slot,time:guide_info.time}}).save(function(err){
    //    if (err) throw err;
    //    console.log("saved");
    //  })
  }

  res.redirect("/users#currentbookings");
});

var data_city;
var value_form_city;
var city_id;
router.get("/form_city", CheckUser, function (req, res) {
  console.log(req.url);
  console.log(data_city);

  if (data_city == undefined) {
    res.render("form_city", { user: req.user, guides: false, value: false });
    city_id = req.query.id;
    city_id = city_id.toLowerCase();
  } else {
    value_form_city = data_city;
    data_city = undefined;
    console.log(value_form_city);
    console.log("fghj");

    Guides.find(
      {
        $and: [
          { "availabledates.plantype": "daylong" },
          { "availabledates.date": value_form_city.date },
          { "availabledates.location": city_id },
        ],
      },
      function (err, guides) {
        if (err) {
          console.log(err);
        } else {
          var guides_count = [];
          var i, j, k, b;
          for (i = 0; i < guides.length; i++) {
            // var count = guides[i].limit - value_form.number    //limit in availabledates

            for (j = 0; j < guides[i].availabledates.length; j++) {
              if (
                guides[i].availabledates[j].date == value_form_city.date &&
                guides[i].availabledates[j].plantype == "daylong" &&
                guides[i].limit >= value_form_city.number &&
                guides[i].availabledates[j].location == city_id
              ) {
                guides_count.push({
                  name: guides[i].username,
                  time: false,
                  pic: guides[i].img.path,
                });
              }
            }
          }
          res.render("form_city", {
            user: req.user,
            guides: guides_count,
            value: value_form_city,
          });
        }
      }
    );
  }
});

router.post("/form_city", CheckUser, urlencodedParser, function (req, res) {
  data_city = req.body;
  console.log(data_city);
  res.redirect("/place/form_city");
});

router.post("/booked_city", CheckUser, function (req, res) {
  var guide_info = req.body;

  console.log(guide_info);
  console.log(value_form_city);
  console.log(city_id);

  Guides.find({ username: guide_info.name }, function (err, guides) {
    if (err) {
      console.log(err);
    } else {
      var guide = guides[0];
      var check;
      var j;
      for (j = 0; j < guide.availabledates.length; j++) {
        if (
          guide.availabledates[j].date == value_form_city.date &&
          guide.availabledates[j].plantype == "daylong"
        ) {
          guide.availabledates[j].plantype = "booked_city";
          guide.availabledates[j].totalbookings =
            parseInt(guide.availabledates[j].totalbookings) + 1;
        }
      }

      var itemOne = {
        users: {
          username: req.user.username,
          no_of_tourists: value_form_city.number,
        },
        date_n_time: { date: value_form_city.date },
        type: "solo",
        place: city_id,
        tot_no_of_tourits: value_form_city.number,
        current: true,
        plan: "daylong",
      };

      guide.booking.push(itemOne);

      var myquery = { username: guide_info.name };
      var newvalues = { $set: guides[0] };
      Guides.updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
      });

      var itemOne1 = {
        guide: guide.username,
        date_n_time: { date: value_form_city.date },
        type: "solo",
        place: city_id,
        tot_no_of_tourits: value_form_city.number,
        current: true,
        plan: "daylong",
      };

      User.updateOne(
        { username: req.user.username },
        { $push: { booking: itemOne1 } },
        function () {}
      );
    }
  });
  res.redirect("/users#currentbookings");
});

module.exports = router;
