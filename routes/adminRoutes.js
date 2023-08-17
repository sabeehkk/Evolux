const express = require("express");
const admin_route = express();

admin_route.set("views", "./views/admin");

const session = require("express-session");
const config = require("../config/config");
admin_route.use(session({ secret: config.sessionSecret }));

admin_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

admin_route.set("view engine", "ejs");

const auth = require("../middleware/adminAuth");

const upload = require("../middleware/multer");

//requiring Controllers Starts-----------------------------------------

const adminController = require("../Controller/adminController");

const categoryController = require("../Controller/categoryController");

const productController = require("../Controller/productController");

const orderController = require("../Controller/orderController");

const coupenController = require("../Controller/coupenController");

const bannerController = require("../Controller/bannerController");

const salesController = require("../Controller/sales");

//requiring controllers Ends-----------------------------------------------

//admin routes--------------------------------------

admin_route.get("/", adminController.loadLogin);

admin_route.post("/login", adminController.verifyLogin);

admin_route.get("/home", auth.isLogin, adminController.loadDahsboard);

admin_route.get("/logout", auth.isLogin, adminController.logout);

admin_route.get("/dashboard", auth.isLogin, adminController.userManagement);

admin_route.patch(
  "/block_unblock_user",
  auth.isLogin,
  adminController.block_unblock_user
);

//categories-----------------------------------------

admin_route.get("/category", auth.isLogin, categoryController.showCategory);

admin_route.post("/category/add", auth.isLogin, categoryController.addCategory);
admin_route.get("/EditCategory/:id", categoryController.editCategory);

admin_route.post("/UpdateCategory/:id", categoryController.updateCategory);

admin_route.get("/listCategory/action", categoryController.actionchange);

// admin_route.get('/deleteCategory/:id', categoryController.deleteCategory);

//products-------------------------------------

admin_route.get("/product", auth.isLogin, productController.showProduct);

admin_route.get("/product/add", auth.isLogin, productController.addProduct);

admin_route.post("/product/add", auth.isLogin, productController.createProduct);

// admin_route.post('/product/:id/delete',productController.deleteProduct)----------

admin_route.get("/product/:id/edit", productController.editProduct);

admin_route.post("/product/:id/update", productController.updateProduct);

admin_route.get("/listProduct/action", productController.listProduct);

admin_route.get("/deleteEditImage", productController.deleteImage);

//Order--------------------------------

admin_route.get("/orderManage", orderController.orderManagement);
//admin-------------
admin_route.get("/orderAction", orderController.orderAction);

admin_route.get("/moreInfo", orderController.orderInfo);

//Coupen

admin_route.get("/coupenManage", coupenController.coupenManage);

admin_route.get("/addCoupen", coupenController.addCoupen);

admin_route.post("/add-coupen", coupenController.getCoupen);

admin_route.get("/editCoupen/:id", coupenController.editCoupen);

admin_route.post("/editedCoupen", coupenController.updatedCoupen);

admin_route.get("/deleteCoupen/:id", coupenController.deleteCoupen);

// Banner

admin_route.get("/banner", bannerController.loadBanner);
admin_route.get("/addBanner", bannerController.addBanner);
admin_route.post("/newBanner", bannerController.newBanner);
admin_route.get("/editBanner/:id", bannerController.EditBanner);
admin_route.post("/updateBanner", bannerController.UpdateBanner);
admin_route.post("/deleteBanner/:id", bannerController.deletBanner);

admin_route.get("/product/add", auth.isLogin, productController.addProduct);

// sales------------------

admin_route.get("/sales", salesController.sales);

admin_route.post("/getDate", salesController.getDate);

// admin_route.get('*', function(req, res) {
//     res.redirect('/admin');
//     or res.sendStatus(404) if you want to send a 404 error instead
//   });

module.exports = admin_route;
