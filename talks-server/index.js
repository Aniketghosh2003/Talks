const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");

// Load env vars
dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Initialize DB connection
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ message: "File too large. Please upload a smaller file." });
  }
  return next(err);
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");

    // Add to online users and broadcast
    connectedUsers.set(socket.id, userData._id);
    io.emit("online users", Array.from(new Set(connectedUsers.values())));
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      // Notify recipient of the new message
      socket.in(user._id).emit("message recieved", newMessageRecieved);

      // Notify sender that message was delivered to this recipient
      // (only if recipient is online)
      if ([...connectedUsers.values()].includes(user._id)) {
        socket.in(newMessageRecieved.sender._id).emit("message delivered", {
          messageId: newMessageRecieved._id,
          chatId: chat._id,
        });
      }
    });
  });

  // When a user opens a chat, mark messages as read and notify senders
  socket.on("messages read", ({ chatId, readerId }) => {
    // Broadcast to everyone in the chat room that this user read the messages
    socket.to(chatId).emit("messages read", { chatId, readerId });
  });

  socket.on("disconnect", () => {
    //console.log("USER DISCONNECTED");
    if (connectedUsers.has(socket.id)) {
      connectedUsers.delete(socket.id);
      io.emit("online users", Array.from(new Set(connectedUsers.values())));
    }
  });
});
