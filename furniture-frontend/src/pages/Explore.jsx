import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Explore = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicDesigns = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/designs/explore/all");
      setDesigns(res.data.designs || []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Failed to load public designs",
        text: err.response?.data?.msg || "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicDesigns();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", background: "#f8f9fa", padding: "20px" }}>
        <h5>FurnitureApp</h5>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <button className="btn btn-link nav-link" onClick={() => navigate("/dashboard")}>
              My Designs
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-link nav-link active" onClick={() => navigate("/explore")}>
              Explore
            </button>
          </li>
          <li className="nav-item">
            <button className="btn btn-link nav-link" onClick={() => navigate("/settings")}>
              Settings
            </button>
          </li>
        </ul>
        <button className="btn btn-danger w-100 mt-4" onClick={logout}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="container mt-4">
        <h3>Explore Public Designs</h3>
        {loading ? (
          <p>Loading...</p>
        ) : designs.length === 0 ? (
          <p>No public designs available.</p>
        ) : (
          <div className="row">
            {designs.map((design) => (
              <div key={design.id} className="col-md-4 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{design.name}</h5>
                    <p className="card-text">Type: {design.type}</p>
                    <p className="card-text"><strong>Objects:</strong>{" "}
                      {design.designData?.objects?.map((obj, index) => (
                        <span key={index} className="badge bg-secondary me-1">
                          {obj.type}
                        </span>
                      ))}
                    </p>
                    <p className="card-text">
                      <small className="text-muted">
                        Created:{" "}
                        {design.createdAt?.seconds
                          ? new Date(design.createdAt.seconds * 1000).toLocaleString()
                          : "N/A"}
                      </small>
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/design/${design.id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;