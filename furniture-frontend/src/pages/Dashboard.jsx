import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/fu-bg.svg"; 

const Dashboard = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDesigns = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Please login first.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5050/api/designs/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDesigns(res.data.designs || []);
    } catch (err) {
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
    fetchDesigns();
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft: "220px",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2
            className="mb-4"
            style={{
              color: "#000000",
              textShadow: "0px 0px 8px rgba(0, 0, 0, 0.34)", // add shadow for readability
            }}
          >
            My Designs
          </h2>
          <button
            className="btn btn-success"
            onClick={() => navigate("/create-design")}
          >
            + Create New Design
          </button>
        </div>

        {loading ? (
          <div className="text-center mt-5 text-white">
            <div className="spinner-border text-light" role="status" />
            <p className="mt-2">Loading...</p>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center mt-5 text-white">
            <p className="text-muted">No designs found.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/create-design")}
            >
              + Create New Design
            </button>
          </div>
        ) : (
          <div className="row">
            {designs.map((design) => (
              <div key={design.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card shadow-sm h-100 border-0 hover-shadow">
                  <div className="card-body">
                    <h5 className="card-title fw-semibold">{design.name}</h5>
                    <p className="mb-1">
                      <strong>Type:</strong> {design.type}
                    </p>
                    <p className="mb-1">
                      <strong>Visibility:</strong>{" "}
                      <span className={`badge ${design.isPublic ? 'bg-success' : 'bg-secondary'}`}>
                        {design.isPublic ? "Public" : "Private"}
                      </span>
                    </p>
                    <p className="text-muted small mb-0">
                      <strong>Created:</strong>{" "}
                      {new Date(
                        design.createdAt?.seconds
                          ? design.createdAt.seconds * 1000
                          : design.createdAt
                      ).toLocaleString()}
                    </p>
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

export default Dashboard;