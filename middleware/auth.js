const User = require("../model/userModel");
const login = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      let blocked = await User.findOne({
        _id: req.session.user_id,
        status: false,
      });
      if (blocked) {
        req.session.user_id = null;
        return res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/");
    } else {
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  login,
  logout,
};
