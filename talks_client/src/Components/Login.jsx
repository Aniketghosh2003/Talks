import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AuthComponents() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  const [signInStatus, setSignInStatus] = useState("");
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const navigate = useNavigate();

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginStatus("");
    try {
      const config = {
        headers: { "Content-type": "application/json" },
        withCredentials: true,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login/`,
        data,
        config
      );
      setLoginStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("userData", JSON.stringify(response));
      setLoading(false);
      navigate("/app/welcome");
    } catch (error) {
      setLoginStatus({ msg: "Invalid username or password", key: Math.random() });
      setLoading(false);
    }
  };

  const signUpHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSignInStatus("");
    try {
      const config = {
        headers: { "Content-type": "application/json" },
        withCredentials: true,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register/`,
        data,
        config
      );
      setSignInStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("userData", JSON.stringify(response));
      setLoading(false);
      navigate("/app/welcome");
    } catch (error) {
      if (error.response?.status === 405) {
        setSignInStatus({ msg: "Email already in use", key: Math.random() });
      } else if (error.response?.status === 406) {
        setSignInStatus({ msg: "Username already taken", key: Math.random() });
      } else {
        setSignInStatus({ msg: "Registration failed. Please try again.", key: Math.random() });
      }
      setLoading(false);
    }
  };

  const inputClass = `
    w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50
    text-gray-800 text-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent
    transition-all duration-200
  `;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          maxWidth: "900px",
          minHeight: "560px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          margin: "20px",
        }}
      >
        {/* ─── Left Panel: Brand ─────────────────────────────────────── */}
        <div
          style={{
            flex: "0 0 42%",
            background: "linear-gradient(160deg, #00a884 0%, #075e54 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative circles */}
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "200px", height: "200px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "-40px",
            width: "150px", height: "150px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }} />

          {/* Logo */}
          <div style={{
            width: "130px", height: "130px",
            borderRadius: "28px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <img
              src="/Talks-official-icon.png"
              alt="Talks Logo"
              style={{ width: "100px", height: "100px", objectFit: "contain", borderRadius: "16px" }}
            />
          </div>

          <h1 style={{
            color: "#fff",
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "10px",
            letterSpacing: "-0.5px",
          }}>
            Talks
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "14px",
            textAlign: "center",
            lineHeight: "1.6",
            maxWidth: "220px",
          }}>
            Connect, chat, and collaborate in real time.
          </p>

          {/* Feature pills */}
          <div style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            {["⚡ Real-time messaging", "👥 Group conversations", "🔒 Secure & private"].map((f) => (
              <div key={f} style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: "40px",
                padding: "8px 16px",
                color: "#fff",
                fontSize: "13px",
                backdropFilter: "blur(8px)",
              }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Panel: Form ─────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "52px 48px",
          }}
        >
          {/* Tab switcher */}
          <div style={{
            display: "flex",
            background: "#f0f2f5",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "36px",
          }}>
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setLoginStatus(""); setSignInStatus(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  background: activeTab === tab ? "#fff" : "transparent",
                  color: activeTab === tab ? "#00a884" : "#667781",
                  boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {activeTab === "login" ? (
            <form onSubmit={loginHandler} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#111b21", marginBottom: "6px" }}>
                  Welcome back
                </h2>
                <p style={{ color: "#667781", fontSize: "14px" }}>Sign in to continue to Talks</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your username"
                    value={data.name}
                    onChange={changeHandler}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #e5e7eb",
                      background: "#f9fafb",
                      fontSize: "14px",
                      color: "#111b21",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#00a884"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={changeHandler}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #e5e7eb",
                      background: "#f9fafb",
                      fontSize: "14px",
                      color: "#111b21",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#00a884"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>

              {loginStatus && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  background: loginStatus.msg === "Success" ? "#dcfce7" : "#fee2e2",
                  color: loginStatus.msg === "Success" ? "#16a34a" : "#dc2626",
                }}>
                  {loginStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  background: loading ? "#a8d5c9" : "linear-gradient(135deg, #00a884, #075e54)",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "4px",
                  transition: "opacity 0.2s",
                  letterSpacing: "0.3px",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <p style={{ textAlign: "center", fontSize: "13px", color: "#667781", marginTop: "4px" }}>
                Don't have an account?{" "}
                <span
                  onClick={() => setActiveTab("register")}
                  style={{ color: "#00a884", fontWeight: "600", cursor: "pointer" }}
                >
                  Create one
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={signUpHandler} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#111b21", marginBottom: "6px" }}>
                  Create account
                </h2>
                <p style={{ color: "#667781", fontSize: "14px" }}>Join Talks and start chatting</p>
              </div>

              {[
                { label: "Username", name: "name", type: "text", placeholder: "Choose a username" },
                { label: "Email", name: "email", type: "email", placeholder: "Enter your email" },
                { label: "Password", name: "password", type: "password", placeholder: "Create a password" },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", display: "block" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={data[name]}
                    onChange={changeHandler}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1.5px solid #e5e7eb",
                      background: "#f9fafb",
                      fontSize: "14px",
                      color: "#111b21",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#00a884"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              ))}

              {signInStatus && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  background: signInStatus.msg === "Success" ? "#dcfce7" : "#fee2e2",
                  color: signInStatus.msg === "Success" ? "#16a34a" : "#dc2626",
                }}>
                  {signInStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  background: loading ? "#a8d5c9" : "linear-gradient(135deg, #00a884, #075e54)",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "opacity 0.2s",
                  letterSpacing: "0.3px",
                }}
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>

              <p style={{ textAlign: "center", fontSize: "13px", color: "#667781" }}>
                Already have an account?{" "}
                <span
                  onClick={() => setActiveTab("login")}
                  style={{ color: "#00a884", fontWeight: "600", cursor: "pointer" }}
                >
                  Sign in
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthComponents;
