const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  deliveryaddress: {
    name: {
      type: String,
      required: true,
    },
    housename: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
  },
  date: {
    type: Date,
  },
  product: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },

      singlePrice: {
        type: Number,
        // required:true
      },
    },
  ],
  total: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  PaymentType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "canceled",
      "completed",
    ],
    default: "pending",
  },
});
module.exports = mongoose.model("Order", orderSchema);
