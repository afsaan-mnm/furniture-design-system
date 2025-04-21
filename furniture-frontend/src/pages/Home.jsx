import React from 'react';
import '../styles/Home.css';
import heroimg from '../assets/heroimg.svg';
import can1 from '../assets/can1.svg';
import can2 from '../assets/can2.svg';
import can3 from '../assets/can3.svg';
import img3 from '../assets/img3.svg';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleAuth = () => {
    if (token) {
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar bg-transparent position-absolute w-100 d-flex justify-content-between px-4 py-3">
      <h5 className="m-0 fw-bold brand-name">FURNITUREAPP</h5>
      <div className="ms-auto d-flex gap-3">
        <Link to="/dashboard" className="fw-bold nav-link text-white">Dashboard</Link>
        <Link to="/explore" className="fw-bold nav-link text-white">Explore</Link>
        <button className="btn btn-light btn-sm" onClick={handleAuth}>
          {token ? 'Log Out' : 'Log In'}
        </button>
      </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section" style={{ backgroundImage: `url(${heroimg})` }}>
        <div className="overlay text-center text-white">
          <h1 className="display-4 fw-bold">Design Your<br />Dream Space</h1>
          <div className="mt-4 d-flex justify-content-center gap-3">
            <button className="btn btn-light px-4" onClick={() => navigate('/create-design')}>Start 2D</button>
            <button className="btn btn-warning px-4" onClick={() => navigate('/design3d')}>3D View</button>
          </div>
        </div>
      </header>

      {/* What You Can Do */}
      <section className="container py-5">
        <h2 className="text-center mb-4">What You Can Do</h2>
        <div className="row justify-content-center">
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src={can1} className="card-img-top" alt="Design Freely" />
              <div className="card-body text-center">
                <h5 className="card-title">Design Freely</h5>
                <p className="card-text">Create and customize layouts with drag-and-drop furniture.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src={can2} className="card-img-top" alt="Preview in 3D" />
              <div className="card-body text-center">
                <h5 className="card-title">Preview in 3D</h5>
                <p className="card-text">Rotate, scale, and view furniture in an immersive 3D space.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src={can3} className="card-img-top" alt="Share or Export" />
              <div className="card-body text-center">
                <h5 className="card-title">Share or Export</h5>
                <p className="card-text">Download your design as PDF or make it public to inspire others.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <h3 className="mb-4">How It Works</h3>
          <div className="row text-muted">
            <div className="col-md-3"><strong>1. Login</strong><br />Create a free account and get started.</div>
            <div className="col-md-3"><strong>2. Choose Mode</strong><br />Start in 2D or 3D depending on your preference.</div>
            <div className="col-md-3"><strong>3. Add Furniture</strong><br />Use our catalog of 2D & 3D furniture assets.</div>
            <div className="col-md-3"><strong>4. Save & Share</strong><br />Save to dashboard, download PDF, or share publicly.</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-5 cta-section">
        <div className="container d-flex flex-wrap align-items-center justify-content-between">
          <div className="text-content mb-4">
            <h2 className="fw-bold">Ready to Start Designing?</h2>
            <p className="text-muted">Jump into the editor and bring your ideas to life.</p>
            <button className="btn btn-warning px-4" onClick={() => navigate('/dashboard')}>
              Start Learning
            </button>
          </div>
          <div className="img-wrapper">
            <img src={img3} alt="Sofa Design" className="img-fluid rounded" style={{ maxWidth: '450px' }} />
          </div>
        </div>
      </section>

{/* Footer */}
<footer className="bg-dark text-white py-4 text-center">
  <div className="container">
    <p className="mb-2">
      <Link to="/about" className="text-warning text-decoration-none">
        About
      </Link>
    </p>
    <p className="mb-0">&copy; {new Date().getFullYear()} FurnitureApp. All rights reserved.</p>
  </div>
</footer>
    </div>
  );
};

export default Home;