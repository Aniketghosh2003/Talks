import React, { useState, useEffect, useContext } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightIcon from "@mui/icons-material/Nightlight";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/themeSlice";
import LightModeIcon from "@mui/icons-material/LightMode";
import { myContext } from "./MainComponent";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey);
  const refreshSidebar = useSelector((state) => state.refreshSidebar);
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const getUserDataSafely = () => {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.data?.token) return parsed;
      if (parsed?.token) return { data: parsed };
      return parsed;
    } catch {
      return null;
    }
  };

  const userData = getUserDataSafely();
  const token = userData?.data?.token || userData?.token;
  const currentUserId = userData?.data?._id || userData?._id;
  const [currentUserProfilePic, setCurrentUserProfilePic] = useState(
    userData?.data?.profilePic || userData?.profilePic || null
  );
  const [currentUserInitial, setCurrentUserInitial] = useState(
    userData?.data?.name?.[0]?.toUpperCase() || userData?.name?.[0]?.toUpperCase() || "U"
  );

  useEffect(() => {
    if (!token) return;

    const fetchMyProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        setCurrentUserProfilePic(responseData.profilePic || null);
        setCurrentUserInitial(responseData.name?.[0]?.toUpperCase() || "U");

        const stored = getUserDataSafely();
        if (stored?.data) {
          stored.data.name = responseData.name || stored.data.name;
          stored.data.profilePic = responseData.profilePic || "";
          stored.data.about = responseData.about || stored.data.about;
          localStorage.setItem("userData", JSON.stringify(stored));
        } else if (stored) {
          stored.name = responseData.name || stored.name;
          stored.profilePic = responseData.profilePic || "";
          stored.about = responseData.about || stored.about;
          localStorage.setItem("userData", JSON.stringify(stored));
        }
      } catch (error) {
        console.error("Error fetching profile for sidebar:", error);
      }
    };

    fetchMyProfile();
  }, [token, refresh, refreshSidebar]);

  useEffect(() => {
    if (!userData) {
      //console.log("User not Authenticated");
      navigate("/");
      return;
    }

    const fetchConversations = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/`, {
          method: "GET",
          headers: config.headers,
        });
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }
        setConversations(Array.isArray(responseData) ? responseData : []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [refresh, refreshSidebar, token, navigate]);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("userData");
    // Navigate to login
    navigate("/");
  };

  return (
    <div className={`w-full h-full flex flex-col border-r ${!lightTheme ? "bg-[#111b21] border-[#222d34]" : "bg-white border-[#d1d7db]"}`}>
      {/* Header with icons */}
      <div className={`px-4 py-2.5 flex justify-between items-center h-[59px] shrink-0
        ${lightTheme ? "bg-[#f0f2f5]" : "bg-[#202c33]"}`}>
        <div>
          <button
            onClick={() => navigate("/app/profile")}
            title="Edit Profile"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: lightTheme ? "#00a884" : "#2a3942",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {currentUserProfilePic ? (
              <img
                src={currentUserProfilePic}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              currentUserInitial
            )}
          </button>
        </div>
        <div className="flex space-x-1">
          <IconButton size="small" onClick={() => navigate("/app/users")} title="Users">
            <PersonAddIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
          </IconButton>
          <IconButton size="small" onClick={() => navigate("/app/groups")} title="Available Groups">
            <GroupAddIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
          </IconButton>
          <IconButton size="small" onClick={() => navigate("/app/create-groups")} title="Create Group">
            <AddCircleIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
          </IconButton>
          <IconButton size="small" onClick={() => dispatch(toggleTheme())} title="Toggle Theme">
            {lightTheme ? (
              <NightlightIcon fontSize="small" className="text-[#54656f]" />
            ) : (
              <LightModeIcon fontSize="small" className="text-[#aebac1]" />
            )}
          </IconButton>
          <IconButton size="small" onClick={handleLogout} title="Logout">
            <ExitToAppIcon fontSize="small" className={!lightTheme ? "text-[#aebac1]" : "text-[#54656f]"} />
          </IconButton>
        </div>
      </div>

      {/* Search bar */}
      <div className={`px-3 py-2 flex items-center border-b ${lightTheme ? "bg-white border-[#f0f2f5]" : "bg-[#111b21] border-[#222d34]"}`}>
        <div className={`rounded-lg px-3 py-1.5 flex items-center w-full
          ${lightTheme ? "bg-[#f0f2f5]" : "bg-[#202c33]"}`}>
          <SearchIcon fontSize="small" className={!lightTheme ? "text-[#aebac1] mr-3" : "text-[#54656f] mr-3"} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className={`outline-none border-none text-[15px] flex-1 bg-transparent
              ${lightTheme ? "text-[#111b21] placeholder-[#54656f]" : "text-[#e9edef] placeholder-[#8696a0]"}`}
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className={`flex-1 overflow-y-auto ${lightTheme ? "bg-white" : "bg-[#111b21]"}`}>
        {conversations.map((conversation, index) => {
          const users = Array.isArray(conversation.users) ? conversation.users : [];
          if (!conversation.isGroupchat && users.length === 1) {
            return <div key={index}></div>;
          }

          const otherUser = users.find(user => user._id !== currentUserId);
          const isGroup = conversation.isGroupchat;

          if (!otherUser && !isGroup) {
            return <div key={index}></div>;
          }

          const title = isGroup ? conversation.chatName : (otherUser ? otherUser.name : "Unknown");
          const iconLetter = title && title.length > 0 ? title[0].toUpperCase() : "U";
          const latestMessage = conversation.latestMessage?.content || "No previous Messages, click here to start a new chat";

          // Apply search filter
          if (searchQuery && !title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return <div key={index}></div>;
          }

          const avatarPic = isGroup ? (conversation.groupPic || null) : (otherUser?.profilePic || null);

          return (
            <div
              key={index}
              className={`flex items-center px-3 cursor-pointer
                ${lightTheme ? "hover:bg-[#f5f6f6]" : "hover:bg-[#202c33]"}`}
              onClick={() => {
                setRefresh((prev) => !prev);
                if (conversation._id) {
                  navigate(`/app/chat/${conversation._id}`);
                }
              }}
            >
              {/* Avatar */}
              <div className={`rounded-full h-[49px] w-[49px] flex items-center justify-center text-xl text-white mr-3 shrink-0 overflow-hidden
                 ${avatarPic ? "bg-transparent" : isGroup ? "bg-[#00a884]" : "bg-[#6b7c85]"}`}>
                {avatarPic ? (
                  <img src={avatarPic} alt={title} className="w-full h-full object-cover" />
                ) : isGroup ? (
                  "👥"
                ) : (
                  iconLetter
                )}
              </div>
              <div className={`flex-1 flex flex-col justify-center border-b min-h-[72px] pr-2 
                ${lightTheme ? "border-[#f2f2f2]" : "border-[#222d34]"}`}>
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-[17px] font-normal truncate ${lightTheme ? "text-[#111b21]" : "text-[#e9edef]"}`}>
                    {title}
                  </span>
                  {/* Optional: Add timestamp here if available from latestMessage.createdAt */}
                </div>
                <div className="flex items-center">
                  <span className={`text-[14px] truncate w-full ${lightTheme ? "text-[#667781]" : "text-[#8696a0]"}`}>
                    {latestMessage}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
