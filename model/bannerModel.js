const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    require: true,
  },
  productId: {
    type: ObjectId,
    ref: "Product",
    required: true,
  },

  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
