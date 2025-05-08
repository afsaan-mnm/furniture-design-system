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
      <Link to="/" className="text-decoration-none">
        <h4 className="mb-4 text-black">FurnitureApp</h4>
      </Link>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link text-black">Home</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/explore" className="nav-link text-black">Explore</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/shop" className="nav-link text-black">Shop</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/create-design" className="nav-link text-black">Create 2D Design</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/design3d" className="nav-link text-black">Create 3D Design</Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/dashboard" className="nav-link text-black">My Designs</Link>
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