const User = require("../model/userModel");
const category = require("../model/categoryModel");
const Admin = require("../model/adminModel");
const bcrypt = require("bcrypt");
const Order = require("../model/orderModel");

//Login Load--------------------------------
const loadLogin = async (req, res) => {
  try {
    res.render("login", { message: null });
  } catch (error) {
    console.log(error.message);
  }
};
//Verify Login-----------------------
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      res.render("login", { message: "please fill the form" });
    }
    const adminData = await Admin.findOne({ email: email });
    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);

      if (passwordMatch) {
        req.session.admin_id = adminData._id;
        res.redirect("/admin/home");
        console.log("home is working");
      } else {
        res.render("login", { message: " Password is incorrect " });
      }
    } else {
      res.render("login", { message: "Email is invalid " });
    }
  } catch (error) {
    console.log(error.message);
  }
};
// load Dashboard----------------------
const loadDahsboard = async (req, res) => {
  try {
    const AdminData = await Admin.findById({ _id: req.session.admin_id });
    const newOrderCount = await Order.count({ status: "pending" });
    let totalSales = await Order.aggregate([
      {
        $match: { status: "delivered" },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
        },
      },
    ]).exec();

    if (totalSales && totalSales.length > 0 && totalSales[0].totalAmount) {
      totalSales = totalSales[0].totalAmount;
    } else {
      totalSales = 0;
    }
    let customer = await User.count();
    let paymentType = await Order.aggregate([
      {
        $group: { _id: "$PaymentType", totalSales: { $sum: 1 } },
      },
    ]);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Get the first day of the week (Sunday)
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Get the last day of th
    const weekSales = await Order.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek, $lte: endOfWeek }, // Filter documents within the current week
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Group by formatted date
          totalSales: { $sum: 1 }, // Sum the number of sales for each date
        },
      },
    ]);
    let thisWeeksales;
    let ship = await Order.find({ status: "pending" }).count();
    const refund = await Order.count({ status: "Returned" });

    res.render("home", {
      admin: AdminData,
      newOrderCount,
      totalSales,
      customer,
      paymentType,
      thisWeeksales,
      weekSales,
      ship,
      refund,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//Logout-------------------
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//User Management--------------------------------

const userManagement = async (req, res) => {
  try {
    const usersData = await User.find({});
    res.render("dashboard", { users: usersData });
  } catch (error) {
    console.log(error.message);
  }
};
const block_unblock_user = (req, res) => {
  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  const { action, _id } = req.query;
  if (action == 0) {
    User.findByIdAndUpdate({ _id }, { status: false })
      .then((data) => {
        res.json({ message: "Blocked the User" });
      })
      .catch((err) => {
        res.json({ message: "Something went wrong" });
      });
  }

  if (action == 1) {
    User.findByIdAndUpdate({ _id }, { status: true })
      .then((data) => {
        res.json({ message: "Unblocked the user" });
      })
      .catch((err) => {
        res.json({ message: "Something went wrong" });
      });
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDahsboard,
  logout,
  userManagement,
  block_unblock_user,
};
