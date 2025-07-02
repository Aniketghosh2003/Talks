import React, { createContext, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const myContext = createContext();

function MainComponent() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [refresh, setRefresh] = useState(false); // Add this line

  return (
    <div
      className={`h-[90vh] w-[90vw] flex rounded-lg
      ${lightTheme ? "bg-[#f0f3f8]" : "bg-gray-800"}`}
    >
      <myContext.Provider value={{ refresh, setRefresh }}>
        <Sidebar />
        <Outlet />
      </myContext.Provider>
    </div>
  );
}

export default MainComponent;
