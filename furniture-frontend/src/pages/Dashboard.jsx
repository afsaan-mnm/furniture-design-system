import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/fu-bg.svg";
import "../styles/Explore.css"; 

const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPrivateDesigns = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/designs/explore/private");
      setDesigns(res.data.designs || []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error fetching designs",
        text: err.response?.data?.msg || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivateDesigns();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft: "220px",
          backgroundColor: "white",
          minHeight: "100vh",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-4 fw-bold text-dark text-shadow">All Private Designs</h2>
        </div>

        {loading ? (
          <div className="text-center mt-5 text-dark">
            <div className="spinner-border text-dark" role="status" />
            <p className="mt-2">Loading...</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center mt-5 text-dark">
            <p>No private designs found.</p>
          </div>
        ) : (
          <div className="row">
            {designs.map((design) => (
              <div key={design.id} className="col-md-4 mb-4">
                <div className="glass-card p-3 rounded shadow">
                  <h5 className="fw-bold text-black">{design.name}</h5>
                  <p className="text-black mb-1"><strong>Type:</strong> {design.type}</p>
                  <p className="text-black mb-1"><strong>Objects:</strong>{" "}
                    {design.designData?.objects?.map((obj, index) => (
                      <span key={index} className="badge bg-light text-dark me-1">
                        {obj.type || obj.name}
                      </span>
                    ))}
                  </p>
                  <p className="text-muted">
                    <small>
                      Created:{" "}
                      {design.createdAt?.seconds
                        ? new Date(design.createdAt.seconds * 1000).toLocaleString()
                        : "N/A"}
                    </small>
                  </p>
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => navigate(`/design/${design.id}`)}
                  >
                    View Design
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;