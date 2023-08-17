const User = require("../model/userModel");

// Update Address checkoutpage---------------
const UpdateAddressCheckout = async (req, res) => {
  try {
    const Id = req.body.id;
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

    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};
//Delete Address checkout_Page------------------------
const deleteAddressCheckout = async (req, res) => {
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
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  UpdateAddressCheckout,
  deleteAddressCheckout,
};
