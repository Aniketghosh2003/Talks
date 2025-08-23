import React, { useState, useEffect, useContext } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { myContext } from "./MainComponent";

function Groups() {
  const lightTheme = useSelector((state) => state.themeKey);
  const dispatch = useDispatch();
  const { refresh, setRefresh } = useContext(myContext);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData"));

  // Fetch available groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/chat/fetchGroups`, 
          config
        );
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [refresh, userData.data.token]);

  // Join group handler
  const handleJoinGroup = async (groupId) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_API_URL}/chat/addSelfToGroup`,
        {
          chatId: groupId,
          userId: userData.data._id,
        },
        config
      );

      setRefresh(!refresh); // Trigger sidebar refresh
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-[0.7] flex flex-col ${!lightTheme ? "bg-gray-800" : ""}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 p-3 m-3 rounded-2xl shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}>
        <img
          src="/Talks-official-icon.png"
          alt="Talks Logo"
          className="h-10 w-10 object-contain rounded-xl"
        />
        <p className={`text-ld font-semibold ${!lightTheme ? "text-white" : ""}`}>
          Available Groups
        </p>
      </div>

      {/* Search bar */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`rounded-2xl p-3 m-3 flex items-center shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}
      >
        <IconButton>
          <SearchIcon className={!lightTheme ? "text-white" : ""} />
        </IconButton>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search groups..."
          className={`outline-none border-none text-lg w-full px-3 py-2
            ${lightTheme ? "bg-white" : "bg-gray-700 text-white placeholder-gray-400"}`}
        />
      </motion.div>

      {/* Groups list */}
      <div className="messages-container flex-1 overflow-y-auto space-y-3 p-3">
        {filteredGroups.map((group) => (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            key={group._id}
            onClick={() => handleJoinGroup(group._id)}
            className={`flex items-center p-4 rounded-2xl shadow-md cursor-pointer 
              transition-colors ${loading ? "opacity-50 pointer-events-none" : ""}
              ${lightTheme ? "bg-white hover:bg-gray-50" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            <div className="flex items-center gap-4 w-full">
              <div className={`rounded-full h-12 w-12 flex items-center justify-center
                ${lightTheme ? "bg-gray-200 text-gray-500" : "bg-gray-600 text-white"}`}>
                <span className="text-xl font-semibold">
                  {group.chatName[0]}
                </span>
              </div>
              <div className="flex flex-col">
                <p className={`text-lg font-medium 
                  ${!lightTheme ? "text-white" : "text-gray-700"}`}>
                  {group.chatName}
                </p>
                <p className={`text-sm 
                  ${!lightTheme ? "text-gray-300" : "text-gray-500"}`}>
                  {group.users?.length || 0} members
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Groups;