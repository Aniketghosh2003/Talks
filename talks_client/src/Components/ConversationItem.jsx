import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function ConversationItem({ props, isDark }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/app/chat/${props._id}`)}
      className={`flex items-center cursor-pointer p-3 mb-2 rounded-lg
        ${isDark ? "hover:bg-gray-600" : "hover:bg-gray-100"}`}
    >
      {/* Avatar */}
      <div className={`flex items-center justify-center h-12 w-12 rounded-full
        ${isDark ? "bg-gray-600" : "bg-[#d9d9d9]"}`}>
        <span className="text-white text-xl font-semibold">
          {props.name[0]}
        </span>
      </div>

      {/* Content */}
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center">
          <h2 className={`text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            {props.name}
            {props.isGroup && 
              <span className="ml-2 text-sm text-gray-500">(Group)</span>
            }
          </h2>
          <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}>
            {props.timeStamp}
          </span>
        </div>
        <p className={`text-sm truncate
          ${isDark ? "text-gray-300" : "text-gray-500"}
          ${props.lastMessage === "No previous messages" ? "italic" : ""}`}
        >
          {props.lastMessage}
        </p>
      </div>
    </motion.div>
  );
}

export default ConversationItem;
