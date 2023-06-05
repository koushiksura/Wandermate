const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const WishList = require("../models/WishList");

router.post("/add", urlencodedParser, function (req, res) {
  console.log(req.body);
  WishList.updateOne(
    {
      username: req.user.name,
      boards: { $elemMatch: { boardname: req.body.board } },
    },
    {
      $push: {
        "boards.$.list": {
          comment: req.body.comment,
          img: req.body.img,
          name: req.body.name,
          city: req.body.city,
        },
      },
    },
    function () {
      console.log(req.body);
    }
  );
  res.redirect("/wanderlist/" + req.user.name);
});

router.post("/addnewboard", urlencodedParser, function (req, res) {
  console.log(req.body);
  WishList.updateOne(
    { username: req.user.name },
    {
      $push: {
        boards: {
          boardname: req.body.board,
          list: [
            {
              comment: req.body.comment,
              img: req.body.img,
              name: req.body.name,
              city: req.body.city,
            },
          ],
        },
      },
    },
    function () {
      console.log(req.body);
    }
  );
  res.redirect("/wanderlist/" + req.user.name);
});

router.post("/newboard", urlencodedParser, function (req, res) {
  console.log(req.body);
  WishList.updateOne(
    { username: req.user.name },
    { $push: { boards: { boardname: req.body.board, list: [] } } },
    function () {
      res.redirect("/wanderlist/" + req.user.name);
    }
  );
});

router.post("/delboard", urlencodedParser, function (req, res) {
  console.log(req.body);
  WishList.updateOne(
    { username: req.user.name },
    { $pull: { boards: { boardname: req.body.name } } },
    function () {
      res.redirect("/wanderlist/" + req.user.name);
    }
  );
});

router.post("/delplace", urlencodedParser, function (req, res) {
  console.log(req.body);
  WishList.updateOne(
    {
      username: req.user.name,
      boards: { $elemMatch: { boardname: req.body.board } },
    },
    { $pull: { "boards.$.list": { name: req.body.name } } },
    function () {
      res.redirect("/wanderlist/" + req.user.name);
    }
  );
});

router.get("/:name", function (req, res) {
  WishList.find({ username: req.params.name }, function (err, wishlist) {
    if (err) {
      console.log(err);
    } else {
      res.render("wanderlist", { wishlist: wishlist, user: req.user });
    }
  });
});

module.exports = router;
