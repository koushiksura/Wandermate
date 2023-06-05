const mongoose = require("mongoose");

const SuggestionSchema = new mongoose.Schema({
  uname: {
    type: String,
  },
  palces: {
    type: String,
    value: [],
  },
});

const Suggestion = mongoose.model("Suggestion", SuggestionSchema);

module.exports = Suggestion;
