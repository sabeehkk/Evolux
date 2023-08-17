const mongoose = require("mongoose");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");

//load wishlist-----------------------------------
const loadWishlist = async (req, res) => {
  try {
    if (req.session.user_id) {
      const categoryDataNav = await Category.find({ Is_status: true });
      const productData = await Product.findOne({}).populate("category");
      const categoryData = await Category.find({});
      const user = req.session.user_id;
      const userData = await User.findOne({ _id: user }).populate(
        "wishlist.product"
      );

      res.render("user/Wishlist", {
        user: userData,
        category: categoryData,
        product: productData,
        categoryDataNav,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//Add Wishlist-----------------------------------------------
const addWishlist = async (req, res) => {
  try {
    if (req.session.user_id) {
      const user = req.session.user_id;
      const proId = req.params.Id;
      const data = await User.findOne({ _id: user, "wishlist.product": proId });
      if (data) {
        return;
      } else {
        const insert = await User.updateOne(
          { _id: user },
          { $push: { wishlist: { product: proId } } }
        );
        if (insert) {
          return;
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//Delete wishlist-------------------------------------------------------
const deleteWishlist = async (req, res) => {
  try {
    console.log('wishlist delete');

    const id = req.body.id;
    console.log('wishlist data',id);

    const data = await User.findOneAndUpdate(
      { "wishlist.product": id },
      { $pull: { wishlist: { product: id } } }
    );
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  loadWishlist,
  addWishlist,
  deleteWishlist,
};
