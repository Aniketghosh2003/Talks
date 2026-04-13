const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    // Clean the chatId to remove any extra parameters
    const cleanChatId = req.params.chatId.split('&')[0];
    
    const messages = await Message.find({ chat: cleanChatId })
      .populate("sender", "name email profilePic")
      .populate("receiver")
      .populate("chat")
      .sort({ createdAt: 1 }); // Sort by creation time (oldest first)
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId, attachment } = req.body;
  const hasText = typeof content === "string" && content.trim().length > 0;
  const hasAttachment = attachment && typeof attachment.data === "string";

  if (!chatId || (!hasText && !hasAttachment)) {
    // console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  if (hasAttachment && attachment.data.length > 7_000_000) {
    return res.status(413).json({ message: "Attachment is too large" });
  }

  var newMessage = {
    sender: req.user._id,
    content: hasText ? content : "",
    chat: chatId,
  };

  if (hasAttachment) {
    newMessage.attachment = {
      name: attachment.name,
      mimeType: attachment.mimeType,
      size: attachment.size,
      data: attachment.data,
    };
  }

  try {
    var message = await Message.create(newMessage);

    // console.log(message);
    message = await message.populate("sender", "name email profilePic");
    message = await message.populate("chat");
    message = await message.populate("receiver");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const markMessagesRead = expressAsyncHandler(async (req, res) => {
  try {
    const cleanChatId = req.params.chatId.split('&')[0];
    // Mark all messages in this chat as read where the current user is NOT the sender
    await Message.updateMany(
      { chat: cleanChatId, sender: { $ne: req.user._id }, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage, markMessagesRead };
