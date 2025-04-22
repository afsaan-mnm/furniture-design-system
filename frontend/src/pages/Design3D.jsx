import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Loaders
const ObjModel = ({ path }) => {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj} />;
};

const GlbModel = ({ path }) => {
  const gltf = useLoader(GLTFLoader, path);
  return <primitive object={gltf.scene} />;
};

// Model mesh component
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
        {model.type === "obj" ? (
          <ObjModel path={model.path} />
        ) : (
          <GlbModel path={model.path} />
        )}
      </mesh>

      {selected && (
        <TransformControls
          object={ref.current}
          mode="translate"
          onObjectChange={() => {
            if (!ref.current) return;
            const pos = ref.current.position.toArray();
            const rot = [
              ref.current.rotation.x,
              ref.current.rotation.y,
              ref.current.rotation.z,
            ];
            const scl = ref.current.scale.toArray();

            onUpdate(model.id, "position", pos);
            onUpdate(model.id, "rotation", rot);
            onUpdate(model.id, "scale", scl);
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
  const [modelType, setModelType] = useState("Desk");
  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [scale, setScale] = useState([0.05, 0.05, 0.05]);
  const [isPublic, setIsPublic] = useState(false);
  const navigate = useNavigate();

  const modelPaths = {
    Desk: "/models/Desk.obj",
    Chair: "/models/gamingchair.glb",
    Couch: "/models/couch.obj",
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
      position,
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

  useEffect(() => {
    const selected = models.find((m) => m.id === selectedModelId);
    if (selected) {
      setPosition(selected.position);
      setRotation(selected.rotation);
      setScale(selected.scale);
    }
  }, [selectedModelId, models]);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedModelId) return;
      const step = 0.2;

      setModels((prev) =>
        prev.map((m) => {
          if (m.id !== selectedModelId) return m;
          const p = [...m.position];

          switch (e.key) {
            case "ArrowUp":
              p[2] -= step;
              break;
            case "ArrowDown":
              p[2] += step;
              break;
            case "ArrowLeft":
              p[0] -= step;
              break;
            case "ArrowRight":
              p[0] += step;
              break;
            default:
              return m;
          }

          return { ...m, position: p };
        })
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModelId]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", padding: "20px", background: "#f8f9fa" }}>
        <h5>Model Controls</h5>

        <select
          className="form-select mb-3"
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
        >
          <option value="Desk">Desk</option>
          <option value="Chair">Chair</option>
          <option value="Couch">Couch</option>
        </select>

        <div className="mb-2">
          <label>Position (X Y Z)</label>
          {["x", "y", "z"].map((axis, i) => (
            <input
              key={axis}
              type="number"
              className="form-control mb-1"
              value={position[i]}
              onChange={(e) => {
                const p = [...position];
                p[i] = parseFloat(e.target.value);
                setPosition(p);
              }}
            />
          ))}
        </div>

        <div className="mb-2">
          <label>Rotation (X Y Z)</label>
          {["x", "y", "z"].map((axis, i) => (
            <input
              key={axis}
              type="number"
              className="form-control mb-1"
              value={rotation[i]}
              onChange={(e) => {
                const r = [...rotation];
                r[i] = parseFloat(e.target.value);
                setRotation(r);
              }}
            />
          ))}
        </div>

        <div className="mb-2">
          <label>Scale (X Y Z)</label>
          {["x", "y", "z"].map((axis, i) => (
            <input
              key={axis}
              type="number"
              className="form-control mb-1"
              value={scale[i]}
              onChange={(e) => {
                const s = [...scale];
                s[i] = parseFloat(e.target.value);
                setScale(s);
              }}
            />
          ))}
        </div>

        <button
          className="btn btn-primary w-100 my-2"
          onClick={handleAddModel}
        >
          Add Model
        </button>

        <label>Background Image</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleBgChange}
        />

        <div className="form-check mt-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label className="form-check-label">Make this design public</label>
        </div>

        <button className="btn btn-dark w-100 mt-3" onClick={handleSubmit}>
          Save Design
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", background: "#000" }}>
        {bgImage && (
          <img
            src={bgImage}
            alt="bg"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
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
    </div>
  );
};

export default Design3D;