import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();
  const lightTheme = useSelector((state) => state.themeKey);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    about: "I am using Talks",
    profilePic: "",
  });
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempAbout, setTempAbout] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
  const [picPreview, setPicPreview] = useState(null);

  const getUserData = () => {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.data?.token ? parsed : (parsed.token ? { data: parsed } : parsed);
    } catch { return null; }
  };

  const getToken = () => {
    const ud = getUserData();
    return ud?.data?.token;
  };

  // Fetch profile on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { navigate("/"); return; }

    axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          about: data.about || "I am using Talks",
          profilePic: data.profilePic || "",
        });
        setPicPreview(data.profilePic || null);
      })
      .catch(() => setStatus({ type: "error", msg: "Failed to load profile" }));
  }, []);

  // Convert image file to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: "error", msg: "Image must be under 2MB" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPicPreview(reader.result);
      saveField({ profilePic: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const saveField = async (fields) => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setStatus(null);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/profile`,
        fields,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile((prev) => ({ ...prev, ...fields, ...data }));

      // Update localStorage so the app reflects changes immediately
      const ud = getUserData();
      if (ud?.data) {
        ud.data.name = data.name || ud.data.name;
        ud.data.about = data.about;
        ud.data.profilePic = data.profilePic;
        localStorage.setItem("userData", JSON.stringify(ud));
      }
      setStatus({ type: "success", msg: "Saved!" });
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save. Try again.";
      setStatus({ type: "error", msg });
    } finally {
      setSaving(false);
    }
  };

  const saveName = () => {
    if (!tempName.trim()) return;
    saveField({ name: tempName.trim() });
    setProfile((p) => ({ ...p, name: tempName.trim() }));
    setEditingName(false);
  };

  const saveAbout = () => {
    saveField({ about: tempAbout });
    setProfile((p) => ({ ...p, about: tempAbout }));
    setEditingAbout(false);
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const bg = lightTheme ? "#f0f2f5" : "#111b21";
  const cardBg = lightTheme ? "#fff" : "#202c33";
  const headerBg = lightTheme ? "#00a884" : "#005c4b";
  const textPrimary = lightTheme ? "#111b21" : "#e9edef";
  const textSecondary = lightTheme ? "#667781" : "#8696a0";
  const borderColor = lightTheme ? "#e9edef" : "#2a3942";
  const inputBg = lightTheme ? "#f0f2f5" : "#2a3942";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: bg, overflow: "hidden" }}>

      {/* ── Scrollable content wrapper */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Green header — tall enough for avatar to overlap nicely */}
        <div style={{
          background: headerBg,
          height: "200px",
          position: "relative",
          flexShrink: 0,
        }}>
          {/* Back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 24px" }}>
            <IconButton onClick={() => navigate(-1)} size="small" style={{ color: "#fff" }}>
              <ArrowBackIcon />
            </IconButton>
            <span style={{ color: "#fff", fontSize: "19px", fontWeight: "500" }}>Profile</span>
          </div>
        </div>

        {/* ── Avatar — positioned to overlap the header bottom edge */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "-64px",
          marginBottom: "24px",
          position: "relative",
          zIndex: 2,
        }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "128px",
              height: "128px",
              borderRadius: "50%",
              background: picPreview ? "transparent" : "#6b7c85",
              border: `4px solid ${bg}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            {picPreview ? (
              <img src={picPreview} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "52px", color: "#fff", fontWeight: "600", userSelect: "none" }}>
                {profile.name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
            {/* Camera hover overlay */}
            <div
              className="cam-overlay"
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
            >
              <CameraAltIcon style={{ color: "#fff", fontSize: "28px" }} />
              <span style={{ color: "#fff", fontSize: "11px", marginTop: "4px", textAlign: "center", lineHeight: 1.3 }}>
                CHANGE<br />PHOTO
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        {/* Status message */}
        {status && (
          <div style={{
            margin: "0 20px 16px",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            textAlign: "center",
            background: status.type === "success" ? "#dcfce7" : "#fee2e2",
            color: status.type === "success" ? "#16a34a" : "#dc2626",
          }}>
            {status.msg}
          </div>
        )}

        {/* ── Info card */}
        <div style={{ margin: "0 16px", borderRadius: "16px", background: cardBg, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>

          {/* Name field */}
          <div style={{ padding: "20px 20px 8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#00a884" }}>Your name</span>
          </div>
          <div style={{ padding: "4px 20px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: `1px solid ${borderColor}` }}>
            {editingName ? (
              <>
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                  maxLength={25}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid #00a884`,
                    outline: "none",
                    fontSize: "16px",
                    color: textPrimary,
                    padding: "4px 0",
                  }}
                />
                <span style={{ fontSize: "12px", color: textSecondary }}>{tempName.length}/25</span>
                <IconButton onClick={saveName} size="small" disabled={saving}><CheckIcon style={{ color: "#00a884", fontSize: "20px" }} /></IconButton>
                <IconButton onClick={() => setEditingName(false)} size="small"><CloseIcon style={{ color: textSecondary, fontSize: "20px" }} /></IconButton>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: "16px", color: textPrimary }}>{profile.name}</span>
                <IconButton onClick={() => { setTempName(profile.name); setEditingName(true); }} size="small">
                  <EditIcon style={{ color: textSecondary, fontSize: "20px" }} />
                </IconButton>
              </>
            )}
          </div>

          {/* About field */}
          <div style={{ padding: "20px 20px 8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#00a884" }}>About</span>
          </div>
          <div style={{ padding: "4px 20px 20px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
            {editingAbout ? (
              <>
                <textarea
                  autoFocus
                  value={tempAbout}
                  onChange={(e) => setTempAbout(e.target.value)}
                  maxLength={139}
                  rows={3}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid #00a884`,
                    outline: "none",
                    fontSize: "16px",
                    color: textPrimary,
                    resize: "none",
                    fontFamily: "inherit",
                    padding: "4px 0",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: textSecondary, textAlign: "right" }}>{tempAbout.length}/139</span>
                  <IconButton onClick={saveAbout} size="small" disabled={saving}><CheckIcon style={{ color: "#00a884", fontSize: "20px" }} /></IconButton>
                  <IconButton onClick={() => setEditingAbout(false)} size="small"><CloseIcon style={{ color: textSecondary, fontSize: "20px" }} /></IconButton>
                </div>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: "16px", color: textPrimary, lineHeight: "1.5" }}>
                  {profile.about || "I am using Talks"}
                </span>
                <IconButton onClick={() => { setTempAbout(profile.about || "I am using Talks"); setEditingAbout(true); }} size="small">
                  <EditIcon style={{ color: textSecondary, fontSize: "20px" }} />
                </IconButton>
              </>
            )}
          </div>
        </div>

        {/* Email (read-only) */}
        <div style={{ margin: "16px 16px 32px", borderRadius: "16px", background: cardBg, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#00a884", display: "block", marginBottom: "6px" }}>Email</span>
          <span style={{ fontSize: "16px", color: textSecondary }}>{profile.email}</span>
        </div>

      </div>
    </div>
  );
}

export default Profile;
