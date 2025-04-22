import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/Auth.css';
import heroBg from '../assets/heroimg.svg'; // ✅ import image properly

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5050/api/auth/login', { email, password });

      localStorage.setItem('token', res.data.token);

      const profileRes = await axios.get('http://localhost:5050/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });

      localStorage.setItem('user', JSON.stringify(profileRes.data));
      Swal.fire('Login Successful!', '', 'success');
      navigate('/dashboard');
    } catch (err) {
      Swal.fire('Login Failed', err.response?.data?.msg || 'Server error', 'error');
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
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-2"
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="mt-3 text-center text-dark">
            New user? <Link to="/register" className="text-primary">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;