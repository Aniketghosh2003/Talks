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

const getMyProfileController = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

const updateProfileController = expressAsyncHandler(async (req, res) => {
  const { name, about, profilePic } = req.body;

  // Check if new name is taken by someone else
  if (name && name !== req.user.name) {
    const taken = await User.findOne({ name });
    if (taken) {
      return res.status(406).json({ message: "Username already taken" });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name && { name }),
      ...(about !== undefined && { about }),
      ...(profilePic !== undefined && { profilePic }),
    },
    { new: true }
  ).select('-password');

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    about: updatedUser.about,
    profilePic: updatedUser.profilePic,
    token: req.user.token, // preserve existing token
  });
});

module.exports = {
  registerController,
  loginController,
  fetchAllUsersController,
  getMyProfileController,
  updateProfileController,
};

