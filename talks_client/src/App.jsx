import { useState } from "react";
import "./App.css";
import MainComponent from "./Components/MainComponent";
import Login from "./Components/Login";
import Welcome from "./Components/Welcome";
import ChatArea from "./Components/ChatArea";
import Users from "./Components/Users";
import CreateGroups from "./Components/CreateGroups";
import Profile from "./Components/Profile";
import { Routes, Route } from "react-router-dom";
import Groups from "./Components/Groups";
import { useSelector } from "react-redux";

function App() {
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <>
      <div
        className={`h-screen w-screen overflow-hidden
        ${lightTheme ? "bg-[#dddedd]" : "bg-gray-900"}`}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="app" element={<MainComponent />}>
            <Route path="welcome" element={<Welcome />} />
            <Route path="chat/:_id" element={<ChatArea />} />
            <Route path="chat" element={<Welcome />} />
            <Route path="users" element={<Users />} />
            <Route path="groups" element={<Groups />} />
            <Route path="create-groups" element={<CreateGroups />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
