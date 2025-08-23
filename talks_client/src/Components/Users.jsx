import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Users() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/fetchUsers`,
          config
        );
        // Filter out the current user from the list
        const filteredUsers = response.data.filter(user => user._id !== userData.data._id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [userData.data.token]);

  // Create chat handler
  const createChat = async (userId) => {
    try {
      setLoading(true);
      
      // Check if userId exists
      if (!userId) {
        console.error("No userId provided");
        return;
      }

      // Check if user is trying to chat with themselves
      if (userId === userData.data._id) {
        console.error("Cannot create chat with yourself");
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/`,
        { userId: userId },
        config
      );

      navigate(`/app/chat/${response.data._id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      console.error("Error response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex-[0.7] flex flex-col ${!lightTheme ? "bg-gray-800" : ""}`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-3 p-3 m-3 rounded-2xl shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}
      >
        <img
          src="/Talks-official-icon.png"
          alt="Talks Logo"
          className="h-10 w-10 object-contain rounded-xl"
        />
        <p
          className={`text-ld font-semibold ${!lightTheme ? "text-white" : ""}`}
        >
          Online Users
        </p>
      </div>

      {/* Search Bar */}
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
          placeholder="Search users..."
          className={`outline-none border-none text-lg w-full px-3 py-2
            ${
              lightTheme
                ? "bg-white"
                : "bg-gray-700 text-white placeholder-gray-400"
            }`}
        />
      </motion.div>

      {/* Users List */}
      <div className="messages-container flex-1 overflow-y-auto space-y-3 p-3">
        {filteredUsers.map((user) => (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            key={user._id}
            onClick={() => createChat(user._id)}
            className={`flex items-center p-4 rounded-2xl shadow-md cursor-pointer 
              transition-colors ${loading ? "opacity-50" : ""}
              ${
                lightTheme
                  ? "bg-white hover:bg-gray-50"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
          >
            <div className="flex items-center gap-4 w-full">
              <div
                className={`rounded-full h-12 w-12 flex items-center justify-center
                ${
                  lightTheme
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gray-600 text-white"
                }`}
              >
                <span className="text-xl font-semibold">{user.name[0]}</span>
              </div>
              <div className="flex flex-col">
                <p
                  className={`text-lg font-medium 
                  ${!lightTheme ? "text-white" : "text-gray-700"}`}
                >
                  {user.name}
                </p>
                <p className={!lightTheme ? "text-gray-300" : "text-gray-500"}>
                  {user.email}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Users;
