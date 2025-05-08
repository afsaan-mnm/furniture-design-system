import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaCamera, FaCube } from "react-icons/fa";
import * as THREE from "three";
import "../styles/CreateDesign.css";
import "../styles/Design3D.css";
import objectImages from "../data/objectImages";

// Loaders
const ObjModel = ({ path }) => {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj} />;
};

const GlbModel = ({ path, color }) => {
  const gltf = useLoader(GLTFLoader, path);

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh && color) {
        child.material = new THREE.MeshStandardMaterial({ color });
      }
    });
  }, [gltf, color]);

  return <primitive object={gltf.scene} />;
};

const ModelMesh = ({ model, selected, onSelect, onUpdate, mode }) => {
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
          if (mode === "object") {
            e.stopPropagation();
            onSelect(model.id);
          }
        }}
      >
        {model.type === "obj" ? (
          <ObjModel path={model.path} />
        ) : (
          <GlbModel path={model.path} color={model.color || "#ffffff"} />
        )}
      </mesh>

      {selected && mode === "object" && (
        <TransformControls
          object={ref.current}
          mode="translate"
          onObjectChange={() => {
            if (!ref.current) return;
            onUpdate(model.id, "position", ref.current.position.toArray());
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

const WallsAndFloor = ({ roomWidth, roomLength, roomHeight, wallColor, floorColor }) => {
  const { camera } = useThree();
  const [hideWall, setHideWall] = useState("");

  useFrame(() => {
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    
    if (Math.abs(camDir.x) > Math.abs(camDir.z)) {
      setHideWall(camDir.x > 0 ? "left" : "right");
    } else {
      setHideWall(camDir.z > 0 ? "back" : "front");
    }
  });

  return (
    <group>
      {hideWall !== "back" && (
        <mesh position={[0, roomHeight / 2, -roomLength / 2]}>
          <planeGeometry args={[roomWidth, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}
      {hideWall !== "front" && (
        <mesh position={[0, roomHeight / 2, roomLength / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[roomWidth, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}
      {hideWall !== "left" && (
        <mesh position={[-roomWidth / 2, roomHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[roomLength, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}
      {hideWall !== "right" && (
        <mesh position={[roomWidth / 2, roomHeight / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[roomLength, roomHeight]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomWidth, roomLength]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const Edit3D = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [roomWidth, setRoomWidth] = useState(8);
  const [roomLength, setRoomLength] = useState(8);
  const [roomHeight, setRoomHeight] = useState(3);
  const [wallColor, setWallColor] = useState("#f5f5f5");
  const [floorColor, setFloorColor] = useState("#e0cda9");
  const [isPublic, setIsPublic] = useState(false);
  const [mode, setMode] = useState("camera");
  const [modelType, setModelType] = useState("Chair1");
  const [designName, setDesignName] = useState("");

  const modelPaths = {
    Bookrack: "/models/Bookrack.glb",
    Chair1: "/models/Chair1.glb",
    Chair2: "/models/Chair2.glb",
    Coffeetable: "/models/coffeetable.glb",
    GamingChair: "/models/gamingchair.glb",
    Rack2: "/models/rack2.glb",
    Couch: "/models/couch02.glb",
    Sofa: "/models/sofa1.glb",
    Sofa2: "/models/soffaaaa.glb",
  };

  const modelToObjectImageMap = {
    "Bookrack": "Bookrack",
    "Chair1": "Chair1",
    "Chair2": "Chair2",
    "Coffeetable": "coffeetable",
    "GamingChair": "gamingchair",
    "Rack2": "rack2",
    "Couch": "couch02",
    "Sofa": "sofa1",
    "Sofa2": "soffaaaa"
  };

  useEffect(() => {
    fetchDesign();
  }, [id]);

  const fetchDesign = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/api/designs/${id}`);
      const data = res.data;
      setModels(data.designData.objects || []);
      setRoomWidth(data.designData.roomWidth || 8);
      setRoomLength(data.designData.roomLength || 8);
      setRoomHeight(data.designData.roomHeight || 3);
      setWallColor(data.designData.wallColor || "#f5f5f5");
      setFloorColor(data.designData.floorColor || "#e0cda9");
      setIsPublic(data.isPublic || false);
      setDesignName(data.name || "Edited 3D Design");
    } catch {
      Swal.fire("Error", "Failed to load design", "error");
    }
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
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [0.5, 0.5, 0.5],
      color: "#ffffff",
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

  const handleScaleUp = (id) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, scale: m.scale.map((s) => s + 0.1) } : m
      )
    );
  };

  const handleScaleDown = (id) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, scale: m.scale.map((s) => Math.max(0.1, s - 0.1)) } : m
      )
    );
  };

  const handleRotateLeft = (id) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, rotation: [m.rotation[0], m.rotation[1] + 0.1, m.rotation[2]] }
          : m
      )
    );
  };

  const handleRotateRight = (id) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, rotation: [m.rotation[0], m.rotation[1] - 0.1, m.rotation[2]] }
          : m
      )
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");
    if (models.length === 0) return Swal.fire("Add at least one model.");

    const formData = new FormData();
    formData.append("name", designName);
    formData.append("type", "3D");
    formData.append("isPublic", isPublic);
    formData.append("objects", JSON.stringify(models));
    formData.append("designMeta", JSON.stringify({
      roomWidth,
      roomLength,
      roomHeight,
      wallColor,
      floorColor,
    }));

    try {
      await axios.post(`http://localhost:5050/api/designs/save`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Success", "Design saved as new!", "success");
      navigate("/dashboard");
    } catch {
      Swal.fire("Error", "Could not save design", "error");
    }
  };

  const handleSelectModel = (id) => {
    if (mode === "object") {
      setSelectedModelId(id);
    }
  };

  return (
    <div className="create-design-page" style={{display: "flex", height: "100vh", background: "white"}}>
      {/* Sidebar */}
      <div
        className="design-sidebar p-4 text-start"
        style={{
          width: "320px",
          padding: "20px",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-dark rounded-circle mb-3"
        >
          ←
        </button>
        <h4 className="mb-4 fw-bold">Edit 3D Design</h4>

        <div className="form-group mb-3">
          <label className="form-label fw-semibold">Design Name</label>
          <input 
            type="text" 
            className="form-control" 
            value={designName} 
            onChange={(e) => setDesignName(e.target.value)} 
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Room Width</label>
          <input
            type="range"
            min="3"
            max="20"
            value={roomWidth}
            onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
            className="form-range"
          />
          <small className="text-muted">{roomWidth} meters</small>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Room Length</label>
          <input
            type="range"
            min="3"
            max="20"
            value={roomLength}
            onChange={(e) => setRoomLength(parseFloat(e.target.value))}
            className="form-range"
          />
          <small className="text-muted">{roomLength} meters</small>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Room Height</label>
          <input
            type="range"
            min="2"
            max="6"
            value={roomHeight}
            onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
            className="form-range"
          />
          <small className="text-muted">{roomHeight} meters</small>
        </div>

        <div className="mb-4 d-flex align-items-end gap-4">
          <div>
            <label className="form-label fw-semibold d-block">Wall Color</label>
            <input
              type="color"
              value={wallColor}
              onChange={(e) => setWallColor(e.target.value)}
              className="form-control form-control-color"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
          <div>
            <label className="form-label fw-semibold d-block">Floor Color</label>
            <input
              type="color"
              value={floorColor}
              onChange={(e) => setFloorColor(e.target.value)}
              className="form-control form-control-color"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold mb-2">Add New Model</label>
          <div className="object-grid">
            {Object.keys(modelPaths).map((key) => {
              const objectImageType = modelToObjectImageMap[key];
              const matchingObject = objectImages.find(obj => obj.type === objectImageType);
              const imagePath = matchingObject ? matchingObject.image : '';
              
              return (
                <div 
                  key={key} 
                  className={`object-card ${modelType === key ? 'selected' : ''}`}
                  onClick={() => setModelType(key)}
                >
                  <img 
                    src={imagePath} 
                    alt={key} 
                    className="object-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/src/assets/2d/3dto2d/placeholder.png'; 
                    }}
                  />
                  <p className="object-label">{matchingObject?.label || key}</p>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary w-100 mt-3" onClick={handleAddModel}>
            Add Selected Model
          </button>
        </div>

        <button className="btn btn-success w-100 mb-3" onClick={handleSubmit}>
          Save Design
        </button>

        {models.length > 0 && (
          <div className="mt-4">
            <h5 className="fw-semibold mb-3">Manage Objects</h5>
            {models.map((obj) => (
              <div key={obj.id} className="card p-2 my-2">
                <div className="d-flex justify-content-between">
                  <strong>{obj.name}</strong>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteModel(obj.id)}
                  >
                    Delete
                  </button>
                </div>

                {obj.type === "glb" && (
                  <input
                    type="color"
                    className="form-control form-control-color mt-2"
                    value={obj.color}
                    onChange={(e) => updateModel(obj.id, "color", e.target.value)}
                  />
                )}

                <div className="d-flex justify-content-between mt-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleScaleUp(obj.id)}
                  >
                    Scale +
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleScaleDown(obj.id)}
                  >
                    Scale -
                  </button>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleRotateLeft(obj.id)}
                  >
                    Rotate ➡️
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleRotateRight(obj.id)}
                  >
                    Rotate ⬅️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Mode Switch Buttons */}
        <div 
          style={{ 
            position: "absolute", 
            top: "20px", 
            left: "50%", 
            transform: "translateX(-50%)", 
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.7)",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            gap: "10px"
          }}
        >
          <button 
            className={`btn ${mode === "object" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setMode("object")}
          >
            <FaCube className="me-1" /> Object Mode
          </button>
          <button 
            className={`btn ${mode === "camera" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setMode("camera")}
          >
            <FaCamera className="me-1" /> Camera Mode
          </button>
        </div>
        
        <Canvas camera={{ position: [10, 6, 10], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} />
          <OrbitControls 
            enablePan={mode === "camera"}
            enableRotate={mode === "camera"} 
            enableZoom={mode === "camera"}
          />
          <Suspense fallback={null}>
            <WallsAndFloor
              roomWidth={roomWidth}
              roomLength={roomLength}
              roomHeight={roomHeight}
              wallColor={wallColor}
              floorColor={floorColor}
            />
            {models.map((model) => (
              <ModelMesh
                key={model.id}
                model={model}
                selected={selectedModelId === model.id}
                onSelect={handleSelectModel}
                onUpdate={updateModel}
                mode={mode}
              />
            ))}
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default Edit3D;