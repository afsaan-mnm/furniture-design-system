import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomizeRoom.css';

const furnitureOptions = {
  bed1blue: '/src/assets/2d/Bed/bed1blue.png',
  bed1red: '/src/assets/2d/Bed/bed1red.png',
  bed1white: '/src/assets/2d/Bed/bed1white.png',
  bed2blue: '/src/assets/2d/Bed/bed2blue.png',
  bed2red: '/src/assets/2d/Bed/bed2red.png',
  bed2white: '/src/assets/2d/Bed/bed2white.png',

  chair1blue: '/src/assets/2d/Chair/chair1blue.png',
  chair1brown: '/src/assets/2d/Chair/chair1brown.png',
  chair1red: '/src/assets/2d/Chair/chair1red.png',
  chair1white: '/src/assets/2d/Chair/chair1white.png',

  sofa1blue: '/src/assets/2d/Sofa/Sofa 1/sofa1blue.png',
  sofa1brown: '/src/assets/2d/Sofa/Sofa 1/sofa1brown.png',
  sofa1white: '/src/assets/2d/Sofa/Sofa 1/sofa1white.png',

  sofa2blue: '/src/assets/2d/Sofa/Sofa 2/sofa2blue.png',
  sofa2brown: '/src/assets/2d/Sofa/Sofa 2/sofa2brown.png',
  sofa2gray: '/src/assets/2d/Sofa/Sofa 2/sofa2gray.png',
  sofa2green: '/src/assets/2d/Sofa/Sofa 2/sofa2green.png',

  table1bl: '/src/assets/2d/Table/table1bl.png',
  table1br: '/src/assets/2d/Table/table1br.png',
  table1w: '/src/assets/2d/Table/table1w.png'
};

const CustomizeRoom = () => {
  const [wallColor, setWallColor] = useState('#ffffff');
  const [wallpaper, setWallpaper] = useState(null);
  const [selectedFurniture, setSelectedFurniture] = useState('bed1blue');
  const previewRef = useRef(null);
  const navigate = useNavigate();

  const handleWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setWallpaper(imageUrl);
    }
  };

  const exportPDF = async () => {
    const canvas = await html2canvas(previewRef.current);
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 140);
    pdf.save('custom-room.pdf');
  };

  return (
    <div className="custom-room-container">
      <div className="left-panel">
        <button className="back-btn" onClick={() => navigate("/")}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="fw-bold mb-4">Customize Your Room</h2>

        <label className="form-label">Wall Color</label>
        <input
          type="color"
          value={wallColor}
          onChange={(e) => setWallColor(e.target.value)}
          className="form-control form-control-color mb-3"
        />

        <label className="form-label">Background Image</label>
        <input
          type="file"
          accept="image/*"
          className="form-control mb-4"
          onChange={handleWallpaperUpload}
        />

        <label className="form-label">Select Furniture</label>
        <select
          className="form-select mb-4"
          value={selectedFurniture}
          onChange={(e) => setSelectedFurniture(e.target.value)}
        >
          <optgroup label="Beds">
            <option value="bed1blue">Bed 1 Blue</option>
            <option value="bed1red">Bed 1 Red</option>
            <option value="bed1white">Bed 1 White</option>
            <option value="bed2blue">Bed 2 Blue</option>
            <option value="bed2red">Bed 2 Red</option>
            <option value="bed2white">Bed 2 White</option>
          </optgroup>
          <optgroup label="Chairs">
            <option value="chair1blue">Chair 1 Blue</option>
            <option value="chair1brown">Chair 1 Brown</option>
            <option value="chair1red">Chair 1 Red</option>
            <option value="chair1white">Chair 1 White</option>
          </optgroup>
          <optgroup label="Sofa 1">
            <option value="sofa1blue">Sofa 1 Blue</option>
            <option value="sofa1brown">Sofa 1 Brown</option>
            <option value="sofa1white">Sofa 1 White</option>
          </optgroup>
          <optgroup label="Sofa 2">
            <option value="sofa2blue">Sofa 2 Blue</option>
            <option value="sofa2brown">Sofa 2 Brown</option>
            <option value="sofa2gray">Sofa 2 Gray</option>
            <option value="sofa2green">Sofa 2 Green</option>
          </optgroup>
          <optgroup label="Tables">
            <option value="table1bl">Table Blue</option>
            <option value="table1br">Table Brown</option>
            <option value="table1w">Table White</option>
          </optgroup>
        </select>

        <button className="btn btn-dark w-100" onClick={exportPDF}>
          Export to PDF
        </button>
      </div>

      <div className="right-panel" ref={previewRef}>
        <div
          className="wall"
          style={{
            backgroundColor: wallColor,
            backgroundImage: wallpaper ? `url(${wallpaper})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>

        <div className="floor">
          <img
            src={furnitureOptions[selectedFurniture]}
            alt={selectedFurniture}
            className="furniture"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomizeRoom;