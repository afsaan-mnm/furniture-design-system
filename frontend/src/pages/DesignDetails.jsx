import React, { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from "../components/Sidebar";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "../styles/DesignDetails.css"; 

// Loaders
const ObjModel = ({ path }) => {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj} />;
};

const GlbModel = ({ path }) => {
  const gltf = useLoader(GLTFLoader, path);
  return <primitive object={gltf.scene} />;
};

const RenderModel = ({ model }) => {
  return (
    <group
      position={model.position}
      rotation={model.rotation}
      scale={model.scale}
    >
      {model.type === "obj" ? (
        <ObjModel path={model.path} />
      ) : (
        <GlbModel path={model.path} />
      )}
    </group>
  );
};

const DesignDetails = () => {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const previewRef = useRef(null);
  const navigate = useNavigate();

  const fetchDesign = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/api/designs/${id}`);
      setDesign(res.data);
    } catch {
      Swal.fire("Error", "Design not found", "error");
    }
  };

  const togglePublic = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login");

    try {
      await axios.put(
        `http://localhost:5050/api/designs/${id}/visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDesign({ ...design, isPublic: !design.isPublic });
      Swal.fire("Updated", "Visibility updated", "success");
    } catch {
      Swal.fire("Error", "Failed to update visibility", "error");
    }
  };

  const deleteDesign = async () => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This will permanently delete the design!",
      showCancelButton: true,
      confirmButtonText: "Delete"
    });

    if (!confirm.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login");

    try {
      await axios.delete(`http://localhost:5050/api/designs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Deleted", "Design removed", "success");
      navigate("/dashboard");
    } catch {
      Swal.fire("Error", "Failed to delete design", "error");
    }
  };

  const exportToPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current);
    const pdf = new jsPDF("landscape", "pt", "a4");
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 40, 40, 500, 300);
    pdf.save(`${design.name}_preview.pdf`);
  };

  useEffect(() => {
    fetchDesign();
  }, [id]);

  return (
    <div className="d-flex design-details-page">
      <Sidebar />
      <div className="container mt-4 text-black" style={{ marginLeft: "220px" }}>
        {design ? (
          <>
            <h3 className="fw-bold">{design.name}</h3>
            <p>Type: <strong>{design.type}</strong></p>
            <p>
              Visibility:{" "}
              <span className={design.isPublic ? "text-success" : "text-danger"}>
                {design.isPublic ? "Public" : "Private"}
              </span>
            </p>
            <p>
              Objects:{" "}
              {design.designData?.objects?.map((obj, i) => (
                <span key={i} className="badge bg-dark text-white me-2">
                  {obj.type || obj.name}
                </span>
              ))}
            </p>
            <p>
              Created At:{" "}
              {design.createdAt?.seconds
                ? new Date(design.createdAt.seconds * 1000).toLocaleString()
                : "N/A"}
            </p>

            <div className="my-4">
              <h5>Preview</h5>

              {/* 2D Preview */}
              {design.type === "2D" && (
                <div
                  ref={previewRef}
                  className="border rounded"
                  style={{
                    position: "relative",
                    backgroundImage: design.designData?.background
                      ? `url(http://localhost:5050/uploads/${design.designData.background})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "700px",
                    height: "450px",
                    marginBottom: "20px"
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
                        transform: `rotateX(${obj.rotateX || 0}deg) rotateY(${obj.rotateY || 0}deg)`
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 3D Preview */}
              {design.type === "3D" && (
                <div
                  className="border rounded"
                  style={{
                    width: "100%",
                    height: "450px",
                    position: "relative",
                    marginBottom: "20px"
                  }}
                >
                  {design.designData?.background && (
                    <img
                      src={`http://localhost:5050/uploads/${design.designData.background}`}
                      alt="bg"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        zIndex: 0
                      }}
                    />
                  )}
                  <Canvas
                    style={{ position: "relative", zIndex: 1 }}
                    camera={{ position: [0, 1.5, 4], fov: 50 }}
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[2, 2, 3]} />
                    <OrbitControls />
                    <Suspense fallback={null}>
                      {design.designData.objects.map((model, i) => (
                        <RenderModel key={i} model={model} />
                      ))}
                    </Suspense>
                  </Canvas>
                </div>
              )}

              <button className="btn btn-outline-secondary me-2" onClick={exportToPDF}>
                Export to PDF
              </button>
              <button className="btn btn-outline-primary me-2" onClick={togglePublic}>
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