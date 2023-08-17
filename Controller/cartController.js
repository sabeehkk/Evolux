const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const Cart = require("../model/cartModel");
const session = require("express-session");

//View Cart----------------------
const viewCart = async (req, res) => {
  try {
    if (req.session.user_id) {
      const categoryDataNav = await Category.find({ Is_status: true });
      const user = await User.findOne({ _id: req.session.user_id });
      const id = user._id;
      const cart = await Cart.findOne({ user: id });
      let Total = 0;
      if (cart) {
        const cartData = await Cart.findOne({ user: id })
          .populate("product.productId")
          .lean();
        if (cartData) {
          if (cartData.product.length) {
            const total = await Cart.aggregate([
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
            Total = total[0].total;
            res.render("./user/cart", {
              user: req.session.name,
              data: cartData.product,
              userId: id,
              total: Total,
              categoryDataNav,
            });
          } else {
            res.render("./user/cart", {
              user: req.session.name,
              data: cartData.product,
              userId: id,
              total: Total,
              categoryDataNav,
            });
          }
        } else {
          res.render("./user/cart", {
            user: req.session.name,
            data: cartData.product,
            userId: id,
            total: Total,
            categoryDataNav,
          });
        }
      } else {
        res.render("./user/cart", {
          user: req.session.name,
          data: cartData.product,
          userId: id,
          total: Total,
          categoryDataNav,
        });
      }
    } else {
      res.redirect("/Login");
    }
  } catch (error) {
    console.log(error);
    res.render("cart", { message: error.message, user: req.session.user });
  }
};
// addToCart....................................
const addtoCart = async (req, res) => {
  try {
    if (req.session.user_id) {
      const productId = req.params.id;
      const productDataa = await Product.findOne({ _id: productId });
      const categoryDataNav = await Category.find({ Is_status: true });
      if (productDataa.quantity == 0) {
        return res.json({ message: "Cart Out OF Stock" });
      }
      const userName = req.session.user_id;
      const userdata = await User.findOne({ _id: userName });
      const userId = userdata.id;
      const productData = await Product.findById(productId);
      const userCart = await Cart.findOne({ user: userName });
      if (userCart) {
        const productExist = await userCart.product.find(
          (product) => product.productId == productId
        );
        if (productExist) {
          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          );
          res.redirect("/");
        } else {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: {
                  productId: productId,
                  price: productData.price,
                },
              },
            }
          );
          res.redirect("/");
        }
      } else {
        const data = new Cart({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
            },
          ],
        });
        await data.save();
        res.redirect("/");
      }
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//Delet Cart---------------------
const deleteCart = async (req, res) => {
  try {
    const id = req.body.id;
    const data = await Cart.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};
//Change Quantity-----------------------------
const changeQuantity = async (req, res, next) => {
  let id = req.session.user_id;
  let { productId, helper } = req.query;
  const cart = await Cart.findOne({ user: id })
    .populate("product.productId")
    .lean();
  let cartItem = cart.product.find((e) => e.productId._id == productId);
  if (helper == 1) {
    const productDataa = await Product.findOne({ _id: productId });
    if (
      productDataa.quantity === 0 ||
      cartItem.quantity >= productDataa.quantity
    ) {
      return res.status(400).json({ message: "Cart Out of Stock" });
    }
    let existinQuantity = cartItem.quantity;
    existinQuantity++;
    let newSubTotal = cartItem.price * existinQuantity;
    Cart.findOneAndUpdate(
      { user: id, "product.productId": productId },
      {
        $set: {
          "product.$.quantity": existinQuantity,
          "product.$.sub_total": newSubTotal,
        },
      },
      { new: true }
    )
      .then((updatedCart) => {
        // Handle the updated cart
        console.log("updatedCart    ", updatedCart);
        res.status(200).json({ productId });
      })
      .catch((error) => {
        // Handle any errors
        console.log(error);
      });
  } else {
    let existinQuantity = cartItem.quantity;
    if (existinQuantity === 1) {
      return res.json({ message: "Cart Quantity Cannot Be Reduced Further" });
    }
    existinQuantity--;
    let newSubTotal = cartItem.price * existinQuantity;
    Cart.findOneAndUpdate(
      { user: id, "product.productId": productId },
      {
        $set: {
          "product.$.quantity": existinQuantity,
          "product.$.sub_total": newSubTotal,
        },
      },
      { new: true }
    )
      .then((updatedCart) => {
        // Handle the updated cart
        console.log("updatedCart    ", updatedCart);
        res.status(200).json({ productId });
      })
      .catch((error) => {
        // Handle any errors
        console.log(error);
      });
  }
};

module.exports = {
  viewCart,
  addtoCart,
  deleteCart,
  changeQuantity,
};
