import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5050/api/auth/register', { email, password, role });
      Swal.fire('Registered Successfully!', '', 'success');
      navigate('/login');
    } catch (err) {
      Swal.fire('Registration Failed', err.response?.data?.msg || 'Server error', 'error');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input className="form-control mb-2" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="form-control mb-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <select className="form-control mb-3" onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-success w-100" type="submit">Register</button>
        <p className="mt-3 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;