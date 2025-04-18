import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import DesignDetails from "./pages/DesignDetails";
import CreateDesign from "./pages/CreateDesign";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/design/:id" element={<DesignDetails />} />
        <Route path="/create-design" element={<CreateDesign />} />
      </Routes>
    </div>
  );
}

export default App;