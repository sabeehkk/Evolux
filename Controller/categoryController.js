const { name } = require("ejs");
const Category = require("../model/categoryModel");
const { status } = require("init");
const Product = require("../model/productModel");

//show category
const showCategory = async (req, res, next) => {
  try {
    const categoryData = await Category.find({});
    res.render("show_category", { categoryData });
  } catch (error) {
    next(error);
  }
};
//Add Category--------------------
const addCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      const categoryData = await Category.find({});
      res.render("show_category", { categoryData });
      return;
    }
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};
//delete category
const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Category.deleteOne({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};
//Edit category---------------------
const editCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const categoryData = await Category.find({ _id: categoryId });
    res.render("EditCategory", { categoryData });
  } catch (error) {
    next(error);
  }
};
// UpdateCategory---------------------------------------
const updateCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updateData = {
      name: req.body.name,
      description: req.body.description,
    };
    await Category.findByIdAndUpdate(id, updateData);
    res.redirect("/admin/category");
  } catch (error) {
    next(error);
  }
};
//Action controls----------------
const actionchange = async (req, res) => {
  try {
    if (req.query.Is_status == "true") {
      const category = await Category.findOne({ _id: req.query.id });
      await Product.updateMany(
        { category: req.query.id },
        { $set: { status: false } }
      );
      await Category.updateOne(
        { _id: req.query.id },
        { $set: { Is_status: false } }
      )
        .then((r) => {
          console.log(r);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const category = await Category.findOne({ _id: req.query.id });
      await Product.updateMany(
        { category: req.query.id },
        { $set: { status: true } }
      );
      await Category.updateOne(
        { _id: req.query.id },
        { $set: { Is_status: true } }
      );
    }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  showCategory,
  addCategory,
  editCategory,
  updateCategory,
  actionchange,

  // deleteCategory
};
