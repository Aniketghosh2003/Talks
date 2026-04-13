import React, { createContext, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";

export const myContext = createContext();

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:3000";
let socket;

function MainComponent() {
  const lightTheme = useSelector((state) => state.themeKey);
  const location = useLocation();
  const [refresh, setRefresh] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const isListRoute =
    location.pathname === "/app/welcome" || location.pathname === "/app/chat";

  useEffect(() => {
    socket = io(ENDPOINT);
    
    const getUserDataSafely = () => {
      const raw = localStorage.getItem("userData");
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.data && parsed.data.token) return parsed;
        if (parsed.token) return { data: parsed };
        return parsed;
      } catch {
        return null;
      }
    };
    
    const userData = getUserDataSafely();
    if (userData?.data) {
      socket.emit("setup", userData.data);
    }

    socket.on("online users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <div
      className={`h-screen w-screen flex overflow-hidden
      ${lightTheme ? "bg-[#f0f2f5]" : "bg-[#111b21]"}`}
    >
      <myContext.Provider value={{ refresh, setRefresh, socket, onlineUsers }}>
        <div className={`${isListRoute ? "flex" : "hidden md:flex"} h-full w-full md:w-[30%] md:min-w-[320px] md:max-w-[450px] md:flex-none`}>
          <Sidebar />
        </div>
        <div className={`${isListRoute ? "hidden md:flex" : "flex"} h-full flex-1 min-w-0`}>
          <Outlet />
        </div>
      </myContext.Provider>
    </div>
  );
}

export default MainComponent;
