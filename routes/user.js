const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signout,
  forgotPassword,
  resetPassword,
  getUserData,
  updatePassword,
  update,
  getAllUser
} = require("../controller/userController");
const { customRole } = require("../middlewares/user")
const { isLoggedIn } = require("../middlewares/user");
router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/signout").get(signout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/reset/password/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getUserData);
router.route("/userdashboard/changepassword").post(isLoggedIn, updatePassword);
router.route("/userdashboard/update").post(isLoggedIn, update);
router.route("/admin/user").get(isLoggedIn , customRole("admin") , getUserData);
router.route("/admin/users").get(isLoggedIn , customRole("admin") , getAllUser);
router.route("/manager/user").get(isLoggedIn , customRole("manager") , getUserData);
router.route("/manager/users").get(isLoggedIn , customRole("manager") , getAllUser);

module.exports = router;
