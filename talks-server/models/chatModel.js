const mongoose = require("mongoose");

const chatModel = new mongoose.Schema(
  {
    chatName: { type: String, required: true },
    isGroupchat: { type: Boolean, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupPic: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatModel);
module.exports = Chat;
