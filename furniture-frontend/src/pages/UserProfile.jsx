import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import "../styles/UserProfile.css"; // 👈 Add styling file
import defaultAvatar from "../assets/user-avatar.png"; // 👈 Default profile image

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

  const fetchDesigns = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5050/api/designs/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    fetchDesigns();
  }, []);

  return (
    <div className="d-flex user-profile-page">
      <Sidebar />
      <div className="container py-5" style={{ marginLeft: "220px" }}>
        <div className="profile-section d-flex align-items-center justify-content-between flex-wrap mb-5">
          <div className="text-section">
            <h2 className="fw-bold mb-4">User Profile</h2>
            {user ? (
              <>
                <p className="mb-2">
                  <strong>Email:</strong>{" "}
                  <span className="text-dark">{user.email}</span>
                </p>
                <p>
                  <strong>User ID:</strong>{" "}
                  <span className="text-dark">{user.id}</span>
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

        <div className="design-history-section">
          <h4 className="fw-bold mb-3">Your Design History</h4>
          {loading ? (
            <p>Loading designs...</p>
          ) : designs.length === 0 ? (
            <p className="text-danger">No designs found.</p>
          ) : (
            <ul className="list-group">
              {designs.map((design) => (
                <li key={design.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{design.name}</strong> <span className="badge bg-secondary ms-2">{design.type}</span>
                  </div>
                  <small className="text-muted">
                    {new Date(design.createdAt?.seconds * 1000).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;