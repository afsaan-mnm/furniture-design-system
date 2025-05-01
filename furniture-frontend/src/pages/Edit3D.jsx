import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
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
    } catch {
      Swal.fire("Error", "Failed to load design", "error");
    }
  };

  const updateModel = (id, field, value) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const deleteModel = (id) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    if (selectedModelId === id) setSelectedModelId(null);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return Swal.fire("Please login.");
    if (models.length === 0) return Swal.fire("Add at least one model.");

    const formData = new FormData();
    formData.append("name", "Edited 3D Design");
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

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "320px", padding: "20px", background: "#fff", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h4 className="mb-4 text-center">Edit 3D Design</h4>

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

        <button className="btn btn-success w-100" onClick={handleSubmit}>
          Save as New Design
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas camera={{ position: [10, 6, 10], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} />
          <OrbitControls enablePan={false} />
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

export default Edit3D;