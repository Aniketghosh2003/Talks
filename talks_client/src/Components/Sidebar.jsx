import React, { useState, useEffect, useContext } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightIcon from "@mui/icons-material/Nightlight";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import ConversationItem from "./ConversationItem";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import LightModeIcon from "@mui/icons-material/LightMode";
import { motion } from "framer-motion";
import axios from "axios";
import { myContext } from "./MainComponent";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey);
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (!userData) {
      console.log("User not Authenticated");
      navigate("/");
      return;
    }

    const fetchConversations = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };
        const response = await axios.get("http://localhost:3000/chat/", config);
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [refresh, userData, navigate]);

  const filteredConversations = conversations.filter(conversation => {
    const chatName = conversation.isGroupChat 
      ? conversation.chatName 
      : conversation.users.find(user => user._id !== userData?.data._id)?.name;
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`flex-[0.3] flex flex-col ${!lightTheme ? "bg-gray-800" : ""}`}>
      {/* Header with icons */}
      <div className={`rounded-xl px-3 py-2 m-2 flex justify-between shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}>
        <div>
          <IconButton
            size="medium"
            className={!lightTheme ? "hover:bg-gray-600" : ""}
          >
            <AccountCircleIcon
              fontSize="medium"
              className={!lightTheme ? "text-white" : ""}
            />
          </IconButton>
        </div>
        <div className="flex space-x-2">
          <IconButton
            size="medium"
            onClick={() => navigate("/app/users")}
            className={!lightTheme ? "hover:bg-gray-600" : ""}
          >
            <PersonAddIcon
              fontSize="medium"
              className={!lightTheme ? "text-white" : ""}
            />
          </IconButton>
          <IconButton
            size="medium"
            onClick={() => navigate("/app/groups")}
            className={!lightTheme ? "hover:bg-gray-600" : ""}
          >
            <GroupAddIcon
              fontSize="medium"
              className={!lightTheme ? "text-white" : ""}
            />
          </IconButton>
          <IconButton
            size="medium"
            onClick={() => navigate("/app/create-groups")}
            className={!lightTheme ? "hover:bg-gray-600" : ""}
          >
            <AddCircleIcon
              fontSize="medium"
              className={!lightTheme ? "text-white" : ""}
            />
          </IconButton>
          <IconButton
            size="medium"
            onClick={() => dispatch(toggleTheme())}
            className={!lightTheme ? "hover:bg-gray-600" : ""}
          >
            {lightTheme ? (
              <NightlightIcon
                fontSize="medium"
                className={!lightTheme ? "text-white" : ""}
              />
            ) : (
              <LightModeIcon fontSize="medium" className="text-white" />
            )}
          </IconButton>
        </div>
      </div>

      {/* Search bar */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`rounded-xl px-3 py-2 m-2 flex items-center shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}
      >
        <IconButton>
          <SearchIcon className={!lightTheme ? "text-white" : ""} />
        </IconButton>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className={`outline-none border-none text-lg ml-2 flex-1
            ${lightTheme ? "bg-white" : "bg-gray-700 text-white placeholder-gray-400"}`}
        />
      </motion.div>

      {/* Conversations list */}
      <div className={`rounded-xl px-3 py-2 m-2 flex-1 overflow-y-auto shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}>
        {filteredConversations.map((conversation) => {
          const chatName = conversation.isGroupChat 
            ? conversation.chatName 
            : conversation.users.find(user => user._id !== userData?.data._id)?.name;

          return (
            <ConversationItem
              key={conversation._id}
              props={{
                _id: conversation._id,
                name: chatName || "Unknown",
                lastMessage: conversation.latestMessage 
                  ? conversation.latestMessage.content 
                  : "No previous messages",
                timeStamp: conversation.latestMessage 
                  ? new Date(conversation.latestMessage.createdAt).toLocaleTimeString() 
                  : "New",
                isGroup: conversation.isGroupChat
              }}
              isDark={!lightTheme}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
