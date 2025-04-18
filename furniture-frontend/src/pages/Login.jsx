import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5050/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      Swal.fire('Login Successful!', '', 'success');
      navigate('/dashboard');
    } catch (err) {
      Swal.fire('Login Failed', err.response?.data?.msg || 'Server error', 'error');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input className="form-control mb-2" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="form-control mb-3" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary w-100" type="submit">Login</button>
        <p className="mt-3 text-center">
          New user? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;