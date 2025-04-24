import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/UserProfile.css";
import "../styles/Explore.css";
import defaultAvatar from "../assets/user-avatar.png";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [designs, setDesigns] = useState([]);
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
    }
  };

  const fetchPrivateDesigns = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/designs/explore/private");
      setDesigns(res.data.designs || []);
    } catch (err) {
      console.error("Failed to fetch designs:", err.message);
      Swal.fire("Error", "Failed to load designs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPrivateDesigns();
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

        <hr className="my-4" />

        {/* Design History */}
        <div className="design-history-section">
          <h4 className="fw-bold mb-4">All Private Design History</h4>
          {loading ? (
            <p>Loading designs...</p>
          ) : designs.length === 0 ? (
            <p className="text-danger">No private designs available.</p>
          ) : (
            <div className="row">
              {designs.map((design) => (
                <div key={design.id} className="col-md-4 mb-4">
                  <div className="glass-card p-3 rounded shadow">
                    <h5 className="fw-bold text-black">{design.name}</h5>
                    <p className="text-black mb-1"><strong>Type:</strong> {design.type}</p>
                    <p className="text-black mb-1">
                      <strong>Objects:</strong>{" "}
                      {design.designData?.objects?.map((obj, index) => (
                        <span key={index} className="badge bg-light text-dark me-1">
                          {obj.type || obj.name}
                        </span>
                      ))}
                    </p>
                    <p className="text-muted small">
                      Created:{" "}
                      {design.createdAt?.seconds
                        ? new Date(design.createdAt.seconds * 1000).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;