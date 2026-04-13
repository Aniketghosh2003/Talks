import React, { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";

function ContactInfoPanel({
  user,
  isGroup,
  groupUsers,
  chatId,
  groupAdmin,
  groupPic: initialGroupPic,
  currentUserId,
  onGroupPicUpdate,
  onClose,
}) {
  const lightTheme = useSelector((state) => state.themeKey);
  const fileInputRef = useRef(null);
  const [groupPic, setGroupPic] = useState(initialGroupPic || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const bg = lightTheme ? "#f0f2f5" : "#111b21";
  const cardBg = lightTheme ? "#fff" : "#202c33";
  const headerBg = lightTheme ? "#00a884" : "#005c4b";
  const textPrimary = lightTheme ? "#111b21" : "#e9edef";
  const textSecondary = lightTheme ? "#667781" : "#8696a0";
  const borderColor = lightTheme ? "#f0f2f5" : "#2a3942";

  // Resolve groupAdmin ID whether it's a string or populated object
  const adminId = groupAdmin?._id || groupAdmin;
  const isAdmin = isGroup && currentUserId && adminId && currentUserId.toString() === adminId.toString();

  const getUserData = () => {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.data?.token ? parsed : (parsed.token ? { data: parsed } : parsed);
    } catch { return null; }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => uploadGroupPic(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadGroupPic = async (base64) => {
    setUploading(true);
    setError(null);
    const ud = getUserData();
    const token = ud?.data?.token;
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/groupPic`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({ chatId, groupPic: base64 }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        const error = new Error("Failed to update group icon");
        error.data = responseData;
        throw error;
      }
      setGroupPic(base64);
      if (onGroupPicUpdate) onGroupPicUpdate(base64);
    } catch (err) {
      setError(err.data?.message || "Failed to update group icon");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 40,
        }}
      />

      {/* Sliding panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(340px, 100vw)",
          background: bg,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.2)",
          animation: "slideIn 0.2s ease-out",
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Green header */}
        <div style={{ background: headerBg, height: "220px", position: "relative", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 16px 0" }}>
            <IconButton onClick={onClose} size="small" style={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
            <span style={{ color: "#fff", fontSize: "17px", fontWeight: "500" }}>
              {isGroup ? "Group Info" : "Contact Info"}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "-64px",
          marginBottom: "12px",
          position: "relative",
          zIndex: 2,
        }}>
          <div
            onClick={() => isAdmin && fileInputRef.current?.click()}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              border: `4px solid ${bg}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              background: isGroup
                ? (groupPic ? "transparent" : "#00a884")
                : (user?.profilePic ? "transparent" : "#6b7c85"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: isAdmin ? "pointer" : "default",
            }}
          >
            {/* Image or fallback */}
            {isGroup ? (
              groupPic ? (
                <img src={groupPic} alt="group" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "48px", userSelect: "none" }}>👥</span>
              )
            ) : (
              user?.profilePic ? (
                <img src={user.profilePic} alt={user?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#fff", fontSize: "48px", fontWeight: "600", userSelect: "none" }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )
            )}

            {/* Camera overlay — only for group admin */}
            {isAdmin && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: uploading ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => !uploading && (e.currentTarget.style.opacity = 0)}
              >
                {uploading ? (
                  <span style={{ color: "#fff", fontSize: "12px" }}>Saving…</span>
                ) : (
                  <>
                    <CameraAltIcon style={{ color: "#fff", fontSize: "26px" }} />
                    <span style={{ color: "#fff", fontSize: "10px", marginTop: "4px", textAlign: "center", lineHeight: 1.3 }}>
                      CHANGE<br />ICON
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        {/* Admin badge */}
        {isAdmin && (
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <span style={{
              background: "#00a884",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "600",
              padding: "2px 10px",
              borderRadius: "40px",
              letterSpacing: "0.5px",
            }}>
              You are the admin
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ margin: "0 16px 10px", padding: "8px 14px", borderRadius: "8px", background: "#fee2e2", color: "#dc2626", fontSize: "13px", textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* Scrollable info */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* Name / title */}
          <div style={{ textAlign: "center", padding: "0 20px 16px" }}>
            <p style={{ fontSize: "22px", fontWeight: "600", color: textPrimary, marginBottom: "4px" }}>
              {isGroup ? (groupUsers?.length ? `${groupUsers.length} members` : "Group") : user?.name}
            </p>
            {!isGroup && (
              <p style={{ fontSize: "14px", color: "#00a884" }}>{user?.email}</p>
            )}
          </div>

          {/* About — 1-on-1 only */}
          {!isGroup && (
            <div style={{ margin: "0 16px 12px", background: cardBg, borderRadius: "12px", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#00a884", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                About
              </p>
              <p style={{ fontSize: "15px", color: textPrimary, lineHeight: "1.5" }}>
                {user?.about || "I am using Talks"}
              </p>
            </div>
          )}

          {/* Members list — groups only */}
          {isGroup && groupUsers && groupUsers.length > 0 && (
            <div style={{ margin: "0 16px 12px", background: cardBg, borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#00a884", padding: "16px 20px 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {groupUsers.length} Members
              </p>
              {groupUsers.map((member, i) => {
                const isThisAdmin = adminId && member._id?.toString() === adminId.toString();
                return (
                  <div key={member._id || i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 20px",
                    borderTop: i > 0 ? `1px solid ${borderColor}` : "none",
                  }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: member.profilePic ? "transparent" : "#6b7c85",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {member.profilePic ? (
                        <img src={member.profilePic} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>
                          {member.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "15px", color: textPrimary, fontWeight: "500" }}>
                        {member.name}
                        {isThisAdmin && (
                          <span style={{ fontSize: "11px", color: "#00a884", fontWeight: "600", marginLeft: "6px" }}>admin</span>
                        )}
                      </p>
                      <p style={{ fontSize: "13px", color: textSecondary }}>{member.about || "I am using Talks"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default ContactInfoPanel;
