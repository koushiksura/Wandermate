const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const expressValidator = require("express-validator");
const session = require("express-session");
const flash = require("connect-flash");
var multer = require("multer");
var passport = require("passport");
let Placeinfo = require("./models/Placeinfo");
let Tour_plans = require("./models/tour_plans");
let Guides = require("./models/Guide");
let News = require("./models/News");
let WishList = require("./models/WishList");
let Chatingdata = require("./models/Chatingdata");
const socketio = require("socket.io");
const http = require("http");
let User = require("./models/User");

var cookieParser = require("cookie-parser");
var app = express();
//EJS
const server = http.createServer(app);
const io = socketio(server);
io.origins("*:*");

app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.static("./static"));
app.use("/uploads", express.static("./uploads"));
app.use(express.static("./uploads"));
app.use("/styles", express.static("styles"));

//db congif
var urlencodedparser = bodyparser.urlencoded({ extended: true, limit: "50mb" });
app.use(bodyparser.json({ limit: "50mb" }));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(urlencodedparser);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now() + ".jpeg");
  },
});

app.use(multer({ storage: storage }).any());

db = require("./config/keys").MongoURI;

//connect to mong
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));

//Routes

app.use("/users", require("./routes/users"));
app.use("/guides", require("./routes/guide"));
app.use("/tours", require("./routes/tour_guide"));
app.use("/place", require("./routes/place"));
app.use("/blog", require("./routes/blog"));
app.use("/pricing", require("./routes/api"));
app.use("/admin", require("./routes/admin"));
app.use("/", require("./routes/landing"));
app.use("/wanderlist", require("./routes/wishlist"));

const Suggestions = require("./models/Suggestion");

app.get("/places/:name", function (req, res) {
  function sort(arr, dict) {
    if (!Object.keys(dict).length) {
      for (var i = 0; i < arr.length; i++) {
        dict[arr[i]] = 1;
      }
      return dict;
    }
    for (i = 0; i < arr.length; i++) {
      for (var k in dict) {
        if (k === arr[i]) {
          dict[arr[i]] += 1;
        } else {
          var flag = 0;
          for (var k in dict) {
            if (k == arr[i]) {
              flag = 1;
            }
          }
          if (flag == 0) {
            dict[arr[i]] = 1;
          }
        }
      }
    }
    return dict;
  }
  var arr = [];
  var fml = [];
  var dict = {};

  var place = req.params.name.toLowerCase();
  console.log("main");
  console.log(place);
  var item = [];
  Suggestions.find({}, function (err, sug) {
    console.log("main1");
    console.log(sug);
    for (i = 0; i < sug.length; i++) {
      fml = Object.values(sug[i]);
      fml = fml[fml.length - 3];
      fml = Object.values(fml);
      for (j = 0; j < fml.length; j++) {
        if (place == fml[2][j]) {
          // push into array
          arr.push(fml[2]);
        }
      }
    }
    for (i = 0; i < arr.length; i++) {
      dict = sort(arr[i], dict);
    }
    delete dict[place];

    var items = Object.keys(dict).map(function (key) {
      return [key, dict[key]];
    });

    // Sort the array based on the second element
    items.sort(function (first, second) {
      return second[1] - first[1];
    });

    // Create a new array with only the first 5 items
    console.log("heyy");
    console.log(items.slice(0, 5));
    items = items.slice(0, 5);

    for (var i = 0; i < items.length; i++) {
      item.push(items[i][0]);
    }
  });

  console.log("here");
  Placeinfo.findOne({ name: req.params.name }, function (err, places) {
    if (err) {
      console.log(err);
    } else {
      console.log("camee");

      Tour_plans.find({ city: req.params.name }, function (err, plans) {
        if (err) {
          console.log(err);
        } else {
          var plans = plans;
          // console.log(plans.length)
          // for(var i=0;i<plans.length;i++){
          //   console.log('------------')
          //   console.log(plans[i]._id);
          //   var dates=[]
          //   num_of_days=plans[i].num_of_days
          //   console.log(num_of_days)
          //   Guides.findOne({"availabledates.planid":'5dd0a1783691d951dc5ba363'},function(err,guide){
          //     if(err){
          //       console.log(err);
          //     }else{
          //       console.log(guide);
          //       if(guide){
          //         console.log(guide.name);
          //         console.log(i);
          //         console.log('roshan');
          //
          //       for (var j=0;j<guide.availabledates.length;j++){
          //         if(guide.availabledates[j].plantype=='owntrip' && guide.availabledates[j].totalbookings=='0'){
          //           console.log(guide.availabledates[j].date)
          //           dates.push(guide.availabledates[j].date)
          //         }
          //       }
          //       console.log('dtaes');
          //       console.log(dates);
          //
          //       avail=[]
          //
          //       function check(d1,d2){
          //         var today= new Date(d1);
          //
          //         var x= today.getFullYear().toString()+'/'+((today.getMonth()+1)<10?'0'+(today.getMonth()+1).toString():(today.getMonth()+1).toString())+'/'+(today.getDate()<10?'0'+(today.getDate()).toString():(today.getMonth()).toString())
          //         console.log(x);
          //
          //         var next = new Date();
          //         next.setDate(today.getDate()+num_of_days-1);
          //         var y=next.getFullYear().toString()+'/'+(next.getMonth()+1).toString()+'/'+next.getDate().toString()
          //         console.log(y);
          //
          //         if(today.getFullYear()==d1.getFullYear() && today.getMonth()==d1.getMonth() && today.getDate()==d1.getDate()){
          //           console.log('asdfghj');
          //           avail.push({start:'x',end:'y'})
          //           return true
          //         }
          //       }
          //
          //
          //       for(var k=0;k<dates.length-num_of_days+1;k++){
          //         console.log(j);
          //         console.log((new Date(dates[k])));
          //         console.log((new Date(dates[k+num_of_days-1])));
          //         console.log(check(new Date(dates[k]), new Date(dates[k+num_of_days-1])))
          //         console.log('done');
          //
          //       }
          //     }
          //     }
          //   })
          // }
          //
          //

          console.log("cgdjgvjywegdvjgwekvgbwevbwekugvuegviegvegvukgewkug");
          console.log(plans);

          Guides.find(
            { city: req.params.name.toLowerCase() },
            function (err, guides) {
              if (err) {
                console.log(err);
              } else {
                News.find({ place: req.params.name }, function (err, news) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(places);
                    console.log("kjbkb");
                    console.log(item);
                    WishList.find(
                      { username: req.user.name },
                      function (err, boards) {
                        if (boards.length != 0) {
                          console.log(boards[0]);
                          var boardslist = [];
                          var placenames = [];
                          for (var i = 0; i < boards[0].boards.length; i++) {
                            boardslist.push(boards[0].boards[i].boardname);
                            console.log(boards[0].boards[i].list);
                            console.log();
                            for (
                              var j = 0;
                              j < boards[0].boards[i].list.length;
                              j++
                            ) {
                              placenames.push(boards[0].boards[i].list[j].name);
                            }
                          }
                          console.log(boardslist);
                          console.log(placenames);
                          var citynames = [];
                          var mat = [];
                          console.log("_________");
                          console.log(citynames);
                          Placeinfo.find({}, function (err, places) {
                            //console.log(places)
                            for (var i = 0; i < places.length; i++) {
                              citynames.push(places[i].name);
                            }
                          });
                          console.log("_________");
                          console.log(citynames);
                          var ind;
                          User.find({}, function (err, users) {
                            //console.log(users);
                            for (var i = 0; i < users.length; i++) {
                              var temp = new Array(citynames.length).fill(0);
                              if (req.user.name === users[i].name) {
                                ind = i;
                              }
                              for (
                                var j = 0;
                                j < users[i].booking.length;
                                j++
                              ) {
                                if (users[i].booking[j].plan === "daylong") {
                                  if (
                                    citynames.includes(
                                      users[i].booking[j].place
                                    )
                                  ) {
                                    temp[
                                      citynames.indexOf(
                                        users[i].booking[j].place
                                      )
                                    ] = 1;
                                  }
                                }
                              }
                              mat.push(temp);
                              console.log("_________");
                              console.log(temp);
                            }
                            // const result = recommend.cFilter(mat, ind);
                            var recomendations = [];
                            console.log("_________");
                            console.log(citynames);
                            for (var i = 0; i < result.length; i++) {
                              recomendations.push(citynames[result[i]]);
                            }
                            console.log(recomendations);
                            for (var i = 0; i < citynames.length; i++) {
                              if (recomendations.includes(citynames[i])) {
                                arr.splice(i, 1);
                                i--;
                              }
                            }
                            res.render("main", {
                              user: req.user,
                              places: places,
                              plans: plans,
                              guides: guides,
                              news: news,
                              sugg: item,
                              boards: boardslist,
                              placenames: placenames,
                              recomendations: recomendations,
                              citynames: citynames,
                            });
                          });
                        } else {
                          var placenames = [];
                          var mat = [];
                          console.log("_________");
                          console.log(placenames);
                          Placeinfo.find({}, function (err, places) {
                            //console.log(places)
                            for (var i = 0; i < places.length; i++) {
                              placenames.push(places[i].name);
                            }
                          });
                          console.log("_________");
                          console.log(placenames);
                          var ind;
                          User.find({}, function (err, users) {
                            //console.log(users);
                            for (var i = 0; i < users.length; i++) {
                              var temp = new Array(placenames.length).fill(0);
                              if (req.user.name === users[i].name) {
                                ind = i;
                              }
                              for (
                                var j = 0;
                                j < users[i].booking.length;
                                j++
                              ) {
                                if (
                                  users[i].booking[j].plan === "daylong" ||
                                  users[i].booking[j].plan === "daylong"
                                ) {
                                  if (
                                    placenames.includes(
                                      users[i].booking[j].place
                                    )
                                  ) {
                                    temp[
                                      placenames.indexOf(
                                        users[i].booking[j].place
                                      )
                                    ] = 1;
                                  }
                                }
                              }
                              mat.push(temp);
                              console.log("_________");
                              console.log(temp);
                            }
                            const result = recommend.cFilter(mat, ind);
                            var recomendations = [];
                            console.log("_________");
                            console.log(placenames);
                            for (var i = 0; i < result.length; i++) {
                              recomendations.push(placenames[result[i]]);
                            }
                            console.log(recomendations);
                            // for(var i=0;i<citynames.length;i++){
                            //   if(recomendations.includes(citynames[i])){
                            //     arr.splice(i, 1);
                            //     i--;
                            //   }
                            // }
                            res.render("main", {
                              user: req.user,
                              places: places,
                              plans: plans,
                              guides: guides,
                              news: news,
                              sugg: item,
                              boards: [],
                              placenames: [],
                              recomendations: recomendations,
                              citynames: citynames,
                            });
                          });
                        }
                      }
                    );
                    //   console.log(places)
                  }
                });
              }
            }
          );
        }
      });
    }
  });
});

app.get("/places/", function (req, res) {
  res.render("form");
});

app.post("/places", urlencodedparser, function (req, res) {
  var cityName = req.body.city;
  cityName = cityName.toLowerCase();
  res.redirect("/places/" + cityName);
});

app.get("/exp", function (req, res) {
  res.render("exp");
});

var count = 0;

app.get("/chat/:username/:guidename", function (req, res) {
  var username = req.params.username;
  var guidename = req.params.guidename;
  var usertype = req.user.usertype;
  count = count + 1;

  Chatingdata.find(
    { username: username, guidename: guidename },
    function (err, places) {
      if (err) {
        console.log(err);
      } else {
        console.log(places);
        Chatingdata.find({ username: username }, function (err, chats) {
          if (err) {
            console.log(err);
          } else {
            console.log(chats);
            res.render("chat", {
              data: places[0],
              usertype: usertype,
              otherchats: chats,
            });
          }
        });
      }
    }
  );
  console.log("heyy");
  io.on("connection", function (socket) {
    console.log(count);

    if (count == 1) {
      console.log(count);

      sendStatus = function (s) {
        io.emit("status", s);
      };
      socket.on("join", function (room) {
        socket.join(room);
        console.log(room);
        // socket.broadcast.to(username+'-'+guidename).emit('output', res);
      });

      socket.on("sendlocation", (coords) => {
        var type = coords.type;
        var time = coords.time;
        var msg =
          "https://www.google.com/maps/place/" + coords.lat + "," + coords.lng;
        Chatingdata.updateOne(
          { username: username, guidename: guidename },
          { $push: { messages: { text: msg, time: time, sentby: type } } },
          function () {
            io.to(username + "-" + guidename).emit("output", {
              username: username,
              guidename: guidename,
              messages: [{ text: msg, sentby: type, time: time }],
            });
            sendStatus({
              message: "Message sent",
              clear: true,
            });
          }
        );
      });

      socket.on("input", function (data) {
        let type = data.type;
        let msg = data.msg;
        let time = data.time;
        console.log(type);
        console.log(msg);
        console.log(time);

        if (msg == "") {
          sendStatus("Please enter a message.");
        } else {
          Chatingdata.updateOne(
            { username: username, guidename: guidename },
            { $push: { messages: { text: msg, time: time, sentby: type } } },
            function () {
              io.to(username + "-" + guidename).emit("output", {
                username: username,
                guidename: guidename,
                messages: [{ text: msg, sentby: type, time: time }],
              });
              console.log(username + "-" + guidename);
              sendStatus({
                message: "Message sent",
                clear: true,
              });
            }
          );
        }
      });

      socket.on("dis", function (users) {
        console.log("socket");
        console.log(users);
        username = users.uname;
        guidename = users.gname;
        socket.disconnect();
      });
      count = 0;
    }
  });
});

app.get("/viewprofile/:guidename", function (req, res) {
  Guides.find({ name: req.params.guidename }, function (err, guide) {
    var currentbookings = [];
    if (guide[0].booking.length != 0) {
      console.log(",nmn");
      for (var i = 0; i < guide[0].booking.length; i++) {
        if (
          guide[0].booking[i].current == true &&
          guide[0].booking[i].plan == "tourplan"
        ) {
          console.log(",nmnddd");
          var m2 = new Date(guide[0].booking[i].date_n_time.date);
          currentbookings.push(
            m2.getFullYear() +
              "/" +
              (m2.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              m2.getDate().toString().padStart(2, "0")
          );
          console.log(guide[0].booking[i].days);
          for (var j1 = 0; j1 < guide[0].booking[i].days - 1; j1++) {
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
          var m2 = new Date(guide[0].booking[i].date_n_time.date);

          for (var j2 = 0; j2 < guide[0].booking[i].days - 1; j2++) {
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

    Tour_plans.find({ guide: req.params.guidename }, function (req, tours) {
      res.render("guideinfo", {
        user: guide[0],
        tours: tours[0],
        booked: currentbookings,
      });
    });
  });
});

const recommend = require("collaborative-filter");
app.get("/reco/:name", async function (req, res) {
  var placenames = [];
  var mat = [];
  console.log("_________");
  console.log(placenames);
  await Placeinfo.find({}, function (err, places) {
    //console.log(places)
    for (var i = 0; i < places.length; i++) {
      placenames.push(places[i].name);
    }
  });
  console.log("_________");
  console.log(placenames);
  var ind;
  await User.find({}, function (err, users) {
    //console.log(users);
    for (var i = 0; i < users.length; i++) {
      var temp = new Array(placenames.length).fill(0);
      if (req.params.name === users[i].name) {
        ind = i;
      }
      for (var j = 0; j < users[i].booking.length; j++) {
        if (users[i].booking[j].plan === "daylong") {
          if (placenames.includes(users[i].booking[j].place)) {
            temp[placenames.indexOf(users[i].booking[j].place)] = 1;
          }
        }
      }
      mat.push(temp);
      console.log("_________");
      console.log(temp);
    }
    // const result = recommend.cFilter(mat, ind);
    var recomendations = [];
    console.log("_________");
    console.log(placenames);
    for (var i = 0; i < result.length; i++) {
      recomendations.push(placenames[result[i]]);
    }
    console.log(recomendations);
  });
});

app.get("*", function (req, res) {
  res.render("error");
});

server.listen(8000, function () {
  console.log("Connected to server");
});
console.log("you are listening to port 8000");
