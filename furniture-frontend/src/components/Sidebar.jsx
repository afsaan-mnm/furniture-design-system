// src/components/Sidebar.jsx
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="sidebar bg-light p-3">
      <h4 className="mb-4">FurnitureApp</h4>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link">My Designs</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/explore" className="nav-link">Explore</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/settings" className="nav-link">Settings</Link>
        </li>
        <li className="nav-item mt-3">
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;