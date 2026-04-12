import React, { useState, useEffect } from "react";
import DoneIcon from "@mui/icons-material/Done";
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateGroups() {
  const lightTheme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    if (!userData) {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const token = userData?.data?.token || userData?.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/fetchUsers`, config);
        const currentUserId = userData?.data?._id || userData?._id;
        setUsers(response.data.filter(user => user._id !== currentUserId));
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users");
      }
    };

    fetchUsers();
  }, [userData?.data._id, userData?.data.token, navigate]);

  const handleClickOpen = () => {
    if (groupName.trim()) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      setError("Please enter group name and select users");
      return;
    }

    setLoading(true);
    try {
      const token = userData?.data?.token || userData?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/chat/createGroup`,
        {
          name: groupName,
          users: JSON.stringify(selectedUsers),
        },
        config
      );

      if (response.data) {
        setLoading(false);
        handleClose();
        navigate("/app/groups");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      setError(error.response?.data?.message || "Failed to create group");
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`flex-[0.7] self-center px-5 py-2.5 m-2.5 rounded-xl flex justify-between shadow-md
        ${lightTheme ? "bg-white" : "bg-gray-700"}`}
      >
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter Group Name"
          className={`outline-none w-full ${
            lightTheme
              ? "bg-white"
              : "bg-gray-700 text-white placeholder-gray-400"
          }`}
        />
        <IconButton 
          onClick={handleClickOpen} 
          disabled={!groupName.trim() || loading}
        >
          <DoneIcon className={!lightTheme ? "text-white" : ""} />
        </IconButton>
      </motion.div>

      <Dialog 
        open={open} 
        onClose={handleClose}
        PaperProps={{
          className: lightTheme ? "" : "bg-gray-800 text-white"
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create Group: {groupName}
          {error && (
            <Alert severity="error" className="mt-2">
              {error}
            </Alert>
          )}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-2 mt-2">
            {users.length === 0 ? (
              <p className="text-gray-500 italic">No users available</p>
            ) : (
              users.map((user) => (
                <FormControlLabel
                  key={user._id}
                  control={
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserSelect(user._id)}
                      className={!lightTheme ? "text-white" : ""}
                    />
                  }
                  label={
                    <div className="flex flex-col">
                      <span className={!lightTheme ? "text-white" : ""}>
                        {user.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  }
                  className={!lightTheme ? "text-white" : ""}
                />
              ))
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose}
            color="inherit"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={selectedUsers.length === 0 || loading}
            variant="contained"
            color="primary"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Create Group'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Do you want to create a Group Named " + groupName}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will create a create group in which you will be the admin and
            other will be able to join this group.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Disagree</Button>
          <Button
            onClick={() => {
              createGroup();
              handleConfirmClose();
            }}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CreateGroups;