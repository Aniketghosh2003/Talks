import React, { useState, useEffect, useContext, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageOthers from "./MessageOthers";
import MessageSelf from "./MessageSelf";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { myContext } from "./MainComponent";

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const { _id } = useParams();
  const { refresh, setRefresh } = useContext(myContext);
  const messagesEndRef = useRef(null);
  const [selectedChat, setSelectedChat] = useState({
    name: "Loading...",
    timeStamp: "",
    lastMessage: "",
  });
  const [messageContent, setMessageContent] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  const userData = JSON.parse(localStorage.getItem("userData"));
  // Clean the chat_id to remove any extra parameters like &username
  const chat_id = _id ? _id.split('&')[0] : null;
  const self_id = userData?.data?._id;

  // Fetch chat details and messages when component loads
  useEffect(() => {
    if (!chat_id || !userData?.data?.token) return;
    
    // Validate if chat_id is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chat_id);
    if (!isValidObjectId) {
      console.error("Invalid chat ID format:", chat_id);
      setLoaded(true);
      return;
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    // Fetch chat details first
    axios.get(`${import.meta.env.VITE_API_URL}/chat/`, config)
      .then(({ data }) => {
        const currentChat = data.find(chat => chat._id === chat_id);
        if (currentChat) {
          // Find the other user (not the current logged-in user)
          const otherUser = currentChat.users.find(user => user._id !== userData.data._id);
          if (otherUser) {
            setSelectedChat({
              name: otherUser.name,
              timeStamp: "online",
              lastMessage: currentChat.latestMessage?.content || "No messages yet",
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching chat details:", error);
      });

    // Fetch messages
    axios.get(`${import.meta.env.VITE_API_URL}/message/${chat_id}`, config)
      .then(({ data }) => {
        setPreviousMessageCount(data.length);
        setAllMessages(data);
        setLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        setLoaded(true);
      });
  }, [chat_id, userData?.data?.token]);

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

    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/message/`,
        {
          content: messageContent,
          chatId: chat_id,
        },
        config
      )
      .then(({ data }) => {
        // Add a small delay to ensure message is saved before refreshing
        setTimeout(() => {
          refreshMessages();
          // Trigger sidebar refresh to update latest message
          setRefresh(!refresh);
          // Scroll to bottom to show new message
          setTimeout(() => scrollToBottom(), 100);
        }, 200);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });

    setMessageContent("");
  };

  // Function to refresh messages and chat details
  const refreshMessages = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    // Fetch updated messages
    axios.get(`${import.meta.env.VITE_API_URL}/message/` + chat_id, config)
      .then(({ data }) => {
        setPreviousMessageCount(data.length);
        setAllMessages(data);
      })
      .catch((error) => {
        console.error("Error refreshing messages:", error);
      });

    // Also refresh chat details to update latest message in header
    axios.get(`${import.meta.env.VITE_API_URL}/chat/`, config)
      .then(({ data }) => {
        const currentChat = data.find(chat => chat._id === chat_id);
        if (currentChat) {
          const otherUser = currentChat.users.find(user => user._id !== userData.data._id);
          if (otherUser) {
            setSelectedChat({
              name: otherUser.name,
              timeStamp: "online",
              lastMessage: currentChat.latestMessage?.content || "No messages yet",
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
      setMessageContent("");
    }
  };

  // Render messages based on sender
  const renderMessages = () => {
    return allMessages
      .map((message, index) => {
        const sender = message.sender;
        if (sender._id === self_id) {
          return <MessageSelf props={message} isDark={!lightTheme} key={index} />;
        } else {
          return <MessageOthers props={message} isDark={!lightTheme} key={index} />;
        }
      });
  };

  return (
    <div
      className={`flex-[0.7] flex flex-col ${!lightTheme ? "bg-gray-800" : ""}`}
    >
      <div
        className={`flex items-center gap-2.5 p-2.5 m-2.5 rounded-2xl shadow-md ${
          lightTheme ? "bg-white" : "bg-gray-700"
        }`}
      >
        <p
          className={`flex items-center justify-center bg-[#d9d9d9] text-white text-2xl font-bold h-8 w-8 p-0.5 rounded-full self-center 
          ${lightTheme ? "bg-[#d9d9d9]" : "bg-gray-600"}`}
        >
          {selectedChat.name && selectedChat.name !== "Loading..." ? selectedChat.name[0] : "U"}
        </p>
        <div className="flex flex-col justify-center flex-1">
          <p className={!lightTheme ? "text-white" : ""}>{selectedChat.name}</p>
          <p className={!lightTheme ? "text-gray-300" : "text-gray-600"}>
            {selectedChat.timeStamp}
          </p>
        </div>
        <IconButton>
          <DeleteIcon className={!lightTheme ? "text-white" : ""} />
        </IconButton>
      </div>

      <div
        className={`messages-container flex-1 p-2.5 m-2.5 rounded-2xl overflow-y-auto shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {loaded ? (
          <>
            {allMessages.length > 0 ? (
              <>
                {renderMessages()}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={`text-center ${!lightTheme ? "text-gray-300" : "text-gray-500"}`}>
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={`text-center ${!lightTheme ? "text-white" : ""}`}>
              Loading messages...
            </p>
          </div>
        )}
      </div>

      <div
        className={`p-2.5 m-2.5 rounded-2xl flex justify-between shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}
      >
        <input
          placeholder="Type a Message"
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`outline-none border-none text-lg flex-1 mr-2
            ${
              lightTheme
                ? "bg-white"
                : "bg-gray-700 text-white placeholder-gray-400"
            }`}
        />
        <IconButton onClick={sendMessage}>
          <SendIcon className={!lightTheme ? "text-white" : ""} />
        </IconButton>
      </div>
    </div>
  );
}

export default ChatArea;
