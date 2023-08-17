const Coupen = require("../model/coupenModel");
const { logout } = require("./adminController");

//Coupen Management---------------------------------------------
const coupenManage = async (req, res) => {
  try {
    const coupen = await Coupen.find();
    res.render("coupenManagemen", { coupen: coupen });
  } catch (error) {
    console.log(error.message);
  }
};
// Add Coupen---------------------------------------------
const addCoupen = async (req, res) => {
  try {
    res.render("addCoupen");
  } catch (error) {
    console.log(error.message);
  }
};
// Create Coupen-----------------------------------
const getCoupen = async (req, res) => {
  try {
    const data = {
      coupenName: req.body.coupenName,
      expiryDate: req.body.expiryDate,
      minimumPrice: req.body.minimumPrice,
      quantity: req.body.quantity,
      discount: req.body.discount,
    };
    if (
      !data.coupenName ||
      !data.expiryDate ||
      !data.minimumPrice ||
      !data.quantity ||
      !data.discount
    ) {
      res.render("addCoupen", { message: "Please fill the form." });
    }
    const existingCoupen = await Coupen.findOne({
      coupenName: data.coupenName,
    });
    if (existingCoupen) {
      res.render("addCoupen", { message: "The coupon already exists." });
    }
    if (data.discount < 0 || data.discount > 100) {
      res.render("addCoupen", {
        message:
          "Invalid discount percentage. Please provide a value between 0 and 100.",
      });
    }
    const datas = await Coupen.create(data);
    res.redirect("/admin/coupenManage"); // Use res.redirect() to redirect to the specified URL.
  } catch (error) {
    console.log(error.message);
  }
};
//EditCoupen-----------------------------------
const editCoupen = async (req, res) => {
  try {
    console.log(req.body);
    const coupenId = req.params.id;
    const editData = await Coupen.findOne({ _id: coupenId });
    res.render("editCoupen", { editData });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
//UpdateCoupen--------------------------------------------
const updatedCoupen = async (req, res) => {
  try {
    const coupenId = req.body.id;
    const data = {
      coupenName: req.body.coupenName,
      expiryDate: req.body.expiryDate,
      minimumPrice: req.body.minimumPrice,
      quantity: req.body.quantity,
      discount: req.body.discount,
    };
    if (
      !data.coupenName ||
      !data.expiryDate ||
      !data.minimumPrice ||
      !data.quantity ||
      !data.discount
    ) {
      return res.send(data);
      return res.render("editCoupen", {
        data,
        message: "Please fill All the fields",
      });
    }
    if (data.discount < 0 || data.discount > 100) {
      return res.send(data);
      return res.render("editCoupen", {
        data,
        message:
          "Invalid discount percentage. Please provide a value between 0 and 100.",
      });
    }
    const coupenDate = new Date(req.body.expiryDate);
    const currentDate = new Date();
    if (coupenDate < currentDate) {
      data.status = "Expired";
    } else {
      data.status = "Active";
    }
    await Coupen.updateOne({ _id: coupenId }, data);
  } catch (error) {
    console.log(error.message);
  }
  res.redirect("/admin/coupenManage");
};
//Delete Coupen------------------------------------------------------------
const deleteCoupen = async (req, res) => {
  try {
    const deletedCoupen = await Coupen.deleteOne({ _id: req.params.id });
    res.redirect("/admin/coupenManage");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  coupenManage,
  addCoupen,
  getCoupen,
  editCoupen,
  updatedCoupen,
  deleteCoupen,
};
