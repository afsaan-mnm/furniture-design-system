import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

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
      <div className="flex-grow-1 p-4" style={{ marginLeft: "220px" }}>
        <h2 className="mb-4">My Designs</h2>
        {loading ? (
          <p>Loading...</p>
        ) : designs.length === 0 ? (
          <div className="text-center mt-5">
            <p>No designs found.</p>
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
              <div key={design.id} className="col-md-4 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{design.name}</h5>
                    <p className="card-text">Type: {design.type}</p>
                    <p className="card-text">
                      Visibility:{" "}
                      {design.isPublic ? "Public" : "Private"}
                    </p>
                    <p className="card-text">
                      Created:{" "}
                      {new Date(design.createdAt).toLocaleString()}
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