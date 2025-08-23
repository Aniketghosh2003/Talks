import React, { useState, useEffect, useContext } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightIcon from "@mui/icons-material/Nightlight";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import ConversationItem from "./ConversationItem";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import { refreshSidebarFun } from "../redux/refreshSidebar";
import LightModeIcon from "@mui/icons-material/LightMode";
import { motion } from "framer-motion";
import axios from "axios";
import { myContext } from "./MainComponent";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey);
  const refreshSidebar = useSelector((state) => state.refreshSidebar);
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/chat/`, config);
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [refresh, refreshSidebar, userData, navigate]);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("userData");
    // Navigate to login
    navigate("/");
  };

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
          <IconButton
            size="medium"
            onClick={handleLogout}
            className={!lightTheme ? "hover:bg-gray-600" : ""}
            title="Logout"
          >
            <ExitToAppIcon
              fontSize="medium"
              className={!lightTheme ? "text-white" : ""}
            />
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
      <div className={`rounded-xl px-3 py-2 m-2 flex-1 overflow-y-auto shadow-md space-y-2
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}>
        {conversations.map((conversation, index) => {
          // console.log("current convo : ", conversation);
          if (conversation.users.length === 1) {
            return <div key={index}></div>;
          }
          
          // Find the other user (not the current logged-in user)
          const otherUser = conversation.users.find(user => user._id !== userData.data._id);
          
          if (!otherUser) {
            return <div key={index}></div>; // Skip if no other user found
          }
          
          if (conversation.latestMessage === undefined) {
            // console.log("No Latest Message with ", otherUser);
            return (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-2
                  ${index % 2 === 0 
                    ? (lightTheme ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-600 hover:bg-gray-500")
                    : (lightTheme ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-650 hover:bg-gray-600")
                  }
                `}
                onClick={() => {
                  // dispatch(refreshSidebarFun());
                  setRefresh(!refresh);
                  // Only use the conversation._id for navigation, no extra params
                  if (conversation._id) {
                    navigate(`/app/chat/${conversation._id}`);
                  } else {
                    console.error("No conversation._id found!");
                  }
                }}
              >
                <div className="conversation-container">
                  <p className={"con-icon" + (lightTheme ? "" : " dark")}>
                    {otherUser.name[0]}
                  </p>
                  <p className={"con-title" + (lightTheme ? "" : " dark")}>
                    {otherUser.name}
                  </p>

                  <p className="con-lastMessage">
                    No previous Messages, click here to start a new chat
                  </p>
                  {/* <p className={"con-timeStamp" + (lightTheme ? "" : " dark")}>
                {conversation.timeStamp}
              </p> */}
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-2
                  ${index % 2 === 0 
                    ? (lightTheme ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-600 hover:bg-gray-500")
                    : (lightTheme ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-650 hover:bg-gray-600")
                  }
                `}
                onClick={() => {
                  // Only use the conversation._id for navigation, no extra params
                  if (conversation._id) {
                    navigate(`/app/chat/${conversation._id}`);
                  } else {
                    console.error("No conversation._id found!");
                  }
                }}
              >
                <div className="conversation-container">
                  <p className={"con-icon" + (lightTheme ? "" : " dark")}>
                    {otherUser.name[0]}
                  </p>
                  <p className={"con-title" + (lightTheme ? "" : " dark")}>
                    {otherUser.name}
                  </p>

                  <p className="con-lastMessage">
                    {conversation.latestMessage.content}
                  </p>
                  {/* <p className={"con-timeStamp" + (lightTheme ? "" : " dark")}>
                {conversation.timeStamp}
              </p> */}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

export default Sidebar;
