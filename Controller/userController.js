const User = require("../model/userModel");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Product = require("../model/productModel");
const nodemailer = require("nodemailer");
const Admin = require("../model/adminModel");
const Category = require("../model/categoryModel");
const { otpGen } = require("../Controller/otpGenerator");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const Banner = require("../model/bannerModel");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const { walletprice } = require("./orderController");

//Node Mailer
const sMail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "sabeehkadungalloor525@gmail.com",
      pass: "tefzmeicpgbqmnla",
    },
  });
  const mailOptions = {
    from: "sabeehkadungalloor525@gmail.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  };
  // send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
// Load Register Page
const loadRegister = async (req, res) => {
  try {
    res.render("user/signup", { message: "" });
  } catch (error) {
    console.log(error.message);
  }
};
// Secure Password
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.massegee);
  }
};
let UserDetails;
let otp;
const signupSubmit = (req, res) => {
  if (
    !req.body.name.trim() ||
    !req.body.lname.trim() ||
    !req.body.email.trim() ||
    !req.body.Mobile.trim() ||
    !req.body.password.trim()
  ) {
    return res.render("user/signup", { message: "please fill the feald." });
  }
  otp = otpGen();
  UserDetails = req.body;
  sMail(req.body.email, otp);
  res.render("user/otp");
};
const reSendOpt = (req, res) => {
  otp = otpGen();
  sMail(UserDetails.email, otp);
  res.render("user/otp");
};
//verify otp
const verifyOtp = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    const bannerData = await Banner.find({});
    const products = await Product.find({
      status: true,
    }).populate("category");
    let { val1, val2, val3, val4, val5, val6 } = req.body;
    let formOtp = Number(val1 + val2 + val3 + val4 + val5 + val6);
    if (formOtp == otp) {
      let { name, lname, password, Mobile, email } = UserDetails;
      const sPassword = await securePassword(password);
      const user = {
        firstName: name,
        lastName: lname,
        email: email,
        mobile: Mobile,
        password: sPassword,
      };
      const userData = await User.create(user);
      const data = await User.findOne({ email: email });
      let result = await Cart.create({ user: data._id });
      if (userData) {
        req.session.user_id = userData._id;
        req.session.user_id = null;
        return res.render("user/login1", {
          categoryDataNav,
          bannerData,
          products,
          message1: "Your signup has been successful. Please login.",
        });
      } else {
        return res.render("user/signup", {});
      }
    } else {
      return res.render("user/signup", {
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
//Login-----------------------------
const loginLoad = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });

    res.render("user/login1", { categoryDataNav });
  } catch (error) {
    console.log(error.message);
  }
};
//Logout-----------------------------------------------
const logout = async (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};
//Login Verify
const loginVerify = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    if (!req.body.email || !req.body.password) {
      res.render("user/login1", {
        message: "please fill all the feild",
        categoryDataNav,
      });
    } else {
      let email = req.body.email;
      let password = req.body.password;
      let userdata = await User.findOne({ email: email });
      if (!userdata) {
        res.render("user/login1", {
          message: "cannot find the user",
          categoryDataNav,
        });
      } else {
        if (userdata.status == false) {
          res.render("user/login1", {
            message: "user is Blocked By Admin",
            categoryDataNav,
          });
        }
        let passwordMatch = await bcrypt.compare(password, userdata.password);
        if (!passwordMatch) {
          res.render("user/login1", {
            message: "Password is not correct",
            categoryDataNav,
          });
        } else {
          if (userdata) {
            req.session.user_id = userdata._id;
            res.redirect("/");
          } else {
            res.render("user/login1", categoryDataNav, {});
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.render("user/login1", { message: "please  fill the field" });
  }
};
//Home Page----------------------------------------------
const homePage = async (req, res, next) => {
  try {
    const products = await Product.find({
      status: true,
    }).populate("category");
    const categoryDataNav = await Category.find({ Is_status: true });
    const haivalue = await Banner.find().populate({
      path: "productId",
      populate: {
        path: "category",
      },
    });
    const bannerData = haivalue.filter((value) => {
      return value.productId.category.Is_status == true;
    });
    return res.render("user/home", {
      products: products,
      bannerData,
      categoryDataNav,
    });
  } catch (error) {
    next(error);
  }
};
//ProductViewPage-----------------------------------------------------
const productViewpage = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const categoryDataNav = await Category.find({ Is_status: true });
    const productData = await Product.findOne({ _id: productId, status: true });
    res.render("user/product_Viewpage", { productData, categoryDataNav });
  } catch (error) {
    console.log(error.message);
  }
};
//ProceedTOcheckout------------------------------------------
const proceedToCheckout = async (req, res) => {
  try {
    if (req.session.user_id) {
      const categoryDataNav = await Category.find({ Is_status: true });
      const user = await User.findOne({ _id: req.session.user_id });
      const address = user.address;
      const id = user._id;
      const cart = await Cart.findOne({ user: id });
      if (cart.product.length <= 0) {
        res.redirect("/");
      }
      if (cart) {
        const cartData = await Cart.findOne({ user: id })
          .populate("product.productId")
          .lean();
        let total = 0;
        if (cartData.product.length) {
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
        const discount = user.discount;
        res.render("user/checkout", {
          success: true,
          userdata: user,
          address: address,
          total: total,
          discount: discount,
          categoryDataNav,
          data: cartData.product,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
//User Profie----------------------------------------------
const userProfile = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userdata = await User.findOne({ _id: req.session.user_id });
      const address = userdata.address;
      const categoryDataNav = await Category.find({ Is_status: true });
      const WalletTotal = userdata.wallet;
      res.render("user/Profile", {
        userdata: [userdata],
        address: address,
        categoryDataNav,
        WalletTotal,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
// Edit Profile
const editProfile = async (req, res) => {
  try {
    const userdata = await User.findOne({ _id: req.session.user_id });
    const categoryDataNav = await Category.find({ Is_status: true });
    res.render("user/EditProfile", {
      userdata: userdata,
      categoryDataNav,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//Update Profile---------------
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile } = req.body;
    const categoryDataNav = await Category.find({ Is_status: true });
    const data = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobile: req.body.mobile,
    };
    const newProfile = await User.updateOne({ _id: req.session.user_id }, data);
    const current = req.body.CurrentPassword;
    if (current) {
      const newp = req.body.NewPassword;
      const confirm = req.body.RePassword;
      if (newp && confirm) {
        const userdata = await User.findOne({ _id: req.session.user_id });
        if (userdata) {
          let passwodMatch = await bcrypt.compare(current, userdata.password);
          if (passwodMatch) {
            if (newp == confirm) {
              const passwordHash = await bcrypt.hash(newp, 10);
              const update = await User.updateOne(
                { _id: req.session.user_id },
                { $set: { password: passwordHash } }
              );
              res.redirect("/user");
            } else {
              res.json({ notmatch: true });
            }
          } else {
            res.json({ message: " invalid  response" });
          }
        }
      }
    }
    res.redirect("/user");
    res.render("user/Profile", {
      userData,
      categoryDataNav,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//View Address
const viewAddress = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    const user = await User.findById(req.session.user_id);
    const address = user.address;
    res.render("user/Add_address", { address: address, categoryDataNav });
  } catch (error) {
    console.log(error.message);
  }
};
//Create Address--------------------------------------------
const createAddress = async (req, res, next) => {
  try {
    console.log(req.body, "addaddress");
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
    res.redirect("/manageAddress");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};
//Update Address-------------------------------------------------
const ManageAddress = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    const userdata = await User.findOne({ _id: req.session.user_id });
    const address = userdata.address;
    res.render("user/manageAddress", {
      userdata: [userdata],
      address: address,
      categoryDataNav,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//Edit Address-----------------------------------------------
const editAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const categoryDataNav = await Category.find({ Is_status: true });
    const userdata = await User.findOne({ _id: req.session.user_id });
    const addressData = userdata.address.find((x) => x._id == addressId);
    res.render("user/EditAddress", { addressData, categoryDataNav });
  } catch (error) {
    console.log(error.message);
  }
};
//  Update Address----------------------------------------------
const UpdatedAddress = async (req, res) => {
  try {
    const Id = req.body.id;
    const categoryDataNav = await Category.find({ Is_status: true });
    const data = {
      name: req.body.name,
      housename: req.body.housename,
      street: req.body.street,
      state: req.body.state,
      pincode: req.body.pincode,
      phone: req.body.phone,
    };
    const newAddress = await User.findOneAndUpdate(
      {
        _id: req.session.user_id,
        "address._id": Id,
      },

      {
        $set: {
          "address.$": data,
        },
      },
      { new: true }
    );
    if (!newAddress || !newAddress.address) {
      throw new Error("Address not fount");
    }
    res.redirect("/manageAddress");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.session.user_id,
      },
      {
        $pull: {
          address: { _id: addressId },
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found or address not deleted");
    }
    res.redirect("/manageAddress");
  } catch (error) {
    console.log(error.message);
  }
};
//Login with Email--------------------------------------------------
const login_with_Email = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    res.render("user/loginWith_Email", { categoryDataNav });
  } catch (error) {
    console.log(error);
  }
};
//Verify_Email--------------------------------------------------
const verify_Email = async (req, res) => {
  try {
    const email = req.body.email.trim();
    const userFind = await User.findOne({ email: email });
    if (!userFind) {
      return res.json({ response: { error: "User not found" } });
    }
    otp = otpGen();
    sMail(req.body.email, otp);
    res.json({ response: { success: "success" } });
  } catch (error) {
    console.log(error);
  }
};
//verify_otp---------------------------------------------
const verify_otp = async (req, res) => {
  try {
    const otpCode = req.body.otp.trim();
    const email = req.body.email.trim();
    if (otpCode.length != 6) {
    }
    if (otpCode == otp) {
      const user = await User.findOne({ email: email });
      if (user) {
        req.session.user_id = user._id;
        return res.json({ response: { success: true } });
      }
    } else {
      return res.json({ response: { error: true } });
    }
  } catch (error) {
    console.log(error);
  }
};
//forgotPassword------------------------------------
const forgotPassword = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    res.render("user/forgotPassword", { categoryDataNav, message: "" });
  } catch (error) {
    console.log(error.message);
  }
};
//getEmail--------------------------------------------------
const getEmail = async (req, res) => {
  try {
    const email = req.body.email.trim();
    if (!email) {
      return res.render("user/forgotPassword", {
        message: "please Enter Your Email id",
      });
    }
    let userData = await User.findOne({ email: email });
    if (!userData) {
      return res.render("user/forgotPassword", {
        message: "  Invalid email id",
      });
    }
    otp = otpGen();
    sMail(req.body.email, otp);
    return res.render("user/forgot_OtpPage", { email, message: "" });
  } catch (error) {
    console.log(error.message);
  }
};
//forgotPassword_verifyOtp------------------------------------
const forgot_verifyOtp = async (req, res) => {
  try {
    const userdata = User.findOne();
    const otpCode = req.body.otp?.trim();
    const email = req.body.email?.trim();
    if (otpCode.length != 6) {
      return res.render("user/forgot_OtpPage", {
        email,
        message: "Enter valid OTP",
      });
    }
    if (otpCode === otp.trim()) {
      const user = await User.findOne({ email: email });
      if (user) {
        req.session.user_id = user._id;
        return res.render("user/resetPassword", { email, message: "" });
      }
    } else {
      return res.render("user/forgot_OtpPage", {
        email,
        message: "Enter valid OTP",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//forgot Password resetPassword--------------------------
const resetPassword = async (req, res) => {
  try {
    const categoryDataNav = await Category.find({ Is_status: true });
    const email = req.body.email.trim();
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.ConformPassword;
    if (newPassword.includes(" ")) {
      return res.render("user/resetPassword", {
        email,
        message: "Invalid password. Password should not contain spaces.",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.render("user/resetPassword", {
        email,
        message: "Passwords do not match",
      });
    }
    if (newPassword < 6) {
      return res.render("user/resetPassword", {
        email,
        message: "enter a strong password",
      });
    }
    if (newPassword == confirmPassword) {
      // const hashedPassword = await bcrypt.hash(newPassword, 10);
      // const update = await User.updateOne( { $set: { password: hashedPassword } });
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const update = await User.updateOne(
        { _id: req.session.user_id },
        { $set: { password: hashedPassword } }
      );
      req.session.user_id = null;

      return res.render("user/login1", { categoryDataNav });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ error: true });
  }
};
module.exports = {
  loadRegister,
  loginLoad,
  logout,
  loginVerify,
  homePage,
  productViewpage,
  signupSubmit,
  verifyOtp,
  reSendOpt,
  proceedToCheckout,
  userProfile,
  editProfile,
  updateProfile,
  viewAddress,
  createAddress,
  ManageAddress,
  UpdatedAddress,
  editAddress,
  deleteAddress,
  login_with_Email,
  verify_Email,
  verify_otp,
  forgotPassword,
  getEmail,
  forgot_verifyOtp,
  resetPassword,
};
