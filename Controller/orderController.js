const mongoose = require("mongoose");
const Cart = require("../model/cartModel");
const User = require("../model/userModel");
const Order = require("../model/orderModel");
const Coupen = require("../model/coupenModel");
const { v4: uuidv4 } = require("uuid");
const Razorpay = require("razorpay");
const { subset } = require("semver");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const crypto = require("crypto");
const { response } = require("../routes/userRoutes");
const { error, log } = require("console");

const instance = new Razorpay({
  key_id: "rzp_test_F99M9yJNSrSEtY",
  key_secret: "0TOxKTpyBT5KNrZY6xjV1nFN",
});
const PlaceOrder = async (req, res) => {
  try {
    const cartData = await Cart.find({ user: req.session.user_id });
    const data = {
      paymentMehod: req.body.paymentMethod,
      address: req.body.address,
    };
    if (!req.body.address) {
      res.json({ error: "please add address" });
      return;
    }
    const OrderId = new mongoose.Types.ObjectId();
    const date = new Date();
    let productData = [];
    const userData = await User.findOne({ _id: req.session.user_id });
    const address = userData.address.find(
      (y) => y._id.toString() === req.body.address
    );
    cartData.forEach((cartItem) => {
      cartItem.product.forEach((x) => {
        productData.push({
          productId: x.productId,
          quantity: x.quantity,
          singleTotal: x.singleTotal,
          totalPrice: x.totalPrice,
        });
      });
    });
    const cart = await Cart.find({ user: req.session.user_id });
    const user = await User.findOne({ _id: req.session.user_id });
    const id = user._id;
    const cartDatas = await Cart.findOne({ user: id })
      .populate("product.productId")
      .lean();
    let total = 0;
    if (cartDatas.product.length) {
      const result = await Cart.aggregate([
        {
          $match: { user: id },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            price: "$product.price",
            quantity: "$product.quantity",
            image: "$product.image",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: ["$quantity", "$price"],
              },
            },
          },
        },
      ]).exec();

      total = result[0].total;
    }
    console.log(total, "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    total = (total - userData.discount).toFixed(2);
    let payment = req.body.paymentMethod;
    const newOrder = {
      userId: req.session.user_id,
      orderId: OrderId,
      date: date,
      product: productData,
      total: total, // Set the total value based on your calculation
      status: "pending",
      PaymentType: payment,
      deliveryaddress: address,
    };
    if (newOrder.PaymentType == "cod") {
      let result = await Order.create(newOrder);
      await Cart.updateOne(
        { user: req.session.user_id },
        { $set: { product: [] } }
      );
      await User.updateOne(
        { _id: req.session.user_id },
        { $set: { discount: 0 } }
      );
      res.json({ success: true });
    } else if (newOrder.PaymentType == "online") {
      const latestOrder = await Order.findOne({}).sort({ date: -1 });
      if (latestOrder) {
        let options = {
          amount: total * 100,
          currency: "INR",
          receipt: "" + latestOrder._id,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
            return res.json({ viewRazorpay: false, error: err }); // Return error response here
          } else {
            console.log(order, "orddddd");
            res.json({ viewRazorpay: true, order, newOrder }); // Send response here
          }
        });
      }
    } else {
      let change = userData.wallet - total;
      const newFind = await Cart.findOne({
        user: req.session.user_id,
      }).populate("product.productId");
      const firstFilter = newFind.product.filter((data) => {
        return data.productId;
      });
      const newHistoryWallet = {
        product: firstFilter,
        valuetype: "BuyWithwallet",
        amount: total,
      };
      // ending of the poductId finding ssssssssssssssssssssssss\
      let result = await Order.create(newOrder);
      await Cart.updateOne(
        { user: req.session.user_id },
        { $set: { product: [] } }
      );
      if (!user.walletHistory) {
        await User.updateOne(
          { _id: req.session.user_id },
          {
            $set: {
              discount: 0,
              wallet: change,
              walletHistory: newHistoryWallet,
            },
          }
        );
      } else {
        await User.updateOne(
          { _id: req.session.user_id },
          {
            $set: { discount: 0, wallet: change },
            $push: { walletHistory: newHistoryWallet },
          }
        );
      }
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//Order History------------------------------------------
const orderHistory = async (req, res) => {
  try {
    if (req.session.user_id) {
      const categoryDataNav = await Category.find({ Is_status: true });
      const userId = req.session.user_id;
      const user = await User.findOne({ _id: userId });
      const userName = user.userName;
      const orders = await Order.find({ userId }).populate("userId");
      orders?.reverse();
      await Promise.all(
        orders.map(async (value) => {
          const orderDate = value.date;
          const givenDate = new Date(orderDate);
          const currentDate = new Date();
          const timeDifference = givenDate - currentDate;
          const dayDifference = Math.floor(
            timeDifference / (1000 * 60 * 60 * 24)
          );
          console.log("kittttyyy", dayDifference);
          const numberOfDaysToAdd = 14;
          const futureDate = value.date;
          futureDate.setDate(futureDate + numberOfDaysToAdd);
          console.log(futureDate.setDate);
          if (dayDifference > 14) {
            console.log("Updating order:", value._id);
            await Order.findOneAndUpdate(
              { _id: value._id },
              { status: "completed" }
            );
          }
        })
      );

      res.render("user/OrderHistory", {
        orders: orders,
        userName: userName,
        categoryDataNav,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// Order details--------------------------------------------------
const orderDetails = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    const orderId = req.query.orderId;
    const data = await Order.findOne({ orderId: orderId }).populate(
      "product.productId"
    );
    const userdata = await User.findOne({ _id: req.session.user_id });
    let product = [];
    if (data && data.product && data.product.length > 0) {
      data.product.forEach((x) => {
        if (x.productId) {
          product.push(x);
        }
      });
    }
    res.render("user/OrderDetailView", {
      product,
      data,
      categoryDataNav,
      userdata,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//Order Management Admin
const orderManagement = async (req, res) => {
  console.log("ordermanagement");
  try {
    const order = await Order.find().populate("userId");
    order.reverse();
    res.render("orderManagement", { order });
  } catch (error) {
    console.log(error.message);
  }
};
//Order Action admin-------------
const orderAction = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const action = req.query.action;
    console.log("action", action);
    if (action == "refunded") {
      let data = await Order.findOne({ _id: orderId }).populate(
        "product.productId"
      );
      const user = await User.findOne({ _id: data.userId });
      const firstFilter = data.product.filter((data) => {
        return data.productId;
      });
      const newHistoryWallet = {
        product: firstFilter,
        valuetype: data.PaymentType + "returndAmount",
        amount: data.total,
      };
      if (user.walletHistory) {
        await User.updateOne(
          { _id: data.userId },
          {
            $inc: { wallet: data.total },
            $push: { walletHistory: newHistoryWallet },
          }
        );
      } else {
        await User.updateOne(
          { _id: data.userId },
          {
            $inc: { wallet: data.total },
            $set: { walletHistory: newHistoryWallet },
          }
        );
      }
    }
    let result = await Order.updateOne(
      { _id: orderId },
      { $set: { status: action } }
    );
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
};
//order Details in admin----------
const orderInfo = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const userdata = await Order.findOne({ orderId }).populate("userId");
    const data = await Order.findOne({ orderId: orderId })
      .populate("userId")
      .populate("product.productId");
    let product = [];
    if (data.product.length > 0) {
      data.product.forEach((x) => {
        if (x.productId) {
          product.push(x);
        }
      });
    }
    res.render("order_moreInfo", { data, product, userdata });
  } catch (error) {
    console.log(error.message);
  }
};
//Order Success------------------------------------
const OrderSuccess = async (req, res) => {
  try {
    res.render("user/ordersuccess");
  } catch (error) {
    console.log(error.message);
  }
};
//Verify Payment--------------------------------------
const verifPpayment = async (req, res) => {
  try {
    const details = req.body;
    const newOrder = req.body.newOrder;
    let hmac = crypto.createHmac("sha256", instance.key_secret);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac == details.payment.razorpay_signature) {
      let result = await Order.create(newOrder);
      console.log(result, "result of online orderrrr");
      const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();
      await Cart.updateOne(
        { user: req.session.user_id },
        { $set: { product: [] } }
      );
      await User.updateOne(
        { _id: req.session.user_id },
        { $set: { discount: 0 } }
      );
      res.json({ status: true });
      return;
    } else {
      res.json({ failed: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//Apply Coupen-----------------------------------
const applyCoupon = async (req, res) => {
  try {
    const couponCode = req.body.CouponCode;
    const total = req.body.Total;
    if (!couponCode || !total) {
      return res.json({ response: "Enter Coupen Code" });
    }
    const coupenData = await Coupen.findOne({
      coupenName: couponCode,
      status: "Active",
    });
    const currentDate = new Date();
    if (coupenData && coupenData.expiryDate <= currentDate) {
      77;
      await Coupen.updateOne(
        { coupenName: couponCode },
        { $set: { status: "Expired" } }
      );
      return res.json({ response: "Coupen Expired" });
    }
    if (!coupenData) {
      return res.json({ response: "invalid Coupen" });
    }
    if (coupenData.quantity === 0) {
      return res.json({ response: "Stock empty" });
    }
    if (total <= coupenData.minimumPrice) {
      return res.json({
        response:
          "Cannot use this coupon. Total is less than or equal to the minimum price.",
      });
    }
    if (coupenData.customerId.length > 0) {
      let userId = req.session.user_id;
      const used = coupenData.customerId.find((x) => x == userId);
      if (used) {
        return res.json({ response: "coupen is already Used" });
      }
    }
    await Coupen.updateOne(
      { coupenName: couponCode },
      {
        $push: { customerId: req.session.user_id },
        $inc: { quantity: -1 },
      }
    );
    const discount = (total * coupenData.discount) / 100;
    const lessAmount = total - discount;
    let result = await User.updateOne(
      { _id: req.session.user_id },
      { $set: { discount: discount } }
    );
    res.json({ response: { success: true, discount, lessAmount } });
  } catch (error) {
    console.log(error.message);
  }
};
//Order Action controls in user----------------------------------
const orderActionUser = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const action = req.query.action;
    const paymentType = req.query.paymentType;
    const userId = req.session.user_id;
    const user = await User.findOne({ _id: userId });
    const order = await Order.findOne({ orderId: orderId }).populate(
      "product.productId"
    );
    const firstFilter = order.product.filter((data) => {
      return data.productId;
    });
    const newHistoryWallet = {
      product: firstFilter,
      valuetype: order.PaymentType + "BuYProductCancel",
      amount: order.total,
    };

    const total = order.total;
    if (paymentType !== "cod" && action === "cancel") {
      if (user.walletHistory) {
        let result = await User.updateOne(
          { _id: req.session.user_id },
          {
            $inc: { wallet: total },
            $push: { walletHistory: newHistoryWallet },
          }
        );
      } else {
        let result = await User.updateOne(
          { _id: req.session.user_id },
          {
            $inc: { wallet: total },
            $set: { walletHistory: newHistoryWallet },
          }
        );
      }
    }
    order.product.forEach(async (item) => {
      if (item.productId) {
        const productId = item.productId._id;
        const quantity = item.quantity;
        const productUpdateResult = await Product.updateOne(
          { _id: productId },
          { $inc: { stock: quantity } }
        );
      }
    });
    const updateResult = await Order.updateOne(
      { userId: req.session.user_id, orderId: orderId },
      { $set: { status: action } }
    );
    res.redirect("/orderHistory");
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
};
//View Address checkout-------------------------------
const viewAddress_Checkout = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    const user = await User.findById(req.session.user_id);
    const address = user.address;
    res.render("user/Add_Address_Checkout", {
      address: address,
      categoryDataNav,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//Create Address checkout-----------------------------------
const createAddressCheckout = async (req, res, next) => {
  try {
    const address = {
      name: req.body.userName,
      housename: req.body.userHouseName,
      street: req.body.userStreet,
      state: req.body.userState,
      pincode: req.body.userPincode,
      phone: req.body.userPhone,
    };
    await User.updateOne(
      { _id: req.session.user_id },
      { $push: { address: address } }
    );
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};
//Wallet History-------------------------------------------------
const walletHistory = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    const userdata = await User.findOne({ _id: req.session.user_id }).populate(
      "walletHistory.product.productId"
    );
    res.render("user/walletHistory", { userdata, categoryDataNav });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  PlaceOrder,
  orderHistory,
  orderManagement,
  orderAction,
  orderInfo,
  OrderSuccess,
  verifPpayment,
  applyCoupon,
  orderDetails,
  orderActionUser,
  viewAddress_Checkout,
  createAddressCheckout,
  walletHistory,
};
