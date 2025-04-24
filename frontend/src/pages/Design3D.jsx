import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

// Loaders
const ObjModel = ({ path }) => {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj} />;
};

const GlbModel = ({ path }) => {
  const gltf = useLoader(GLTFLoader, path);
  return <primitive object={gltf.scene} />;
};

const ModelMesh = ({ model, selected, onSelect, onUpdate }) => {
  const ref = useRef();

  useEffect(() => {
    if (selected && ref.current) {
      onUpdate(model.id, "position", ref.current.position.toArray());
      onUpdate(model.id, "rotation", [
        ref.current.rotation.x,
        ref.current.rotation.y,
        ref.current.rotation.z,
      ]);
      onUpdate(model.id, "scale", ref.current.scale.toArray());
    }
  }, [selected]);

  return (
    <group>
      <mesh
        ref={ref}
        position={model.position}
        rotation={model.rotation}
        scale={model.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(model.id);
        }}
      >
        {model.type === "obj" ? <ObjModel path={model.path} /> : <GlbModel path={model.path} />}
      </mesh>

      {selected && (
        <TransformControls
          object={ref.current}
          mode="translate"
          onObjectChange={() => {
            if (!ref.current) return;
            const pos = ref.current.position.toArray();
            pos[1] = Math.max(-1, pos[1]);
            onUpdate(model.id, "position", pos);
            onUpdate(model.id, "rotation", [
              ref.current.rotation.x,
              ref.current.rotation.y,
              ref.current.rotation.z,
            ]);
            onUpdate(model.id, "scale", ref.current.scale.toArray());
          }}
        />
      )}
    </group>
  );
};

const Design3D = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [modelType, setModelType] = useState("Chair1");
  const [position, setPosition] = useState([0, -1, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [scale, setScale] = useState([0.5, 0.5, 0.5]);
  const [isPublic, setIsPublic] = useState(false);
  const navigate = useNavigate();

  const modelPaths = {
    Bookrack: "/models/Bookrack.glb",
    Chair1: "/models/Chair1.glb",
    Chair2: "/models/Chair2.glb",
    Coffeetable: "/models/coffeetable.glb",
    GamingChair: "/models/gamingchair.glb",
    Rack2: "/models/rack2.glb",
  };

  const handleAddModel = () => {
    const id = Date.now();
    const path = modelPaths[modelType];
    const type = path.endsWith(".glb") ? "glb" : "obj";

    const newModel = {
      id,
      name: modelType,
      path,
      type,
      position: [0, -1, 0],
      rotation,
      scale,
    };

    setModels([...models, newModel]);
    setSelectedModelId(id);
  };

  const updateModel = (id, field, value) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const deleteModel = (id) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    if (selectedModelId === id) setSelectedModelId(null);
  };

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");
    if (models.length === 0) return Swal.fire("Add at least one model.");

    const formData = new FormData();
    formData.append("name", "My 3D Design");
    formData.append("type", "3D");
    formData.append("isPublic", isPublic);
    formData.append("objects", JSON.stringify(models));

    try {
      await axios.post("http://localhost:5050/api/designs/save", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Design saved!", "success");
      navigate("/dashboard");
    } catch {
      Swal.fire("Error", "Could not save design", "error");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "260px", padding: "20px", background: "#f8f9fa", overflowY: "auto" }}>
        <h5 className="mb-3">Model Controls</h5>
        <select
          className="form-select mb-3"
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
        >
          {Object.keys(modelPaths).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>

        <label>Position (X Y Z)</label>
        {["x", "y", "z"].map((axis, i) => (
          <input key={axis} type="number" className="form-control mb-1"
            value={position[i]} onChange={(e) => {
              const p = [...position];
              p[i] = parseFloat(e.target.value);
              setPosition(p);
            }} />
        ))}

        <label>Rotation (X Y Z)</label>
        {["x", "y", "z"].map((axis, i) => (
          <input key={axis} type="number" className="form-control mb-1"
            value={rotation[i]} onChange={(e) => {
              const r = [...rotation];
              r[i] = parseFloat(e.target.value);
              setRotation(r);
            }} />
        ))}

        <label>Scale (X Y Z)</label>
        {["x", "y", "z"].map((axis, i) => (
          <input key={axis} type="number" className="form-control mb-1"
            value={scale[i]} onChange={(e) => {
              const s = [...scale];
              s[i] = parseFloat(e.target.value);
              setScale(s);
            }} />
        ))}

        <button className="btn btn-primary w-100 my-2" onClick={handleAddModel}>
          Add Model
        </button>

        <label>Wall Image</label>
        <input type="file" className="form-control mb-2" accept="image/*" onChange={handleBgChange} />

        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <label className="form-check-label">Make design public</label>
        </div>

        <button className="btn btn-dark w-100 mb-3" onClick={handleSubmit}>Save Design</button>

        {models.length > 0 && (
          <div>
            <h6>Edit Object Properties</h6>
            {models.map((obj) => (
              <div key={obj.id} className="card p-2 my-2">
                <div className="d-flex justify-content-between">
                  <strong>{obj.name}</strong>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteModel(obj.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 8.5, position: "relative", backgroundColor: "#eee" }}>
          {bgImage && (
            <img
              src={bgImage}
              alt="Wallpaper"
              style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            />
          )}
          <Canvas style={{ position: "absolute", inset: 0 }} camera={{ position: [0, 1.5, 4], fov: 30 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 2, 3]} />
            <OrbitControls />
            <Suspense fallback={null}>
              {models.map((model) => (
                <ModelMesh
                  key={model.id}
                  model={model}
                  selected={selectedModelId === model.id}
                  onSelect={setSelectedModelId}
                  onUpdate={updateModel}
                />
              ))}
            </Suspense>
          </Canvas>
        </div>

        <div style={{ flex: 1.5, background: "#e0cda9" }} />
      </div>
    </div>
  );
};

export default Design3D;