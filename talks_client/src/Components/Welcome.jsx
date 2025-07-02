import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));
  console.log(userData);

  const nav = useNavigate();

  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }

  return (
    <div
      className={`flex-[0.7] flex flex-col items-center justify-center gap-5 
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