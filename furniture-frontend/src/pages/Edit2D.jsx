import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/CreateDesign.css";
import objectImages from "../data/objectImages";

const gridSize = 20;

const Edit2D = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [objects, setObjects] = useState([]);
  const [selectedObjectType, setSelectedObjectType] = useState(objectImages[0]?.type || "");
  const [roomWidthFt, setRoomWidthFt] = useState(30);
  const [roomHeightFt, setRoomHeightFt] = useState(20);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [existingBgImage, setExistingBgImage] = useState(null);

  const previewRef = useRef(null);
  const dragRef = useRef({ id: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    fetchDesign();
  }, [id]);

  const fetchDesign = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/api/designs/${id}`);
      const data = res.data;
      setName(data.name);
      setIsPublic(data.isPublic);
      setObjects(data.designData.objects || []);
      setExistingBgImage(data.designData.background || null);
    } catch {
      Swal.fire("Error", "Failed to load design", "error");
    }
  };

  const addObject = () => {
    const config = objectImages.find(obj => obj.type === selectedObjectType);
    if (!config) return;
    const newObj = {
      id: Date.now(),
      type: config.type,
      image: config.image,
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      rotateX: 0,
      rotateY: 0,
    };
    setObjects([...objects, newObj]);
  };

  const handleDelete = (id) => {
    setObjects(objects.filter(obj => obj.id !== id));
  };

  const updateObject = (id, field, value) => {
    setObjects(prev =>
      prev.map(obj =>
        obj.id === id ? { ...obj, [field]: parseFloat(value) || 0 } : obj
      )
    );
  };

  const startDrag = (e, id) => {
    const obj = objects.find(o => o.id === id);
    if (!obj || !previewRef.current) return;
    const bounds = previewRef.current.getBoundingClientRect();
    dragRef.current = {
      id,
      offsetX: e.clientX - bounds.left - obj.x,
      offsetY: e.clientY - bounds.top - obj.y
    };
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", stopDrag);
  };

  const handleDragMove = (e) => {
    const { id, offsetX, offsetY } = dragRef.current;
    if (!id || !previewRef.current) return;
    const bounds = previewRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - bounds.left - offsetX) / gridSize) * gridSize;
    const y = Math.round((e.clientY - bounds.top - offsetY) / gridSize) * gridSize;
    setObjects(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, x, y } : obj))
    );
  };

  const stopDrag = () => {
    dragRef.current = { id: null, offsetX: 0, offsetY: 0 };
    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", stopDrag);
  };

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBgImageFile(file);
      setBgPreview(URL.createObjectURL(file));
    }
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current);
    const pdf = new jsPDF("landscape", "pt", "a4");
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 40, 40, 500, 300);
    pdf.save(`${name || "design"}.pdf`);
  };

  // ✅ Overwrite existing design
  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");

    if (!name || objects.length === 0) {
      return Swal.fire("Design name and at least one object required.");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", "2D");
    formData.append("isPublic", isPublic);
    formData.append("objects", JSON.stringify(objects));
    if (bgImageFile) {
      formData.append("bgImage", bgImageFile);
    }

    try {
      await axios.put(`http://localhost:5050/api/designs/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Success", "Design updated!", "success");
      navigate("/dashboard");
    } catch {
      Swal.fire("Error", "Could not update design", "error");
    }
  };

  // ✅ Save as a new design
  const handleSaveAsNew = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");

    if (!name || objects.length === 0) {
      return Swal.fire("Design name and at least one object required.");
    }

    const formData = new FormData();
    formData.append("name", name + " (Edited)");
    formData.append("type", "2D");
    formData.append("isPublic", isPublic);
    formData.append("objects", JSON.stringify(objects));
    if (bgImageFile) {
      formData.append("bgImage", bgImageFile);
    }

    try {
      await axios.post(`http://localhost:5050/api/designs/save`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Success", "Design saved as new!", "success");
      navigate("/dashboard");
    } catch {
      Swal.fire("Error", "Could not save design", "error");
    }
  };

  return (
    <div className="create-design-page d-flex" style={{ backgroundImage: "url('/src/assets/fu-bg.svg')" }}>
      {/* Left Panel */}
      <div className="design-sidebar p-4">
        <button onClick={() => navigate("/dashboard")} className="btn btn-dark rounded-circle mb-3">←</button>
        <h3 className="fw-bold mb-4">Edit 2D Design</h3>

        <div className="form-group mb-3">
          <label>Design Name</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="d-flex mb-3 gap-2">
          <div>
            <label>Room Width (ft)</label>
            <input type="number" className="form-control" value={roomWidthFt} onChange={(e) => setRoomWidthFt(parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Room Height (ft)</label>
            <input type="number" className="form-control" value={roomHeightFt} onChange={(e) => setRoomHeightFt(parseFloat(e.target.value))} />
          </div>
        </div>

        <div className="form-group mb-3">
          <label>Background Image (Optional)</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleBgChange} />
        </div>

        <div className="form-group mb-3">
          <label>Select Object</label>
          <div className="d-flex gap-2">
            <select className="form-select" value={selectedObjectType} onChange={(e) => setSelectedObjectType(e.target.value)}>
              {objectImages.map((obj) => (
                <option key={obj.type} value={obj.type}>{obj.label}</option>
              ))}
            </select>
            <button className="btn btn-success" onClick={addObject}>+</button>
          </div>
        </div>

        {objects.length > 0 && (
          <div className="mt-4">
            <h6 className="fw-bold">Edit Object Properties</h6>
            {objects.map((obj) => (
              <div key={obj.id} className="border rounded p-2 mb-2 bg-white shadow-sm">
                <div className="d-flex justify-content-between mb-2">
                  <strong>{obj.type}</strong>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                    const clone = { ...obj, id: Date.now(), x: obj.x + 20, y: obj.y + 20 };
                    setObjects([...objects, clone]);
                  }}>Clone</button>
                </div>
                <div className="row">
                  <div className="col"><input type="number" className="form-control" value={(obj.width / 20).toFixed(1)} onChange={(e) => updateObject(obj.id, "width", parseFloat(e.target.value) * 20)} placeholder="Width (ft)" /></div>
                  <div className="col"><input type="number" className="form-control" value={(obj.height / 20).toFixed(1)} onChange={(e) => updateObject(obj.id, "height", parseFloat(e.target.value) * 20)} placeholder="Height (ft)" /></div>
                  <div className="col"><input type="number" className="form-control" value={obj.rotateX} onChange={(e) => updateObject(obj.id, "rotateX", e.target.value)} placeholder="Rotate X" /></div>
                  <div className="col"><input type="number" className="form-control" value={obj.rotateY} onChange={(e) => updateObject(obj.id, "rotateY", e.target.value)} placeholder="Rotate Y" /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="form-check mt-3 mb-3">
          <input type="checkbox" className="form-check-input" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <label className="form-check-label">Make this design public</label>
        </div>

        <button className="btn btn-success w-100 mb-2" onClick={handleUpdate}>Update Design</button>
        <button className="btn btn-primary w-100 mb-2" onClick={handleSaveAsNew}>Save as New Design</button>
        <button className="btn btn-outline-dark w-100" onClick={handleExportPDF}>Export to PDF</button>
      </div>

      {/* Canvas */}
      <div className="design-canvas-area d-flex align-items-center justify-content-center flex-grow-1 p-3">
        <div
          ref={previewRef}
          style={{
            width: `${roomWidthFt * gridSize}px`,
            height: `${roomHeightFt * gridSize}px`,
            border: "2px dashed #aaa",
            backgroundImage: bgPreview
              ? `url(${bgPreview})`
              : existingBgImage
              ? `url(http://localhost:5050/uploads/${existingBgImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative"
          }}
        >
          {objects.map((obj) => (
            <img
              key={obj.id}
              src={obj.image}
              alt={obj.type}
              onMouseDown={(e) => startDrag(e, obj.id)}
              onDoubleClick={() => handleDelete(obj.id)}
              style={{
                position: "absolute",
                left: obj.x,
                top: obj.y,
                width: `${obj.width}px`,
                height: `${obj.height}px`,
                transform: `rotateX(${obj.rotateX}deg) rotateY(${obj.rotateY}deg)`,
                cursor: "grab"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Edit2D;