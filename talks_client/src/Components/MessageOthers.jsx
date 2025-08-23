import React from "react";

function MessageOthers({ props, isDark }) {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <div className="flex items-start space-x-2 max-w-[80%]">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <p
            className={`flex items-center justify-center text-white text-xl 
            font-bold h-8 w-8 rounded-full
            ${isDark ? "bg-gray-600" : "bg-[#d9d9d9]"}`}
          >
            {props.sender?.name?.[0] || 'U'}
          </p>
        </div>

        {/* Message bubble */}
        <div
          className={`flex flex-col rounded-2xl rounded-tl-none px-4 py-2 shadow-sm
          ${isDark ? "bg-gray-700" : "bg-white"}`}
        >
          <p
            className={`font-medium text-sm ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {props.sender?.name || 'Unknown User'}
          </p>
          <p className={isDark ? "text-white" : "text-gray-800"}>
            {props.content}
          </p>
          <p
            className={`text-xs self-end mt-1 
            ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {new Date(props.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MessageOthers;