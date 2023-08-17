const { status } = require("init");
const Order = require("../model/orderModel");

//Sales--------------------------------
const sales = async (req, res) => {
  try {
    res.render("sales", { message: "" });
  } catch (error) {
    console.log(error.message);
  }
};
//GetDate------------------------------------------
const getDate = async (req, res) => {
  try {
    const firstDate = req.body.first;
    const secondDate = req.body.second;
    const salesData = await Order.find({
      status: "delivered",
      date: { $gte: new Date(firstDate), $lte: new Date(secondDate) },
    }).populate("product.productId");
    res.render("salesReports", { salesData });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  sales,
  getDate,
};
