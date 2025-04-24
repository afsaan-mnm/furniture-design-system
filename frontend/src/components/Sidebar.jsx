import { Link, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="sidebar glass-sidebar p-4">
      <h4 className="mb-4">FurnitureApp</h4>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link text-black">Home</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/dashboard" className="nav-link text-black">My Designs</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/create-design" className="nav-link text-black">Create 2D Design</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/design3d" className="nav-link text-black">Create 3D Design</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/customize-room" className="nav-link text-black">Customize</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/explore" className="nav-link text-black">Explore</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/profile" className="nav-link text-black">Profile</Link>
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