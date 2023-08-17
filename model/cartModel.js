const mongoose = require("mongoose");

const { ObjectId } = require("mongodb");

const User = require("../model/userModel");

const Product = require("../model/productModel");

const cartSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "users",
    require: true,
  },
  product: [
    {
      productId: {
        type: ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        default: 0,
      },
      totalPrice: {
        type: Number,
        default: 0,
      },
      sub_total: {
        type: Number,
        default: 0,
      },
    },
  ],
  discount: [
    {
      amount: {
        type: Number,
        default: 0,
      },
      couponCode: {
        type: String,
        required: true,
      },
    },
  ],
});

// const cart = mongoose.model("Cart", cartSchema)
// module.exports = cart

// module.exports=mongoose.model("Cart",cartSchema)

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
