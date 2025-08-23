import React from "react";

function MessageSelf({ props, isDark }) {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <div className="flex items-start justify-end">
        <div
          className={`flex flex-col rounded-2xl rounded-tr-none px-4 py-2 
          shadow-sm max-w-[80%]
          ${isDark ? "bg-teal-800" : "bg-[#dcf8c6]"}`}
        >
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

export default MessageSelf;