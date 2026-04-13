import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const lightTheme = useSelector((state) => state.themeKey);
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

  const nav = useNavigate();

  useEffect(() => {
    if (!userData) {
      nav("/");
    }
  }, [userData, nav]);

  return (
    <div
      className={`w-full md:flex-[0.7] flex flex-col items-center justify-center gap-5 
      border-b-2 border-[#63d7b0] rounded-2xl
      ${!lightTheme ? "bg-gray-800" : ""}`}
    >
      <img
        src="/Talks-official-icon.png"
        alt="Talks Logo"
        className="h-[20vw] w-auto object-contain"
      />
      <p className={`${!lightTheme ? "text-white" : "text-gray-800"}`}>
        View and text directly to people present in the chat rooms
      </p>
    </div>
  );
}
export default Welcome;