import React from "react";

function MessageOthers({ props, isDark, isGroup }) {
  // Generate consistent color per sender for group name labels
  const colors = ["text-[#35cd96]", "text-[#6bcaff]", "text-[#ff7a7a]", "text-[#f1b000]", "text-[#ffa6c9]", "text-[#cb87f5]"];
  const colorIndex = props.sender?.name ? props.sender.name.length % colors.length : 0;
  const nameColor = colors[colorIndex];

  const senderPic = props.sender?.profilePic || null;
  const senderInitial = props.sender?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex mb-[2px] w-full items-end gap-1">
      {/* Sender avatar — shown in group chats */}
      {isGroup && (
        <div className={`rounded-full h-[28px] w-[28px] shrink-0 flex items-center justify-center text-white text-xs font-semibold overflow-hidden mb-[2px]
          ${senderPic ? "bg-transparent" : "bg-[#6b7c85]"}`}>
          {senderPic ? (
            <img src={senderPic} alt={senderInitial} className="w-full h-full object-cover" />
          ) : (
            senderInitial
          )}
        </div>
      )}

      <div className="flex items-start max-w-[65%] sm:max-w-[75%] lg:max-w-[65%]">
        <div
          className={`flex flex-col relative px-[9px] py-[6px] shadow-sm
          ${isDark ? "bg-[#202c33]" : "bg-white"}
          rounded-md rounded-tl-sm`}
        >
          {isGroup && (
            <p className={`font-semibold text-[13px] leading-tight mb-0.5 ${nameColor} cursor-pointer`}>
              {props.sender?.name || "Unknown User"}
            </p>
          )}

          <div className="flex items-end">
            <span className={`text-[14.5px] leading-5 whitespace-pre-wrap break-words
               ${isDark ? "text-[#e9edef]" : "text-[#111b21]"}`}>
              {props.content}
            </span>
            <span
              className={`text-[11px] leading-[15px] ml-3 mt-1 shrink-0
              ${isDark ? "text-[#8696a0]" : "text-[#667781]"}`}
            >
              {new Date(props.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageOthers;