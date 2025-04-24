import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/About.css';
import bgImage from '../assets/heroimg.svg';

const About = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us!");
    setForm({ name: '', email: '', message: '' });
  };

  const handleAuth = () => {
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      className="about-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
      }}
    >

      <nav className="navbar bg-transparent position-absolute w-100 d-flex justify-content-between px-4 py-3">
        <h5 className="m-0 fw-bold brand-name text-white">FURNITUREAPP</h5>
        <div>
          <Link to="/" className="btn btn-outline-light btn-sm me-2">Home</Link>
          <button className="btn btn-light btn-sm" onClick={handleAuth}>
            {token ? 'Log Out' : 'Log In'}
          </button>
        </div>
      </nav>

      {/* About Content */}
      <div className="container bg-dark bg-opacity-75 text-white p-5 mt-5 rounded">
        <br />
        <h1 className="text-center mb-4 fw-bold">About FurnitureApp</h1>
        <p className="lead text-center mb-5 text-light">
          FurnitureApp helps you design your dream room in 2D and 3D with real-time previews and intuitive tools. Perfect for designers, decorators, and hobbyists.
        </p>

        <div className="row g-4">
          <div className="col-md-4 text-center">
            <i className="bi bi-vector-pen fs-1 text-primary mb-3"></i>
            <h5>Design with Ease</h5>
            <p>Create layouts using drag-and-drop tools in 2D or immersive 3D environments.</p>
          </div>
          <div className="col-md-4 text-center">
            <i className="bi bi-eye fs-1 text-success mb-3"></i>
            <h5>Realistic Previews</h5>
            <p>Visualize spaces in 3D and adjust positions, lighting, and angles in real time.</p>
          </div>
          <div className="col-md-4 text-center">
            <i className="bi bi-share fs-1 text-warning mb-3"></i>
            <h5>Export & Share</h5>
            <p>Download designs, export PDFs, or publish them for the community to view.</p>
          </div>
        </div>

        <hr className="my-5 border-light" />

        {/* Contact Form Section */}
        <div className="contact-section text-center mt-5">
          <h3 className="mb-4 fw-bold">Get in Touch</h3>
          <p className="text-light mb-4">Have questions or feedback? We'd love to hear from you.</p>

          <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '600px' }}>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold text-light">Your Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold text-light">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label fw-semibold text-light">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="form-control"
                rows="4"
                placeholder="Tell us what's on your mind..."
                required
              />
            </div>
            <button type="submit" className="btn btn-warning px-4 fw-bold">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default About;