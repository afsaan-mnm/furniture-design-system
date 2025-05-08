import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/UserProfile.css";
import "../styles/Explore.css";
import defaultAvatar from "../assets/user-avatar.png";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5050/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error("User fetch error:", err.message);
      Swal.fire("Error", "Failed to load user data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="d-flex user-profile-page">
      <Sidebar />
      <div className="container py-5" style={{ marginLeft: "220px" }}>
        {/* User Info */}
        <div className="profile-section d-flex align-items-center justify-content-between flex-wrap mb-5">
          <div className="text-section">
            <h2 className="fw-bold mb-4">User Profile</h2>
            {user ? (
              <>
                <p className="mb-2">
                  <strong>Email:</strong> <span className="text-dark">{user.email}</span>
                </p>
                <p>
                  <strong>User ID:</strong> <span className="text-dark">{user.id}</span>
                </p>
              </>
            ) : (
              <p>Loading user data...</p>
            )}
          </div>
          <div className="avatar-section text-center">
            <img
              src={defaultAvatar}
              alt="Profile"
              className="rounded-circle shadow"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;