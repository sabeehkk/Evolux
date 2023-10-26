const BannerSchema = require("../model/bannerModel");
const Product = require("../model/productModel");
const { logout } = require("./adminController");
const multer = require("multer");

//multer requirements---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/test");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage, limits: { files: 5 } });
//Banner load--------------------------------
const loadBanner = async (req, res) => {
  try {
    const bannerData = await BannerSchema.find({});
    res.render("banner", { bannerData });
  } catch (error) {
    console.log(error.message);
  }
};
//Add Banner--------------------------------
const addBanner = async (req, res) => {
  try {
    const product = await Product.find();
    res.render("addBanner", { product });
  } catch (error) {
    console.log(error.message);
  }
};
// Create Banner------------------
const newBanner = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.log(err);
        console.log("img errrr");
        return res.status(500).send("Error uploading files");
      }
      try {
        let data = {
          name: req.body.Name,
          image: req.file.filename,
          productId: req.body.productid,
        };
        await BannerSchema.create(data)
          .then((r) => {
            console.log(r);
          })
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/admin/banner"); // Redirect to product listing page
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
// Edit Banner---------------------------------
const EditBanner = async (req, res, next) => {
  try {
    const id = req.params.id;
    const bannerdata = await BannerSchema.findOne({ _id: id });
    res.render("editBanner", { bannerdata });
  } catch (error) {
    next(error);
  }
};
//Update Banner---------------------------------
const UpdateBanner = async (req, res) => {
  try {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(500).send("Error uploading files");
      }
      try {
        let data = {
          name: req.body.Name,
          image: req.file.filename,
        };
        await BannerSchema.updateOne({ _id: req.body.bannerId }, data)
          .then((r) => {
            console.log(r);
          })
          .catch((err) => {
            console.log(err);
          });

        res.redirect("/admin/banner"); // Redirect to product listing page
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
//Delete Bannerr------------------------------------
const deletBanner = async (req, res) => {
  try {
    const id = req.params.id.trim();
    const bannerData = await BannerSchema.deleteOne({ _id: id });
    res.redirect("http://localhost:3000/admin/banner");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadBanner,
  addBanner,
  newBanner,
  EditBanner,
  UpdateBanner,
  deletBanner,
};
