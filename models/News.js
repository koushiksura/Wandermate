const mongoose = require("mongoose");

const newsSchema = mongoose.Schema({
  place: { type: String },
  guide: { type: String, lowercase: true },
  img: { type: String },
  guideimg: { type: String },
  title: { type: String },
  news: { type: String },
  upvotes: { type: Array, default: void 0 },
  time: { type: Date, default: Date.now },
  place: { type: String },
  array_length: { type: Number, default: 0 },
});
const News = mongoose.model("News", newsSchema);
module.exports = News;
