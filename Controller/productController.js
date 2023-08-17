const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { name } = require("ejs");
const { populate } = require("../model/userModel");

//Multer Controlls----------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/product_images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage, limits: { files: 5 } });
// show product--admin---------------------------
const showProduct = async (req, res, next) => {
  try {
    const products = await Product.find({ isDelete: false }).populate(
      "category"
    );
    res.render("product_list", { products: products });
  } catch (error) {
    next(error);
  }
};
//Add Product--------------------------------------------
const addProduct = async (req, res, next) => {
  try {
    const categoryData = await Category.find({ Is_status: true });
    res.render("add_product", { categoryData: categoryData });
  } catch (error) {
    next(error);
  }
};
//Create PRODUCT------------------------
const createProduct = (req, res, next) => {
  try {
    upload.array("productImage")(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error uploading files");
      }
      try {
        const {
          productName,
          productDescription,
          productCategory,
          productPrice,
          productQuantity,
        } = req.body;
        const images = [];
        for (const file of req.files) {
          images.push({
            fileName: file.filename,
            originalName: file.originalname,
            imagePath: file.path,
          });
        }
        const product = new Product({
          name: productName,
          description: productDescription,
          category: productCategory,
          price: productPrice,
          quantity: productQuantity,
          image: images,
        });
        await product.validate();
        await product.save();
        res.redirect("/admin/product"); // Redirect to product listing page
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
//Delete a Product-----------------------------------
const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Product.updateOne({ _id: id }, { isDelete: true });
    res.redirect("/admin/product");
  } catch (error) {
    next(error);
  }
};
//Edit Product-------------------------------------
const editProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate("category");
    const categoryData = await Category.find({ Is_status: true });
    res.render("edit_product", {
      product: product,
      categoryData: categoryData,
    });
  } catch (error) {
    next(error);
  }
};
//Update A product---------------------------------
const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    upload.array("productImage")(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error uploading Files");
      }
      try {
        const {
          productName,
          productDescription,
          productCategory,
          productPrice,
          productQuantity,
        } = req.body;
        const images = [];
        for (const file of req.files) {
          images.push({
            fileName: file.filename,
            originalname: file.originalName,
            imagePath: file.path,
          });
        }
        const product = await Product.findById(productId);
        product.name = productName;
        product.description = productDescription;
        product.category = productCategory;
        product.price = productPrice;
        product.quantity = productQuantity;
        product.image = images;
        let newData = {
          name: productName,
          quantity: productQuantity,
          price: productPrice,
          description: productDescription,
          category: productCategory,
        };
        if (req.files && req.files.length > 0) {
          const ProImages = [];
          const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
          for (const file of req.files) {
            ProImages.push({
              fileName: file.filename,
              originalName: file.originalname,
              imagePath: file.path,
            });
          }
          let oldImg = await Product.findOne({ _id: productId });
          oldImg = oldImg.image;
          let newImages = [...oldImg, ...images];
          newData.image = newImages;
        }
        let result = await Product.updateOne({ _id: productId }, newData);
        res.redirect("/admin/product");
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
//Delete A Image------------------------------------------------
const deleteImage = async (req, res) => {
  try {
    const productId = req.query.productId.trim();
    const imageId = req.query.imgname;
    if (!productId || !imageId) {
    }
    const products = await Product.find({ _id: productId });
    let filePath = "public/product_images/";
    fs.unlink(path.resolve(filePath, imageId), (err) => {});
    let result = await Product.updateOne(
      { _id: productId }, // Filter: Update the document with the matching _id field
      { $pull: { image: { fileName: imageId } } } // Update: Remove imageId from the images array
    );
    return res.redirect(`/admin/product/${productId}/edit`);
  } catch (error) {
    console.error(error);
  }
};
//List Product---------------------------------------------------
const listProduct = async (req, res) => {
  try {
    if (req.query.status == "true") {
      const productId = Product.findOne({ _id: req.query.id });
      await Product.updateOne(
        { _id: req.query.id },
        { $set: { status: false } }
      );
      res.redirect("/admin/product");
    } else {
      const productId = Product.findOne({ _id: req.query.id });
      await Product.updateOne(
        { _id: req.query.id },
        { $set: { status: true } }
      );
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  showProduct,
  addProduct,
  createProduct,
  deleteProduct,
  editProduct,
  updateProduct,
  listProduct,
  deleteImage,
};
