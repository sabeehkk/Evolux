const mongoose = require("mongoose");

const coupenSchema = new mongoose.Schema({
  coupenName: {
    type: String,
    required: true,
    uppercase: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  minimumPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Active",
  },
  customerId: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  ],
});
coupenSchema.pre("save", function (next) {
  const currentDate = new Date();
  if (this.expiryDate <= currentDate) {
    this.status = "Expired";
  }
  next();
});

module.exports = mongoose.model("Coupen", coupenSchema);
