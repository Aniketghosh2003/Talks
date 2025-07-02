const express = require("express");
const User = require("../models/userModel");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");

const registerController = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  const useremailExists = await User.findOne({ email });
  if (useremailExists) {
    return res.status(400).json({ message: "User email already exists" });
  }
  const usernameExists = await User.findOne({ name });
  if (usernameExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const newUser = await User.create({
    name,
    email,
    password,
  });
  
  if (newUser) {
    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      token: generateToken(newUser._id),
    });
  } else {
    return res.status(400).json({ message: "Invalid user data" });
  }
});

const loginController = expressAsyncHandler(async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  const user = await User.findOne({ name });
  if (user && (await user.matchPassword(password))) {
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id },
  });

  res.send(users);
});

module.exports = {
  registerController,
  loginController,
  fetchAllUsersController,
};

