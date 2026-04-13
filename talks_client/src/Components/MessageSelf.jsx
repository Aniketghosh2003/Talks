import React from "react";

// ─── Tick Icons ────────────────────────────────────────────────────────────

// Single grey tick — sent to server
const SingleTick = ({ color = "#8696a0" }) => (
  <svg viewBox="0 0 12 11" height="11" width="12" fill={color}>
    <path d="M11.071.653a.458.458 0 0 0-.304-.163.443.443 0 0 0-.363.13L4.917 6.8 2.197 4.084a.444.444 0 0 0-.363-.13.458.458 0 0 0-.304.163.453.453 0 0 0 0 .604l3.012 3.009a.45.45 0 0 0 .375.138.45.45 0 0 0 .37-.14l6.784-6.46a.453.453 0 0 0 0-.615z" />
  </svg>
);

// Double tick — delivered (grey) or read (blue)
const DoubleTick = ({ color = "#8696a0" }) => (
  <svg viewBox="0 0 16 11" height="11" width="16" fill={color}>
    <path d="M15.01.653a.457.457 0 0 0-.304-.163.443.443 0 0 0-.363.13L8.29 7.426l-.607-.607 5.695-5.422a.453.453 0 0 0 0-.615.457.457 0 0 0-.304-.163.443.443 0 0 0-.363.13L6.925 7.097 4.197 4.37a.443.443 0 0 0-.363-.13.457.457 0 0 0-.304.163.453.453 0 0 0 0 .604l3.012 3.009a.45.45 0 0 0 .375.138.45.45 0 0 0 .37-.14l.921-.877.92.921a.45.45 0 0 0 .375.138.45.45 0 0 0 .37-.14l6.527-6.208a.453.453 0 0 0 0-.614z" />
    <path d="M6.925 7.097l-.607-.607.607.607z" />
  </svg>
);

/**
 * Renders the correct WhatsApp-style tick for a sent message:
 *  - 'sent'      → single grey tick
 *  - 'delivered' → double grey tick
 *  - 'read'      → double blue tick
 */
function MessageTick({ status }) {
  if (status === "read") return <DoubleTick color="#53bdeb" />;
  if (status === "delivered") return <DoubleTick color="#8696a0" />;
  return <SingleTick color="#8696a0" />;
}

// ─── Component ─────────────────────────────────────────────────────────────

function MessageSelf({ props, isDark }) {
  const status = props.status || "sent";
  const attachment = props.attachment;
  const isImageAttachment = attachment?.mimeType?.startsWith("image/");

  return (
    <div className="flex mb-[2px] w-full justify-end">
      <div className="flex items-end max-w-[65%] sm:max-w-[75%] lg:max-w-[65%] justify-end">
        <div
          className={`flex flex-col relative px-[9px] py-[6px] shadow-sm
          ${isDark ? "bg-[#005c4b]" : "bg-[#d9fdd3]"}
          rounded-md rounded-tr-sm`}
        >
          <div className="flex flex-col gap-1">
            {attachment && (
              isImageAttachment ? (
                <img
                  src={attachment.data}
                  alt={attachment.name || "attachment"}
                  className="rounded-md max-w-[240px] max-h-[280px] object-cover"
                />
              ) : (
                <a
                  href={attachment.data}
                  download={attachment.name || "file"}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-[13px] underline break-all ${isDark ? "text-[#cfe9ff]" : "text-[#034f84]"}`}
                >
                  {attachment.name || "Download file"}
                </a>
              )
            )}
            {props.content ? (
              <span
                className={`text-[14.5px] leading-5 whitespace-pre-wrap break-words
                 ${isDark ? "text-[#e9edef]" : "text-[#111b21]"}`}
              >
                {props.content}
              </span>
            ) : null}
            <div className="flex justify-end">
            <span
              className={`text-[11px] leading-[15px] ml-2 shrink-0 flex items-center gap-[3px]
              ${isDark ? "text-[#8696a0]" : "text-[#667781]"}`}
              style={{ marginBottom: "1px" }}
            >
              {new Date(props.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              <MessageTick status={status} />
            </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageSelf;