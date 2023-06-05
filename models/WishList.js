const mongoose = require("mongoose");

var wishListSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
  },
  boards: {
    type: [
      {
        boardname: {
          type: String,
          required: true,
        },
        list: {
          type: [
            {
              comment: { type: String },
              img: { type: String },
              city: { type: String, lowercase: true },
              name: { type: String, lowercase: true },
            },
          ],
          default: undefined,
        },
      },
    ],
    default: undefined,
  },
});

var WishList = mongoose.model("WishList", wishListSchema, "wishlist");
module.exports = WishList;
