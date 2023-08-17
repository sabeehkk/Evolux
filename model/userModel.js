const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },

  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    require: true,
  },
  isAdmin: {
    type: String,
    default: 0,
  },
  status: {
    type: Boolean,
    default: true,
  },

  address: [
    {
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
  ],
  wallet: {
    type: Number,
    default: 0,
  },

  walletHistory: [
    {
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
      valuetype: {
        type: String,
      },
      amount: {
        type: Number,
      },
    },
  ],
  wishlist: [
    {
      product: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      ],
    },
  ],
  discount: [
    {
      type: Number,
      required: true,
      // default: 0
    },
  ],
});
module.exports = mongoose.model("User", userSchema);
