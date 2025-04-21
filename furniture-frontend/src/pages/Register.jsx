import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/Auth.css'; 
import heroBg from '../assets/heroimg.svg'; 

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5050/api/auth/register', {
        email,
        password,
        role,
      });

      Swal.fire('Registered Successfully!', '', 'success');
      navigate('/login');
    } catch (err) {
      Swal.fire('Registration Failed', err.response?.data?.msg || 'Server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="auth-box">
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleRegister}>
          <input
            className="form-control mb-2"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-control mb-2"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className="form-control mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="btn btn-success w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="mt-3 text-center text-dark">
            Already have an account?{' '}
            <Link to="/login" className="text-primary">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;