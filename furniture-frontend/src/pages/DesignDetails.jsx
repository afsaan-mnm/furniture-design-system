import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "../components/Sidebar";

const DesignDetails = () => {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const previewRef = useRef(null);
  const navigate = useNavigate();

  const fetchDesign = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/api/designs/${id}`);
      setDesign(res.data);
    } catch (err) {
      Swal.fire("Error", "Design not found", "error");
    }
  };

  const togglePublic = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");

    try {
      await axios.put(
        `http://localhost:5050/api/designs/${id}/visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDesign({ ...design, isPublic: !design.isPublic });
      Swal.fire("Success", "Visibility updated", "success");
    } catch {
      Swal.fire("Error", "Could not update design", "error");
    }
  };

  const deleteDesign = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This will permanently delete the design!",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");

    try {
      await axios.delete(`http://localhost:5050/api/designs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Deleted", "Design removed", "success");
      navigate("/dashboard");
    } catch {
      Swal.fire("Error", "Could not delete design", "error");
    }
  };

  const exportToPDF = async () => {
    const input = previewRef.current;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${design.name}_preview.pdf`);
  };

  useEffect(() => {
    fetchDesign();
  }, [id]);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container mt-4" style={{ marginLeft: "220px" }}>
        {design ? (
          <>
            <h3>{design.name}</h3>
            <p>Type: {design.type}</p>
            <p>
              Visibility:{" "}
              <span className={design.isPublic ? "text-success" : "text-danger"}>
                {design.isPublic ? "Public" : "Private"}
              </span>
            </p>
            <p>
              Objects:{" "}
              {design.designData.objects.map((obj, i) => (
                <span key={i} className="badge bg-dark me-2">
                  {obj.type}
                </span>
              ))}
            </p>
            <p>
              Created At:{" "}
              {design.createdAt && design.createdAt.seconds
                ? new Date(design.createdAt.seconds * 1000).toLocaleString()
                : "N/A"}
            </p>

            <div className="my-4">
              <h5>2D Preview</h5>
              <div
                ref={previewRef}
                style={{
                  position: "relative",
                  backgroundImage: design.designData?.background
                    ? `url(http://localhost:5050/uploads/${design.designData.background})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  width: "700px",
                  height: "450px",
                  border: "2px solid #ccc",
                  marginBottom: "20px",
                }}
              >
                {design.designData.objects.map((obj, i) => (
                  <img
                    key={i}
                    src={obj.image}
                    alt={obj.type}
                    style={{
                      position: "absolute",
                      left: obj.x,
                      top: obj.y,
                      width: obj.width,
                      height: obj.height,
                      transform: `rotateX(${obj.rotateX || 0}deg) rotateY(${obj.rotateY || 0}deg)`,
                    }}
                  />
                ))}
              </div>
              <button className="btn btn-outline-secondary me-2" onClick={exportToPDF}>
                Export to PDF
              </button>
              <button
                className="btn btn-outline-primary me-2"
                onClick={togglePublic}
              >
                Make {design.isPublic ? "Private" : "Public"}
              </button>
              <button className="btn btn-outline-danger" onClick={deleteDesign}>
                Delete Design
              </button>
            </div>
          </>
        ) : (
          <p>Loading design details...</p>
        )}
      </div>
    </div>
  );
};

export default DesignDetails;