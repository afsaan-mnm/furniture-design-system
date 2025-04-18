import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const objectImages = [
  { label: "Bed 1 Blue", type: "bed1blue", image: "/src/assets/2d/Bed/bed1blue.png" },
  { label: "Bed 1 Red", type: "bed1red", image: "/src/assets/2d/Bed/bed1red.png" },
  { label: "Bed 1 White", type: "bed1white", image: "/src/assets/2d/Bed/bed1white.png" },
  { label: "Bed 2 Blue", type: "bed2blue", image: "/src/assets/2d/Bed/bed2blue.png" },
  { label: "Bed 2 Red", type: "bed2red", image: "/src/assets/2d/Bed/bed2red.png" },
  { label: "Bed 2 White", type: "bed2white", image: "/src/assets/2d/Bed/bed2white.png" },
  { label: "Chair 1 Blue", type: "chair1blue", image: "/src/assets/2d/Chair/chair1blue.png" },
  { label: "Chair 1 Brown", type: "chair1brown", image: "/src/assets/2d/Chair/chair1brown.png" },
  { label: "Chair 1 Red", type: "chair1red", image: "/src/assets/2d/Chair/chair1red.png" },
  { label: "Chair 1 White", type: "chair1white", image: "/src/assets/2d/Chair/chair1white.png" },
  { label: "Sofa 1 White", type: "sofa1white", image: "/src/assets/2d/Sofa/Sofa 1/sofa1white.png" },
  { label: "Sofa 1 Blue", type: "sofa1blue", image: "/src/assets/2d/Sofa/Sofa 1/sofa1blue.png" },
  { label: "Sofa 1 Brown", type: "sofa1brown", image: "/src/assets/2d/Sofa/Sofa 1/sofa1brown.png" },
  { label: "Sofa 2 Blue", type: "sofa2blue", image: "/src/assets/2d/Sofa/Sofa 2/sofa2blue.png" },
  { label: "Sofa 2 Brown", type: "sofa2brown", image: "/src/assets/2d/Sofa/Sofa 2/sofa2brown.png" },
  { label: "Sofa 2 Gray", type: "sofa2gray", image: "/src/assets/2d/Sofa/Sofa 2/sofa2gray.png" },
  { label: "Sofa 2 Green", type: "sofa2green", image: "/src/assets/2d/Sofa/Sofa 2/sofa2green.png" },
  { label: "Table Blue", type: "tablebl", image: "/src/assets/2d/Table/table1bl.png" },
  { label: "Table Brown", type: "tablebr", image: "/src/assets/2d/Table/table1br.png" },
  { label: "Table White", type: "tablew", image: "/src/assets/2d/Table/table1w.png" }
];

const gridSize = 20;

const CreateDesign = () => {
  const [name, setName] = useState("");
  const [type] = useState("2D");
  const [isPublic, setIsPublic] = useState(false);
  const [objects, setObjects] = useState([]);
  const [selectedObjectType, setSelectedObjectType] = useState(objectImages[0].type);
  const [roomWidthFt, setRoomWidthFt] = useState(30);
  const [roomHeightFt, setRoomHeightFt] = useState(20);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);

  const previewRef = useRef(null);
  const dragRef = useRef({ id: null, offsetX: 0, offsetY: 0 });
  const navigate = useNavigate();

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
      rotateY: 0
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

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");

    if (!name || objects.length === 0) {
      return Swal.fire("Design name and at least one object required.");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("isPublic", isPublic);
    formData.append("objects", JSON.stringify(objects));
    if (bgImageFile) {
      formData.append("bgImage", bgImageFile);
    }

    try {
      await axios.post("http://localhost:5050/api/designs/save", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Success", "Design saved!", "success");
      navigate("/dashboard");
    } catch {
      Swal.fire("Error", "Could not save design", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create New Design</h2>

      {/* ✅ Name Input */}
      <div className="mb-3">
        <label>Design Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter design name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Room Setup */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label>Room Width (ft)</label>
          <input type="number" className="form-control" value={roomWidthFt} onChange={(e) => setRoomWidthFt(parseFloat(e.target.value))} />
        </div>
        <div className="col-md-3">
          <label>Room Height (ft)</label>
          <input type="number" className="form-control" value={roomHeightFt} onChange={(e) => setRoomHeightFt(parseFloat(e.target.value))} />
        </div>
        <div className="col-md-3">
          <label>Background Image</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleBgChange} />
        </div>
        <div className="col-md-3">
          <label>Select Object</label>
          <div className="d-flex gap-2">
            <select className="form-select" value={selectedObjectType} onChange={(e) => setSelectedObjectType(e.target.value)}>
              {objectImages.map((obj) => (
                <option key={obj.type} value={obj.type}>{obj.label}</option>
              ))}
            </select>
            <button className="btn btn-success" onClick={addObject}>+ Add</button>
          </div>
        </div>
      </div>

      {/* Design Canvas */}
      <div ref={previewRef} style={{
        width: `${roomWidthFt * 20}px`,
        height: `${roomHeightFt * 20}px`,
        position: "relative",
        border: "2px dashed #aaa",
        marginBottom: "30px",
        backgroundImage: bgPreview ? `url(${bgPreview})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        {objects.map((obj) => (
          <img
            key={obj.id}
            src={obj.image}
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
            alt={obj.type}
          />
        ))}
      </div>

      {/* Object Editors */}
      {objects.length > 0 && (
        <>
          <h5>Edit Object Properties</h5>
          <div className="row g-3">
            {objects.map((obj) => (
              <div key={obj.id} className="col-md-6">
                <div className="card p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{obj.type}</strong>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                      const clone = { ...obj, id: Date.now(), x: obj.x + 20, y: obj.y + 20 };
                      setObjects([...objects, clone]);
                    }}>Clone</button>
                  </div>
                  <div className="row mt-2">
                    <div className="col"><label>Width (ft)</label><input type="number" className="form-control" value={(obj.width / 20).toFixed(1)} onChange={(e) => updateObject(obj.id, "width", parseFloat(e.target.value) * 20)} /></div>
                    <div className="col"><label>Height (ft)</label><input type="number" className="form-control" value={(obj.height / 20).toFixed(1)} onChange={(e) => updateObject(obj.id, "height", parseFloat(e.target.value) * 20)} /></div>
                    <div className="col"><label>Rotate X (°)</label><input type="number" className="form-control" value={obj.rotateX} onChange={(e) => updateObject(obj.id, "rotateX", e.target.value)} /></div>
                    <div className="col"><label>Rotate Y (°)</label><input type="number" className="form-control" value={obj.rotateY} onChange={(e) => updateObject(obj.id, "rotateY", e.target.value)} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Public Checkbox */}
      <div className="form-check mt-4 mb-4">
        <input type="checkbox" className="form-check-input" id="publicCheck" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        <label className="form-check-label" htmlFor="publicCheck">Make this design public</label>
      </div>

      {/* Buttons */}
      <button className="btn btn-primary w-100 mb-2" onClick={handleSubmit}>Save Design</button>
      <button className="btn btn-outline-dark w-100 mb-5" onClick={handleExportPDF}>Export to PDF</button>
    </div>
  );
};

export default CreateDesign;