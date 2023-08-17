const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  Is_status: {
    type: Boolean,
    default: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
