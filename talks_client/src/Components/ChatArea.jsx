import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageOthers from "./MessageOthers";
import MessageSelf from "./MessageSelf";
import { useSelector } from "react-redux";
import axios from "axios";

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [selectedChat, setSelectedChat] = useState({
    name: "User Name",
    timeStamp: "today",
    lastMessage: "Welcome to the chat!",
  });
  const [messageContent, setMessageContent] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [allMessagesCopy, setAllMessagesCopy] = useState([]);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const chat_id = window.location.pathname.split("/").pop();
  const self_id = userData?.data?._id;

  const ENDPOINT = "http://localhost:8080";

  // Fetch messages when component loads
  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    axios.get(`${ENDPOINT}/message/` + chat_id, config).then(({ data }) => {
      setAllMessages(data);
      setLoaded(true);
    });

    setAllMessagesCopy(allMessages);
  }, [chat_id, userData.data.token]);

  // Function to send message
  const sendMessage = () => {
    if (messageContent.trim() === "") return;

    const data = null;
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    axios
      .post(
        `${ENDPOINT}/message/`,
        {
          content: messageContent,
          chatId: chat_id,
        },
        config
      )
      .then(({ response }) => {
        data = response;
        console.log("Message Fired");

        // Refresh messages after sending
        refreshMessages();
      });

    setMessageContent("");
  };

  // Function to refresh messages
  const refreshMessages = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    axios.get(`${ENDPOINT}/message/` + chat_id, config).then(({ data }) => {
      setAllMessages(data);
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
      .slice(0)
      .reverse()
      .map((message, index) => {
        const sender = message.sender;
        if (sender._id === self_id) {
          return <MessageSelf props={message} key={index} />;
        } else {
          return <MessageOthers props={message} key={index} />;
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
          {selectedChat.name[0]}
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
        className={`messages-container flex-1 p-2.5 m-2.5 rounded-2xl overflow-y-scroll shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}
      >
        {loaded ? (
          renderMessages()
        ) : (
          <p className={`text-center ${!lightTheme ? "text-white" : ""}`}>
            Loading messages...
          </p>
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
