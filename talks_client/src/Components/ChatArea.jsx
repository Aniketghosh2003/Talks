import React, { useState, useEffect, useContext, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageOthers from "./MessageOthers";
import MessageSelf from "./MessageSelf";
import ContactInfoPanel from "./ContactInfoPanel";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { myContext } from "./MainComponent";

var selectedChatCompare;

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const { _id } = useParams();
  const { refresh, setRefresh, socket, onlineUsers = [] } = useContext(myContext);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedChat, setSelectedChat] = useState({
    name: "Loading...",
    timeStamp: "",
    lastMessage: "",
    isGroup: false,
    profilePic: null,
  });
  const [otherUserFull, setOtherUserFull] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [groupAdmin, setGroupAdmin] = useState(null);
  const [groupPic, setGroupPic] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [, setPreviousMessageCount] = useState(0);
  const [, setSocketConnected] = useState(false);

  // Safe user data unwrap helper
  const getUserDataSafely = () => {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.data && parsed.data.token) return parsed;
      if (parsed.token) return { data: parsed };
      return parsed; // fallback
    } catch {
      return null;
    }
  };
  const userData = getUserDataSafely();

  // Clean the chat_id to remove any extra parameters like &username
  const chat_id = _id ? _id.split('&')[0] : null;
  const self_id = userData?.data?._id;
  // Fetch chat details and messages when component loads
  useEffect(() => {
    const token = userData?.data?.token;
    if (!chat_id || !token) return;

    // Validate if chat_id is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chat_id);
    if (!isValidObjectId) {
      console.error("Invalid chat ID format:", chat_id);
      setLoaded(true);
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch chat details first
    fetch(`${import.meta.env.VITE_API_URL}/chat/`, {
      method: "GET",
      headers: config.headers,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch chat details");
        }
        const currentChat = data.find(chat => chat._id === chat_id);
        if (currentChat) {
          // Find the other user (not the current logged-in user)
          const otherUser = currentChat.users.find(user => user._id !== self_id);
          if (otherUser || currentChat.isGroupchat) {
            setOtherUserFull(otherUser || null);
            setChatUsers(currentChat.users);
            setGroupAdmin(currentChat.groupAdmin);
            setGroupPic(currentChat.groupPic || null);
            setSelectedChat({
              name: currentChat.isGroupchat
                ? currentChat.chatName
                : (otherUser?.name || "Unknown"),
              timeStamp: currentChat.isGroupchat
                ? `${currentChat.users.length} participants`
                : (otherUser && onlineUsers.includes(otherUser._id) ? "online" : "offline"),
              lastMessage: currentChat.latestMessage?.content || "No messages yet",
              isGroup: currentChat.isGroupchat,
              profilePic: currentChat.isGroupchat ? null : (otherUser?.profilePic || null),
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching chat details:", error);
      });

    // Fetch messages
    fetch(`${import.meta.env.VITE_API_URL}/message/${chat_id}`, {
      method: "GET",
      headers: config.headers,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        setPreviousMessageCount(data.length);
        setAllMessages(data);
        setLoaded(true);
        if (socket) {
          socket.emit("join chat", chat_id);
        }
        selectedChatCompare = chat_id;

        // Mark all incoming messages as read via REST
        fetch(`${import.meta.env.VITE_API_URL}/message/read/${chat_id}`, {
          method: "PUT",
          headers: {
            ...config.headers,
            "Content-type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to mark messages as read");
            }
            // Notify other users in the room via socket that we read the messages
            if (socket && self_id) {
              socket.emit("messages read", { chatId: chat_id, readerId: self_id });
            }
          })
          .catch(() => { }); // silent: non-critical
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        setLoaded(true);
      });
  }, [chat_id, userData?.data?.token]);

  // Handle incoming messages + delivery/read receipts
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare !== newMessageRecieved.chat._id) {
        setRefresh((prev) => !prev);
      } else {
        setAllMessages((prev) => [...prev, newMessageRecieved]);
      }
    };

    // A message we sent was delivered to the recipient
    const handleDelivered = ({ messageId }) => {
      setAllMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && m.status === 'sent'
            ? { ...m, status: 'delivered' }
            : m
        )
      );
    };

    // The recipient opened our chat and read all messages
    const handleRead = ({ chatId }) => {
      if (chatId !== selectedChatCompare) return;
      setAllMessages((prev) =>
        prev.map((m) =>
          m.sender?._id === self_id && m.status !== 'read'
            ? { ...m, status: 'read' }
            : m
        )
      );
    };

    socket.on("message recieved", handleNewMessage);
    socket.on("message delivered", handleDelivered);
    socket.on("messages read", handleRead);

    return () => {
      socket.off("message recieved", handleNewMessage);
      socket.off("message delivered", handleDelivered);
      socket.off("messages read", handleRead);
    };
  }, [socket, self_id, setRefresh]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to send message
  const sendMessage = () => {
    if (messageContent.trim() === "") return;

    const token = userData?.data?.token;
    if (!token) return;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    fetch(`${import.meta.env.VITE_API_URL}/message/`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        content: messageContent,
        chatId: chat_id,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        if (socket) {
          socket.emit("new message", data);
        }
        // Force refresh all internal states
        setTimeout(() => {
          refreshMessages();
          // Trigger sidebar refresh to update latest message
          setRefresh((prev) => !prev);
          // Scroll to bottom to show new message
          setTimeout(() => scrollToBottom(), 100);
        }, 200);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });

    setMessageContent("");
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAttachmentError("");

    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError("Attachment too large. Max size is 5MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      sendAttachment({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        data: reader.result,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const sendAttachment = (attachment) => {
    const token = userData?.data?.token;
    if (!token || !attachment?.data) return;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    fetch(`${import.meta.env.VITE_API_URL}/message/`, {
      method: "POST",
      headers: {
        ...config.headers,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        content: "",
        chatId: chat_id,
        attachment,
      }),
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : { message: await response.text() };
        if (!response.ok) {
          throw new Error(data?.message || "Failed to send attachment");
        }
        if (socket) {
          socket.emit("new message", data);
        }
        setTimeout(() => {
          refreshMessages();
          setRefresh((prev) => !prev);
          setTimeout(() => scrollToBottom(), 100);
        }, 200);
      })
      .catch((error) => {
        console.error("Error sending attachment:", error);
        setAttachmentError(error.message || "Failed to send attachment");
      });
  };

  // Function to refresh messages and chat details
  const refreshMessages = () => {
    const token = userData?.data?.token;
    if (!token) return;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch updated messages
    fetch(`${import.meta.env.VITE_API_URL}/message/` + chat_id, {
      method: "GET",
      headers: config.headers,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to refresh messages");
        }
        setPreviousMessageCount(data.length);
        setAllMessages(data);
      })
      .catch((error) => {
        console.error("Error refreshing messages:", error);
      });

    // Also refresh chat details to update latest message in header
    fetch(`${import.meta.env.VITE_API_URL}/chat/`, {
      method: "GET",
      headers: config.headers,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to refresh chat details");
        }
        const currentChat = data.find(chat => chat._id === chat_id);
        if (currentChat) {
          const otherUser = currentChat.users.find(user => user._id !== self_id);
          if (otherUser || currentChat.isGroupchat) {
            setSelectedChat({
              name: currentChat.isGroupchat
                ? currentChat.chatName
                : (otherUser?.name || "Unknown"),
              timeStamp: currentChat.isGroupchat
                ? `${currentChat.users.length} participants`
                : (otherUser && onlineUsers.includes(otherUser._id) ? "online" : "offline"),
              lastMessage: currentChat.latestMessage?.content || "No messages yet",
              isGroup: currentChat.isGroupchat,
              profilePic: currentChat.isGroupchat ? null : (otherUser?.profilePic || null),
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error refreshing chat details:", error);
      });
  };

  // Handle key down event for Enter key
  const handleKeyDown = (event) => {
    if (event.code === "Enter") {
      sendMessage();
    }
  };

  // Render messages based on sender
  const renderMessages = () => {
    return allMessages
      .map((message, index) => {
        const sender = message.sender || {};
        if (sender._id === self_id) {
          return <MessageSelf props={message} isDark={!lightTheme} key={index} />;
        } else {
          return <MessageOthers props={message} isDark={!lightTheme} isGroup={selectedChat.isGroup} key={index} />;
        }
      });
  };

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden relative
      ${lightTheme ? "bg-[#efeae2]" : "bg-[#0b141a]"}`}
    >
      {/* Background Pattern - Optional WhatsApp Doodle style base */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'url("https://archive.org/download/whatsapp-chat-background/whatsapp-chat-background.png")',
        backgroundSize: '400px'
      }}></div>

      <div
        className={`px-2 md:px-4 py-2.5 flex items-center shrink-0 h-[59px] border-l z-10
        ${lightTheme ? "bg-[#f0f2f5] border-[#d1d7db]" : "bg-[#202c33] border-[#222d34]"}`}
      >
        <IconButton
          size="small"
          onClick={() => navigate("/app/welcome")}
          className="md:hidden"
        >
          <ArrowBackIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
        </IconButton>
        <div
          className={`flex items-center justify-center text-white text-xl mr-4 shrink-0 font-normal h-[40px] w-[40px] rounded-full overflow-hidden cursor-pointer
          ${selectedChat.isGroup
              ? (groupPic ? "bg-transparent" : "bg-[#00a884]")
              : (selectedChat.profilePic ? "bg-transparent" : "bg-[#6b7c85]")}`}
          onClick={() => setShowContactInfo(true)}
        >
          {selectedChat.isGroup ? (
            groupPic ? (
              <img src={groupPic} alt={selectedChat.name} className="w-full h-full object-cover" />
            ) : "👥"
          ) : (
            selectedChat.profilePic ? (
              <img src={selectedChat.profilePic} alt={selectedChat.name} className="w-full h-full object-cover" />
            ) : (
              selectedChat.name && selectedChat.name !== "Loading..." ? selectedChat.name[0] : "U"
            )
          )}
        </div>
        <div className="flex flex-col justify-center flex-1 cursor-pointer" onClick={() => setShowContactInfo(true)}>
          <p className={`text-[16px] truncate ${lightTheme ? "text-[#111b21]" : "text-[#e9edef]"}`}>{selectedChat.name}</p>
          <p className={`text-[13px] truncate ${lightTheme ? "text-[#667781]" : "text-[#8696a0]"}`}>
            {selectedChat.timeStamp}
          </p>
        </div>
        <div className="flex space-x-3 text-[#54656f]">
          {/* Placeholder for standard right actions like search/menu */}
          <IconButton size="small">
            <SearchIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
          </IconButton>
        </div>
      </div>

      <div
        className={`messages-container flex-1 px-[5%] py-4 overflow-y-auto overflow-x-hidden z-10 flex flex-col`}
        style={{ scrollbarWidth: "thin" }}
      >
        {loaded ? (
          <>
            {allMessages.length > 0 ? (
              <>
                {renderMessages()}
                <div ref={messagesEndRef} className="pt-2" />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className={`px-4 py-2 rounded-lg text-sm shadow-sm ${lightTheme ? "bg-[#ffeecd] text-[#54656f]" : "bg-[#182229] text-[#ffd279]"}`}>
                  Start a new conversation
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className={`px-4 py-2 rounded-lg text-sm shadow-sm ${lightTheme ? "bg-white text-gray-500" : "bg-[#202c33] text-gray-400"}`}>
              Loading messages...
            </div>
          </div>
        )}
      </div>

      <div
        className={`px-4 py-3 min-h-[62px] shrink-0 flex items-end z-10 border-l
        ${lightTheme ? "bg-[#f0f2f5] border-[#d1d7db]" : "bg-[#202c33] border-[#222d34]"}`}
      >
        <div className="flex-1 flex flex-col gap-1">
          {attachmentError ? (
            <p className={`text-[12px] ${lightTheme ? "text-red-600" : "text-red-400"}`}>{attachmentError}</p>
          ) : null}
        <div className={`rounded-lg flex items-center px-4 overflow-hidden
            ${lightTheme ? "bg-white" : "bg-[#2a3942]"}`}>
          <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
            <AttachFileIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />
          <input
            placeholder="Type a message"
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`outline-none border-none text-[15px] py-3 w-full bg-transparent
              ${lightTheme ? "text-[#111b21] placeholder-[#54656f]" : "text-[#e9edef] placeholder-[#8696a0]"}`}
          />
        </div>
        </div>
        <div className="ml-2 mb-[1px]">
          <IconButton onClick={sendMessage} size="medium">
            <SendIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
          </IconButton>
        </div>
      </div>

      {/* Contact / Group info sliding panel */}
      {showContactInfo && (
        <ContactInfoPanel
          user={otherUserFull}
          isGroup={selectedChat.isGroup}
          groupUsers={chatUsers}
          chatId={chat_id}
          groupAdmin={groupAdmin}
          groupPic={groupPic}
          currentUserId={self_id}
          onGroupPicUpdate={(newPic) => setGroupPic(newPic)}
          onClose={() => setShowContactInfo(false)}
        />
      )}
    </div>
  );
}

export default ChatArea;
