const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const { login } = require("../middleware/auth");

//Display shop Page-----------------------------------------------------
const allProduct = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    var page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const limit = 8;
    const skip = (page - 1) * limit;
    const category = await Category.find({ Is_status: true });
    if (req.query.low && req.query.high) {
      const categoryDataNav = await Category.find({ Is_status: true });
      let low = req.query.low.trim();
      let high = req.query.high.trim();
      let products = await Product.find({ price: { $gte: low, $lt: high } })
        .skip(skip)
        .limit(limit);
      const productsSize = await Product.countDocuments({
        status: true,
        price: { $gte: low, $lt: high },
      });
      const size = Math.ceil(productsSize / limit);
      return res.render("user/shop", {
        products,
        category,
        size,
        page,
        categoryDataNav,
      });
    }
    if (req.query.priceLow) {
      let num = req.query.priceLow;
      const products = await Product.find({ status: true })
        .sort({ price: num })
        .skip(skip)
        .limit(limit);
      const productsSize = await Product.countDocuments({ status: true });
      const size = Math.ceil(productsSize / limit);
      res.render("user/shop", {
        products,
        category,
        size,
        page,
        categoryDataNav,
      });
    }
    if (req.query.search) {
      let value = req.query.search.trim();
      const limit = 8;
      const skip = (page - 1) * limit;
      let productsSize = await Product.countDocuments({
        category: req.body.category,
        name: { $regex: value, $options: "i" },
        status: true,
      });
      const size = Math.ceil(productsSize / limit);
      let categoryObj;
      if (req.query.category) {
        categoryObj = {
          category: req.query.category,
          name: { $regex: value, $options: "i" },
          status: true,
        };
      } else {
        categoryObj = {
          name: { $regex: value, $options: "i" },
          status: true,
        };
      }
      const products = await Product.find(categoryObj).skip(skip).limit(limit);
      return res.render("user/shop", {
        products,
        category,
        size,
        page,
        categoryDataNav,
      });
    }

    if (req.query.category) {
      const categoryId = req.query.category;
      const products = await Product.find({
        category: categoryId,
        status: true,
      })
        .skip(skip)
        .limit(limit);
      let productsSize = await Product.countDocuments({
        category: categoryId,
        status: true,
      });
      const size = Math.ceil(productsSize / limit);
      return res.render("user/shop", {
        products,
        category,
        size,
        page,
        categoryDataNav,
      });
    }
    let products = await Product.find({ status: true }).skip(skip).limit(limit);
    let productsSize = await Product.countDocuments({ status: true });
    const size = Math.ceil(productsSize / limit);
    return res.render("user/shop", {
      category,
      products,
      size,
      page,
      categoryDataNav,
    });
  } catch (error) {
    console.log(error.message);
  }
};
// Category Filter-----------------------------
const categoryFilter = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryDataNav = await Category.find({ Is_status: true });
    const products = await Product.find({ category: categoryId, status: true });
    const category = await Category.find({ Is_status: true });
    return res.render("user/category_filter", { categoryDataNav });
  } catch (error) {
    console.log(error.message);
  }
};
//Search-----------------------------------------
const search = async (req, res) => {
  try {
    let payload = req.body.search.trim();
    let searchResults = await Product.find({
      status: true,
      name: { $regex: new RegExp("^" + payload + ".*", "i") },
    })
      .limit(10)
      .exec();
    res.json({ payload: searchResults });
    return;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  allProduct,
  search,
  categoryFilter,
};
