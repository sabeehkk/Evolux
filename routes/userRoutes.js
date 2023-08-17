const express = require("express");
const user_router = express();

const session = require("express-session");
const auth = require("../middleware/auth");

user_router.use(
  session({
    secret: "mysessionsecret",
    resave: false,
    saveUninitialized: false,
  })
);

const bodyParser = require("body-parser");
user_router.use(bodyParser.json());
user_router.use(bodyParser.urlencoded({ extended: true }));

//requiring Controllers Starts-----------------------------------------

const userController = require("../Controller/userController");

const productController = require("../Controller/productController");

const cartController = require("../Controller/cartController");

const wishlistController = require("../Controller/wishlistController");

const orderController = require("../Controller/orderController");
const filterController = require("../Controller/filterController");

const checkoutController = require("../Controller/checkoutController");

//requiring controllers Ends-----------------------------------------------

//user routes--------------------------------------

user_router.get("/signup", userController.loadRegister);
user_router.post("/signup", userController.signupSubmit);
user_router.get("/login", auth.logout, userController.loginLoad);
user_router.post("/login", auth.logout, userController.loginVerify);
user_router.get("/", userController.homePage);
user_router.get("/logout", userController.logout);

//User Otp -------------------------------

user_router.post("/checkotp", userController.verifyOtp);
user_router.get("/resentOtp", userController.reSendOpt);

//User side Product-------------------

user_router.get("/productview/:id", userController.productViewpage);

// user_router.get('/showproduct',productController.allProduct)

//Cart Routes

user_router.post("/addTocart/:id", cartController.addtoCart);

user_router.get("/cart", auth.login, cartController.viewCart);

user_router.post("/deleteCart", cartController.deleteCart);

user_router.get("/changeQuantity", cartController.changeQuantity);

//user Profile
user_router.get("/user", auth.login, userController.userProfile);

user_router.get("/editProfile", userController.editProfile);

user_router.post("/updateProfile", userController.updateProfile);

// Add address

user_router.get("/addAddress", userController.viewAddress);

user_router.post("/addAddress", userController.createAddress);

user_router.get("/manageAddress", userController.ManageAddress);

user_router.get("/editAddress/:id", userController.editAddress);

user_router.post("/UpdateAddress", userController.UpdatedAddress);

user_router.get("/deleteAddress/:id", userController.deleteAddress);

user_router.get("/checkout", userController.proceedToCheckout);

//  Wishlist----------------------------

user_router.get("/wishlist", wishlistController.loadWishlist);

user_router.get("/addWishlist/:Id", wishlistController.addWishlist);

user_router.post("/deleteWishlist", wishlistController.deleteWishlist);

/////
// wallet

//Order

user_router.get("/viewAddress_Checkout", orderController.viewAddress_Checkout);

user_router.post("/addAddress_Checkout", orderController.createAddressCheckout);

user_router.post("/placeOrder", orderController.PlaceOrder);

user_router.get("/orderHistory", orderController.orderHistory);

user_router.get("/orderDetails", orderController.orderDetails);

user_router.get("/orderSuccess", orderController.OrderSuccess);

user_router.post("/verifPpayment", orderController.verifPpayment);

user_router.get("/userOrderAction", orderController.orderActionUser);

//category filter

user_router.get("/allProducts", filterController.allProduct);
user_router.get("/category/:id", filterController.categoryFilter);
user_router.post("/search", filterController.search);

user_router.post("/applyCoupen", orderController.applyCoupon);

// login with phone number
user_router.get("/loginWithOtp", userController.login_with_Email);
user_router.post("/login_with_Email", userController.verify_Email);
user_router.post("/login_with_Email_otp", userController.verify_otp);

//forgot Password-----------

user_router.get("/forgotPassword", userController.forgotPassword);
user_router.post("/forgot_getEmail", userController.getEmail);
user_router.post("/forgot_verifyOtp", userController.forgot_verifyOtp);
user_router.post("/resetPassword", userController.resetPassword);

user_router.post(
  "/UpdateAddressCheckout",
  checkoutController.UpdateAddressCheckout
);
user_router.get(
  "/deleteAddressCheckout/:id",
  checkoutController.deleteAddressCheckout
);

user_router.get("/walletHistory", orderController.walletHistory);

module.exports = user_router;
