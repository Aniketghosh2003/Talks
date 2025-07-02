import React, { useState } from "react";
import { Button, TextField, Tabs, Tab } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AuthComponents() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState("");
  const [signInStatus, setSignInStatus] = useState("");
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    // console.log(data);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
        // Add withCredentials for CORS requests
        withCredentials: true,
      };

      const response = await axios.post(
        "http://localhost:3000/user/login/",
        data,
        config
      );

      // console.log("Login : ", response);
      setLoginStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("userData", JSON.stringify(response));
      setLoading(false);
      navigate("/app/welcome");
    } catch (error) {
      console.log("Login error:", error);
      setLoginStatus({
        msg: "Invalid User name or Password",
        key: Math.random(),
      });
      setLoading(false);
    }
  };

  const signUpHandler = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
        // Add withCredentials for CORS requests
        withCredentials: true,
      };

      const response = await axios.post(
        "http://localhost:3000/user/register/",
        data,
        config
      );

      // console.log(response);
      setSignInStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("userData", JSON.stringify(response));
      setLoading(false);
      navigate("/app/welcome");
    } catch (error) {
      console.log("Registration error:", error);
      // Safely check for error response status
      if (error.response && error.response.status === 405) {
        setSignInStatus({
          msg: "User with this email ID already Exists",
          key: Math.random(),
        });
      } else if (error.response && error.response.status === 406) {
        setSignInStatus({
          msg: "User Name already Taken, Please take another one",
          key: Math.random(),
        });
      } else {
        // Generic error message if status codes don't match
        setSignInStatus({
          msg: "Registration failed. Please try again.",
          key: Math.random(),
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#d0d1d4] h-screen sm:h-[90vh] w-full sm:w-[90vw] flex flex-col sm:flex-row rounded-lg shadow-xl">
      <div className="flex-[0.3] flex justify-center items-center px-5 py-4 sm:py-2.5 m-2.5 rounded-xl">
        <img
          src="/Talks-official-icon.png"
          alt="Talks Logo"
          className="h-[30vh] sm:h-[15vw] w-auto object-contain rounded-2xl"
        />
      </div>
      <div className="flex-[0.7] mx-4 sm:m-2.5 bg-white rounded-xl flex justify-center items-center color-[#63d7b0]">
        <div className="flex flex-col items-center self-center gap-4 sm:gap-3 w-full max-w-sm px-4 sm:px-0">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "#63d7b0" },
              "& .Mui-selected": { color: "#63d7b0" },
            }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {activeTab === 0 ? (
            // Login Form
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-500">
                Login
              </h1>
              <TextField
                id="standard-basic"
                label="Username"
                name="name"
                variant="outlined"
                value={data.name}
                onChange={changeHandler}
                className="w-full"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#63d7b0" },
                    "&:hover fieldset": { borderColor: "#63d7b0" },
                    "&.Mui-focused fieldset": { borderColor: "#63d7b0" },
                  },
                }}
              />
              <TextField
                id="outlined-basic"
                label="Password"
                name="password"
                variant="outlined"
                type="password"
                value={data.password}
                onChange={changeHandler}
                className="w-full"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#63d7b0" },
                    "&:hover fieldset": { borderColor: "#63d7b0" },
                    "&.Mui-focused fieldset": { borderColor: "#63d7b0" },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={loginHandler}
                disabled={loading}
                className="w-full"
                sx={{
                  backgroundColor: "#63d7b0",
                  "&:hover": { backgroundColor: "#4fa88c" },
                  padding: "0.75rem",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              {loginStatus && (
                <div
                  className={
                    loginStatus.msg === "Success"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {loginStatus.msg}
                </div>
              )}
            </>
          ) : (
            // Register Form
            <>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-500">
                Register
              </h1>
              <TextField
                label="Username"
                name="name"
                variant="outlined"
                value={data.name}
                onChange={changeHandler}
                className="w-full"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#63d7b0" },
                    "&:hover fieldset": { borderColor: "#63d7b0" },
                    "&.Mui-focused fieldset": { borderColor: "#63d7b0" },
                  },
                }}
              />
              <TextField
                label="Email"
                name="email"
                variant="outlined"
                type="email"
                value={data.email}
                onChange={changeHandler}
                className="w-full"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#63d7b0" },
                    "&:hover fieldset": { borderColor: "#63d7b0" },
                    "&.Mui-focused fieldset": { borderColor: "#63d7b0" },
                  },
                }}
              />
              <TextField
                label="Password"
                name="password"
                variant="outlined"
                type="password"
                value={data.password}
                onChange={changeHandler}
                className="w-full"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#63d7b0" },
                    "&:hover fieldset": { borderColor: "#63d7b0" },
                    "&.Mui-focused fieldset": { borderColor: "#63d7b0" },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={signUpHandler}
                disabled={loading}
                className="w-full"
                sx={{
                  backgroundColor: "#63d7b0",
                  "&:hover": { backgroundColor: "#4fa88c" },
                  padding: "0.75rem",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
              {signInStatus && (
                <div
                  className={
                    signInStatus.msg === "Success"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {signInStatus.msg}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthComponents;
