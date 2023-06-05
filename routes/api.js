const Api = require("../models/apis");
const express = require("express");
const Guide = require("../models/Guide");
const News = require("../models/News");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { check, validationResult } = require("express-validator");
var urlencodedparser = bodyParser.urlencoded({ extended: false });
const API = require("../models/apis");
const TP = require("../models/tour_plans");
const nodemailer = require("nodemailer");
const axios = require("axios");

const router = new express.Router();

router.get("/checkAPI", async (req, res) => {
  try {
    let api_key = req.query.api;
    let result = Api.checkAPI(api_key);
    console.log(result);
    api = await API.find({ token: api_key });
    if (result.result === true && result.isexpired === false) {
      res.status(200).send(api);
    } else {
      throw "Please check your api and it's expiry date";
    }
  } catch (e) {
    res.status(400).send({ e });
  }
});

router.post(
  "/API",
  urlencodedparser,
  [
    check("plan").not().isEmpty().withMessage("Please select a plan i"),
    check("cost").not().isEmpty().withMessage("Please select a plan i"),
    check("type").not().isEmpty().withMessage("Please select a plan i"),
    check("email")
      .not()
      .isEmpty()
      .withMessage("Please enter your Email")
      .isEmail()
      .withMessage("Enter valid email-ID")
      .custom(async (value, { req }) => {
        var res = await API.findOne({
          email: value,
          type: req.body.type,
          time: req.body.plan,
        }).countDocuments();
        if (!res) {
          return false;
        }
      })
      .withMessage("You have already registered for the plan"),
  ],
  async (req, res) => {
    try {
      console.log(
        "----------------------------From main function----------------------"
      );
      console.log(req.body);
      const errors = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()) {
        console.log("Error found");
        return res.status(422).json(errors.array());
      } else {
        const api = new Api();
        api.email = req.body.email;
        api.price = req.body.cost;
        api.plan = req.body.plan;
        api.type = req.body.type;
        var current = new Date();
        if (req.body.plan === "monthly") {
          api.expiry = current.setMonth(current.getMonth() + 1);
        } else if (req.body.plan === "yearly") {
          api.expiry = current.setMonth(current.getMonth() + 12);
        }
        console.log(api);
        await api.save();
        // let result = await api.completeAPI()
        var smtpTransport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true, // use SSL
          auth: {
            user: "wandermate.help@gmail.com",
            pass: "wandermate123",
          },
        });
        var mailOptions = {
          to: api.email,
          from: "wandermate.help@gmail.com",
          subject: "API Conformation",
          text: `The request for your API is successful.\n These are the details of your API:\n
                                API:${api.token}\n
                                Subscription Date:${api.subscription_date}\n
                                Expiry Date:${api.expiry}\n
                                Type:${api.type}\n
                                Plan:${api.plan}\n
                                Price:${api.price}\n`,
        };
        smtpTransport.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            errors.errors.push(error);
            return res.status(400).json(errors.array());
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res.status(201).end();
      }
    } catch (e) {
      errors = {};
      console.log("------entered catch------");
      console.log(e);
      return res.status(400).json([{ msg: e.errmsg.toString() }]);
    }
  }
);

router.get("/pricing", (req, res) => {
  res.status(200).render("pricing");
});

router.get("/guides", async (req, res) => {
  try {
    if (req.query.api) {
      let api_key = req.query.api;
      let result = await Api.checkAPI(api_key);
      console.log(result);
      var final_guides = [];
      if (result.result === true && result.isexpired === false) {
        if (req.query.city) {
          let place = req.query.city;
          console.log(place);
          const guides = await Guide.find({ city: place });
          // console.log(guides)
          for (var i = 0; i < guides.length; i++) {
            var len = guides[i].plans.length;
            console.log(len);
            if (len > 0) {
              if (guides[i].plans[len - 1].plantype === "daylong") {
                final_guides.push(guides[i]);
              }
            }
          }
          console.log(final_guides);
          return res.status(200).send(final_guides);
        }
        const guides = await Guide.find({});
        for (var i = 0; i < guides.length; i++) {
          var len = guides[i].plans.length;
          if (guides[i].plans[len - 1] === "daylong") {
            final_guides.push(guides[i]);
          }
        }
        return res.status(200).send(final_guides);
      } else {
        throw "Please check your api and it's expiry date";
      }
    }
  } catch (e) {
    res.status(400).send([
      {
        error: e,
      },
    ]);
  }
});

router.post("/guides/book", async (req, res) => {
  try {
    console.log(req.query);
    let api_key = req.query.api;
    var g_id = req.query.guide_id;
    let result = await Api.checkAPI(api_key);
    let email = req.query.email;
    console.log(result);
    if (result.result === true && result.isexpired === false) {
      //Booking
      var guide = await Guide.find({ _id: g_id });
      guide = guide[0];
      console.log("Booking is done here");
      var dates = [];
      var da = req.query.dates.split("-");
      console.log(da);
      for (var i = 0; i < da.length; i++) {
        dates.push(da[i]);
      }
      console.log(dates);
      var url = "http://127.0.0.1:8001/gettransaction/"
        .concat("2")
        .concat("/password/")
        .concat(req.query.tranc_id);
      console.log(url);
      var status;
      axios
        .get(url)
        .then(async (response) => {
          // console.log(response)
          status = response.status;
          console.log(response.status);
          if (status === 200) {
            console.log("in here");
            // console.log(guide)
            for (var j = 0; j < guide.availabledates.length; j++) {
              for (var k = 0; k < dates.length; k++) {
                if (guide.availabledates[j].date === dates[k]) {
                  guide.availabledates[j].plantype = "booked";
                  guide.availabledates[j].totalbookings = 1;
                  var itemOne = {
                    users: { username: email, no_of_tourists: "5" },
                    date_n_time: { date: dates[k] },
                    type: "solo",
                    place: guide.city,
                    tot_no_of_tourits: 5,
                    current: true,
                    plan: "daylong",
                  };
                  guide.booking.push(itemOne);
                  await guide.save();
                }
              }
            }
            var smtpTransport = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true, // use SSL
              auth: {
                user: "wandermate.help@gmail.com",
                pass: "wandermate123",
              },
            });

            var mailOptions = {
              to: req.query.email,
              from: "wandermate.help@gmail.com",
              subject: "Conformation",
              text: `booking confirmed under guide:${guide.name}`,
            };
            smtpTransport.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
            console.log("hey there!");
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      console.log(status);
    }
    res.status(200).send("Worked");
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/plans", async (req, res) => {
  try {
    if (req.query.api) {
      let api_key = req.query.api;
      let result = await Api.checkAPI(api_key);
      console.log(result);
      if (result.result === true && result.isexpired === false) {
        if (req.query.city) {
          var final_array = [];
          let date = req.query.date;
          // console.log(date)
          let place = req.query.city;
          const tps = await TP.find({ city: place });
          // console.log(tps)
          for (let i = 0; i < tps.length; i++) {
            for (let j = 0; j < tps[i].dates.length; j++) {
              if (date === tps[i].dates[j]) {
                final_array.push(tps[i]);
                break;
              }
            }
          }
          return res.status(200).send(final_array);
        }
        const tps = await TP.find({});
        return res.status(200).send(tps);
      } else {
        throw "Please check your api and it's expiry date";
      }
    }
  } catch (e) {
    res.status(400).send([
      {
        error: e,
      },
    ]);
  }
});

router.post("/tour/book", async (req, res) => {
  try {
    if (req.query.api) {
      let api_key = req.query.api;
      let result = await Api.checkAPI(api_key);
      console.log(result);
      if (result.result === true && result.isexpired === false) {
        console.log("Booking is done here");
        console.log(req.body);
        console.log(req.query);
        var final_array = [];
        let date = req.query.date;
        const email = req.query.email;
        // console.log(date)
        let id = req.query.plan_id;
        const tps = await TP.find({ _id: id });
        // console.log(tps)
        console.log(tps);
        var url = "http://127.0.0.1:8001/gettransaction/"
          .concat("2")
          .concat("/password/")
          .concat(req.query.tranc_id);
        console.log(url);
        var status;
        axios
          .get(url)
          .then(async (response) => {
            // console.log(response)
            status = response.status;
            console.log(response.status);
            if (status === 200) {
              console.log("in here");
              // console.log(guide)
              var itemOne = {
                users: { username: email },
                date_n_time: { date: date },
                place: tps[0].city,
                days: tps[0].num_of_days,
                current: true,
                plan: "tourplan",
                planid: tps[0]._id,
              };
              var d = new Date(date);

              Guide.updateOne(
                { username: tps[0].guide },
                { $push: { booking: itemOne } },
                function () {}
              );

              TP.find({ guide: tps[0].guide })
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
                        yr1.toString() +
                        "/" +
                        m1.toString() +
                        "/" +
                        d1.toString();
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
                        yr1.toString() +
                        "/" +
                        m1.toString() +
                        "/" +
                        d1.toString();
                      console.log(date2);
                      if (all_data[k].dates.includes(date2)) {
                        console.log("date found");
                        all_data[k].dates.pull(date2);
                      }
                    }
                    all_data[k].dates.pull(date);
                    console.log("all sat------------------");
                    console.log(all_data[k]);
                    TP.updateOne(
                      { _id: all_data[k]._id },
                      all_data[k],
                      function () {}
                    );
                  }
                });
              var smtpTransport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // use SSL
                auth: {
                  user: "wandermate.help@gmail.com",
                  pass: "wandermate123",
                },
              });

              var mailOptions = {
                to: req.query.email,
                from: "wandermate.help@gmail.com",
                subject: "Conformation",
                text: `booking confirmed on ${date}.\n
                                Plan Details:\n
                                plan-id:${tps[0]._id}
                                guide:${tps[0].guide}
                                city:${tps[0].city}
                                cost:${tps[0].cost}`,
              };
              smtpTransport.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                }
              });
              console.log("hey there!");
              return res.status(200).send("Worked");
            }
          })
          .catch(function (error) {
            console.log(error);
            res.status(400);
          });
      } else {
        throw "Please check your api and it's expiry date";
      }
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/news", async (req, res) => {
  try {
    if (req.query.api) {
      let api_key = req.query.api;
      let result = await Api.checkAPI(api_key);
      console.log(result);
      if (result.result === true && result.isexpired === false) {
        const news = await News.find({
          time: { $gt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        }).sort({ array_length: -1 });
        for (var n = 0; n < news.length; n++) {
          s = "";
          p1 = news[n]["news"].length - 1;
          p2 = 0;
          for (s = 0; s < news[n]["news"].length; s++) {
            if (news[n]["news"][s] == '"') {
              p1 = s;
            }
            if (news[n]["news"][s] == ":") {
              p2 = s;
            }
          }
          news[n]["news"] = news[n]["news"].slice(p2 + 2, p1 - 2);
        }
        console.log(news);
        return res.status(200).send(news);
      } else {
        throw "Please check your api and it's expiry date";
      }
    }
  } catch (e) {
    res.status(400).send([
      {
        error: e,
      },
    ]);
  }
});

function fidn_tw(doc) {
  var dlength = doc.length;
  var temp_array = new Array(dlength).fill(0);
  var dict = new Object();
  for (var i = 0; i < dlength; i++) {
    var data = doc[i]["news"];
    data = data.toLowerCase().split(" ");
    for (var d = 0; d < data.length; d++) {
      if (data[d] in dict) {
        dict[data[d]][i] += 1;
      } else {
        temp = temp_array.slice(0, dlength);
        dict[data[d]] = temp;
        dict[data[d]][i] += 1;
      }
    }
  }
  return dict;
}

function find_doc_vectors(dict, doc) {
  var wlength = Object.keys(dict).length;
  var temp_array = new Array(wlength).fill(0);
  var doc_vectors = new Object();
  words = Object.keys(dict);
  for (var i = 0; i < doc.length; i++) {
    temp = temp_array.slice(0, wlength);
    for (var w = 0; w < wlength; w++) {
      temp[w] = dict[words[w]][i];
    }
    doc_vectors[doc[i]["_id"]] = temp;
  }
  return doc_vectors;
}

function distance(A, B) {
  var dotproduct = 0;
  var mA = 0;
  var mB = 0;
  for (i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  var similarity = dotproduct / (mA * mB);
  return similarity;
}

function find_clusters(doc_vectors, k, wlength, docs) {
  var temp_array = new Array(wlength).fill(0);
  var clusters = new Array(k);
  var means = new Array(k);
  temp_docs = docs.slice(0, docs.length);
  for (var i = 0; i < k; i++) {
    var pos = Math.floor(Math.random() * docs.length);
    var rand = docs[pos]["_id"];
    docs.splice(pos, 1);
    means[i] = doc_vectors[rand];
  }

  var dlength = Object.keys(doc_vectors).length;
  var tab = new Array(dlength);
  for (var i = 0; i < dlength; i++) {
    var dist = 0.0;
    var pos = -1;
    for (var j = 0; j < means.length; j++) {
      d = distance(doc_vectors[temp_docs[i]["_id"]], means[j]);
      if (dist <= d) {
        dist = d;
        pos = j;
      }
    }
    tab[i] = pos;
  }
  var ptab = tab.slice(0, tab.length);
  while (true) {
    for (var i = 0; i < means.length; i++) {
      sum = new Array(wlength).fill(0);
      no = 0;
      for (var j = 0; j < tab.length; j++) {
        if (tab[j] == i) {
          no++;
          // sum=      doc_vectors[temp_docs[i]["id"]]
          for (var w = 0; w < wlength; w++) {
            sum[w] += doc_vectors[temp_docs[j]["_id"]][w];
          }
        }
      }
      if (no != 0) {
        for (var w = 0; w < wlength; w++) {
          sum[w] = sum[w] / no;
        }
      }
      means[i] = sum.slice(0, wlength);
    }

    // -----------

    dlength = Object.keys(doc_vectors).length;
    tab = new Array(dlength);
    for (var i = 0; i < dlength; i++) {
      var dist = 0.0;
      var pos = -1;
      for (var j = 0; j < means.length; j++) {
        d = distance(doc_vectors[temp_docs[i]["_id"]], means[j]);
        if (dist <= d) {
          dist = d;
          pos = j;
        }
      }
      tab[i] = pos;
    }
    if (JSON.stringify(ptab) == JSON.stringify(tab)) {
      // console.log(tab,means);
      return [tab, means];
    }
    ptab = tab.slice(0, tab.length);
  }
}

function find_headings(clusters, docs, doc_vectors, k) {
  var headings = new Array(k);
  var hash = new Array(k);
  for (var i = 0; i < k; i++) {
    var dist = 0.0;
    var pos = -1;
    te = 0;
    for (var j = 0; j < docs.length; j++) {
      // console.log(clusters[0][j],i,docs.length)
      if (clusters[0][j] == i) {
        te++;
        d = distance(doc_vectors[temp_docs[j]["_id"]], clusters[1][i]);
        if (d >= dist) {
          dist = d;
          pos = j;
        }
      }
    }
    hash[i] = te;
    headings[i] = docs[pos]["title"];
  }
  console.log(headings);
  return [headings, hash];
}

function find_trend(k, doc) {
  if (k > doc.length) {
    k = doc.length;
  }
  var dict = fidn_tw(doc);
  var doc_vectors = find_doc_vectors(dict, doc);
  var clusters = find_clusters(
    doc_vectors,
    k,
    Object.keys(dict).length,
    doc.slice(0, doc.length)
  );
  var trend = find_headings(clusters, doc, doc_vectors, k);
  return trend;
  return 0;
}

var doc = [
  {
    id: 1,
    heading: 1,
    description: "dindi sai karthik",
  },
  {
    id: 2,
    heading: 2,
    description: "hello friends chai peelo",
  },
  {
    id: 3,
    heading: 3,
    description: "please dont call me",
  },
  {
    id: 4,
    heading: 4,
    description: "call me twice",
  },
  {
    id: 5,
    heading: 5,
    description: "call me please",
  },
  {
    id: 6,
    heading: 6,
    description: "say me some thing",
  },
  {
    id: 7,
    heading: 7,
    description: "some value how good are you",
  },
  {
    id: 8,
    heading: 8,
    description: "some value hello there",
  },
];

// find_trend(5,doc)

router.get("/trending", async (req, res) => {
  try {
    if (req.query.api) {
      let api_key = req.query.api;
      let result = await Api.checkAPI(api_key);
      console.log(result);
      if (result.result === true && result.isexpired === false) {
        var clus = parseInt(req.query.clus);
        var news = await News.find({
          time: { $gt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        }).sort({ array_length: -1 });
        for (var n = 0; n < news.length; n++) {
          s = "";
          p1 = news[n]["news"].length - 1;
          p2 = 0;
          for (s = 0; s < news[n]["news"].length; s++) {
            if (news[n]["news"][s] == '"') {
              p1 = s;
            }
            if (news[n]["news"][s] == ":") {
              p2 = s;
            }
          }
          news[n]["news"] = news[n]["news"].slice(p2 + 2, p1);
        }
        console.log(news);

        var re = find_trend(clus, news);
        // console.log(re)
        result = { re: re };
        return res.status(200).send(result);
      } else {
        throw "Please check your api and it's expiry date";
      }
    }
  } catch (e) {
    res.status(400).send([
      {
        error: e,
      },
    ]);
  }
});

// router.get('/guides_place',async (req,res) => {
//     try{
//     let place = req.query.city
//     let api_key = req.query.api
//     let result = await Api.checkAPI(api_key)
//     console.log(result.result)
//     if(result.result === false){
//         throw "Please check your api and it's expiry date"
//     }
//     if(result.result === true && result.isexpired === false){
//         const guides = await Guide.find({ city:place })
//         res.status(200).send(guides)
//     }
//     else{
//         throw "Please check your api and it's expiry date"
//     }
//     }catch(e){
//         res.status(400).send([{
//             error : e
//         }])
//     }
// })

module.exports = router;
