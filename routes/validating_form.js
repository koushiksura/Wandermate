const { check, validationResult } = require("express-validator");

const verify = async (req, res, next) => {
  try {
    console.log("----------------------------From MiddleWare----------------");
    console.log(req.body);
    var errors = { error: new Array() };
    console.log(errors);
    var order = 0;
    var city, name;
    for (var key in req.body) {
      order += 1;
      var items = req.body[key].split(",");
      console.log(items);
      if (key !== "dates") {
        day = items[0];
        city = items[1];
        place = items[2];
        start_time = items[3];
        end_time = items[4];
        name = items[5];
        cost = items[6];
        if (day.length === 0 || typeof day !== "string") {
          errors["error"].push(
            "Please fill the day field and day should be a string"
          );
        }
        if (city.length === 0 || typeof city !== "string") {
          errors["error"].push(
            "Please fill the city field and City should be a string"
          );
        }
        if (place.length === 0 || typeof place !== "string") {
          errors["error"].push(
            "Please fill the place field and place should be a string"
          );
        }
        if (start_time.length === 0 || typeof start_time !== "string") {
          errors["error"].push(
            "Please fill the start time field and start time should be a string"
          );
        }
        if (end_time.length === 0 || typeof end_time !== "string") {
          errors["error"].push(
            "Please fill the End time field and End time should be a string"
          );
        }
        if (cost.length === 0 && cost === "") {
          errors["error"].push(
            "Please fill the cost field and cost should be an integer"
          );
        }
        if (name.length === 0 || typeof name !== "string") {
          errors["error"].push(
            "Please fill the name field and name should be a string"
          );
        }
        if (start_time === end_time) {
          errors["error"].push("Start and end time cannot be the same!!");
        }

        console.log(errors);
        if (errors["error"].length !== 0) {
          throw errors;
        }
      } else {
        if (req.body["dates"].length === 0) {
          errors["error"].push("Please fill the dates!!");
        }
        if (errors["error"].length !== 0) {
          throw errors;
        }
      }
      if (order === 0) {
        errors["error"].push("Please fill the form!");
        throw errors;
      }
    }
  } catch (e) {
    return res.status(404).json({ e });
  }
  next();
};
module.exports = verify;
