import React, { createContext, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";

export const myContext = createContext();

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:3000";
let socket;

function MainComponent() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [refresh, setRefresh] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

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
        <Sidebar />
        <Outlet />
      </myContext.Provider>
    </div>
  );
}

export default MainComponent;
