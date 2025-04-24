import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import DesignDetails from "./pages/DesignDetails";
import CreateDesign from "./pages/CreateDesign";
import ThreeCanvas from "./pages/ThreeCanvas";
import ObjWithMtl from "./pages/ObjWithMtl";
import Design3D from "./pages/Design3D";
import UserProfile from "./pages/UserProfile"
import Home from "./pages/Home"
import About from './pages/About';
import CustomizeRoom from './pages/CustomizeRoom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/design/:id" element={<DesignDetails />} />
        <Route path="/create-design" element={<CreateDesign />} />
        <Route path="/three" element={<ThreeCanvas />} />
        <Route path="/three2" element={<ObjWithMtl />} />
        <Route path="/design3d" element={<Design3D />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/customize-room" element={<CustomizeRoom />} />
      </Routes>
    </div>
  );
}

export default App;