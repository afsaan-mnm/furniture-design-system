import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaCamera, FaEdit, FaCube } from "react-icons/fa";
import * as THREE from "three";
import "../styles/CreateDesign.css";

// Loaders
const ObjModel = ({ path }) => {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj} />;
};

const GlbModel = ({ path }) => {
  const gltf = useLoader(GLTFLoader, path);
  return <primitive object={gltf.scene} />;
};

const ModelMesh = ({ model, selected, onSelect, onUpdate, controlMode }) => {
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
          // If clicking an object in camera mode, switch to object mode
          if (controlMode === "camera") {
            // We can't directly update controlMode here since it's a prop
            // The parent component handles this via the onSelect callback
          }
        }}
      >
        {model.type === "obj" ? <ObjModel path={model.path} /> : <GlbModel path={model.path} />}
      </mesh>

      {selected && controlMode === "object" && (
        <TransformControls
          object={ref.current}
          mode="translate"
          onObjectChange={() => {
            if (!ref.current) return;
            const pos = ref.current.position.toArray();
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

const WallsAndFloor = ({ roomWidth, roomLength, roomHeight, wallColor, floorColor }) => {
  const { camera } = useThree();
  const [hideWall, setHideWall] = useState("");

  useFrame(() => {
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    if (Math.abs(camDir.x) > Math.abs(camDir.z)) {
      if (camDir.x > 0) setHideWall("left");
      else setHideWall("right");
    } else {
      if (camDir.z > 0) setHideWall("back");
      else setHideWall("front");
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

const Design3D = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [roomWidth, setRoomWidth] = useState(8);
  const [roomLength, setRoomLength] = useState(8);
  const [roomHeight, setRoomHeight] = useState(3);
  const [wallColor, setWallColor] = useState("#f5f5f5");
  const [floorColor, setFloorColor] = useState("#e0cda9");
  const [modelType, setModelType] = useState("Chair1");
  const [isPublic, setIsPublic] = useState(false);
  const [controlMode, setControlMode] = useState("camera"); // "camera" or "object"
  const navigate = useNavigate();

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
    };

    setModels([...models, newModel]);
    setSelectedModelId(id);
  };

  const updateModel = (id, field, value) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSelectModel = (id) => {
    setSelectedModelId(id);
    // Automatically switch to object mode when selecting an object
    if (id !== null) {
      setControlMode("object");
    }
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
        m.id === id ? { ...m, rotation: [m.rotation[0], m.rotation[1] + 0.1, m.rotation[2]] } : m
      )
    );
  };

  const handleRotateRight = (id) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, rotation: [m.rotation[0], m.rotation[1] - 0.1, m.rotation[2]] } : m
      )
    );
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
      <div style={{ width: "320px", padding: "20px", background: "#fff", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h4 className="mb-4 text-center">Room & Object Settings</h4>

        <div className="mb-4">
          <label><strong>Room Width</strong></label>
          <input type="range" min="3" max="20" value={roomWidth} onChange={(e) => setRoomWidth(parseFloat(e.target.value))} />
          <div className="small text-muted">{roomWidth} meters</div>
        </div>

        <div className="mb-4">
          <label><strong>Room Length</strong></label>
          <input type="range" min="3" max="20" value={roomLength} onChange={(e) => setRoomLength(parseFloat(e.target.value))} />
          <div className="small text-muted">{roomLength} meters</div>
        </div>

        <div className="mb-4">
          <label><strong>Room Height</strong></label>
          <input type="range" min="2" max="6" value={roomHeight} onChange={(e) => setRoomHeight(parseFloat(e.target.value))} />
          <div className="small text-muted">{roomHeight} meters</div>
        </div>

        <div className="mb-4">
          <label><strong>Wall Color</strong></label>
          <input type="color" value={wallColor} onChange={(e) => setWallColor(e.target.value)} className="form-control form-control-color" />
        </div>

        <div className="mb-4">
          <label><strong>Floor Color</strong></label>
          <input type="color" value={floorColor} onChange={(e) => setFloorColor(e.target.value)} className="form-control form-control-color" />
        </div>

        <select
          className="form-select mb-4"
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
        >
          {Object.keys(modelPaths).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>

        <button className="btn btn-primary w-100 mb-3" onClick={handleAddModel}>
          Add Model
        </button>

        <button className="btn btn-success w-100" onClick={handleSubmit}>
          Save Design
        </button>

        {models.length > 0 && (
          <div className="mt-4">
            <h5 className="text-center">Manage Objects</h5>
            {models.map((obj) => (
              <div key={obj.id} className="card p-2 my-2">
                <div className="d-flex justify-content-between">
                  <strong>{obj.name}</strong>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteModel(obj.id)}>
                    <FaTrash />
                  </button>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleScaleUp(obj.id)}>Scale +</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleScaleDown(obj.id)}>Scale -</button>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleRotateLeft(obj.id)}>Rotate ➡️</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => handleRotateRight(obj.id)}>Rotate ⬅️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Control Bar */}
        <div style={{
          position: "absolute", 
          top: "10px", 
          left: "50%", 
          transform: "translateX(-50%)", 
          zIndex: 10, 
          background: "rgba(255, 255, 255, 0.8)",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
          display: "flex",
          gap: "10px",
          alignItems: "center"
        }}>
          <button 
            className={`btn ${controlMode === 'camera' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setControlMode("camera")}
          >
            <FaCamera /> Camera Mode
          </button>
          <button 
            className={`btn ${controlMode === 'object' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setControlMode("object")}
          >
            <FaCube /> Object Mode
          </button>
        </div>

        <Canvas camera={{ position: [10, 6, 10], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} />
          <OrbitControls 
            enabled={controlMode === "camera"}
            enablePan={controlMode === "camera"}
            enableZoom={controlMode === "camera"}
            enableRotate={controlMode === "camera"}
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
                controlMode={controlMode}
              />
            ))}
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default Design3D;