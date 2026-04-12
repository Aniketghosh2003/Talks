const express = require("express");
const {
  loginController,
  registerController,
  fetchAllUsersController,
  getMyProfileController,
  updateProfileController,
} = require("../controllers/userControllers");

const { protect } = require("../middleware/authMiddleware");

const Router = express.Router();

Router.post("/login", loginController);
Router.post("/register", registerController);
Router.get("/fetchUsers", protect, fetchAllUsersController);
Router.get("/profile", protect, getMyProfileController);
Router.put("/profile", protect, updateProfileController);

module.exports = Router;
