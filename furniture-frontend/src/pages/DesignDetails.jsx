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
  const canvas3DRef = useRef(null);
  const container3DRef = useRef(null); // Reference for the container div
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
      confirmButtonText: "Delete",
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
    if (!previewRef.current && design.type === "2D") return;
    
    try {
      // Create PDF document
      const pdf = new jsPDF("landscape", "pt", "a4");
      
      if (design.type === "2D") {
        // For 2D designs, use html2canvas as before
        const canvas = await html2canvas(previewRef.current);
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 40, 40, 500, 300);
      } else {
        // For 3D designs, include both image and text information
        pdf.setFontSize(24);
        pdf.text(`3D Design: ${design.name}`, 40, 40);
        
        // Capture the 3D canvas content
        try {
          // Find the actual canvas element within the container
          if (container3DRef.current) {
            // Get the canvas element (the first canvas inside our container)
            const canvas = container3DRef.current.querySelector("canvas");
            
            if (canvas) {
              // Capture the current view as an image
              const imgData = canvas.toDataURL("image/png");
              
              // Add it to the PDF
              pdf.addImage(imgData, "PNG", 40, 60, 500, 300);
            } else {
              pdf.text("(3D preview image not available - canvas not found)", 40, 180);
            }
          }
        } catch (err) {
          console.error("Error capturing 3D canvas:", err);
          pdf.text("(Error capturing 3D preview)", 40, 180);
        }
        
        // Add design information below the image
        pdf.setFontSize(12);
        pdf.text(`Created: ${design.createdAt?.seconds ? new Date(design.createdAt.seconds * 1000).toLocaleString() : "N/A"}`, 40, 380);
        pdf.text(`Visibility: ${design.isPublic ? "Public" : "Private"}`, 40, 400);
        
        // Add objects list
        pdf.text("Objects in this design:", 40, 430);
        let yPos = 450;
        design.designData?.objects?.forEach((obj, i) => {
          pdf.text(`${i+1}. ${obj.name || obj.type} (Position: ${obj.position.map(p => p.toFixed(2)).join(", ")})`, 60, yPos);
          yPos += 20;
        });
      }
      
      pdf.save(`${design.name}_preview.pdf`);
      Swal.fire("Success", "PDF exported successfully!", "success");
    } catch (error) {
      console.error("PDF export error:", error);
      Swal.fire("Error", "Failed to export PDF. Please try again.", "error");
    }
  };

  // ✅ New: Navigate to Edit Page
  const handleEdit = () => {
    if (!design) return;
    if (design.type === "2D") {
      navigate(`/edit-2d/${id}`);
    } else if (design.type === "3D") {
      navigate(`/edit-3d/${id}`);
    }
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
                  ref={container3DRef}
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
                    ref={canvas3DRef}
                    id="design3d-canvas"
                    style={{ position: "relative", zIndex: 1 }}
                    camera={{ position: [0, 1.5, 4], fov: 50 }}
                    onCreated={(state) => {
                      // Store reference to the canvas for PDF export
                      canvas3DRef.current = state;
                    }}
                    gl={{ preserveDrawingBuffer: true }}
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

              {/* Buttons */}
              <button className="btn btn-outline-secondary me-2" onClick={exportToPDF}>
                Export to PDF
              </button>
              <button className="btn btn-outline-primary me-2" onClick={togglePublic}>
                Make {design.isPublic ? "Private" : "Public"}
              </button>
              <button className="btn btn-outline-success me-2" onClick={handleEdit}>
                Edit Design
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