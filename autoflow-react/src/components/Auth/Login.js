import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import { toast } from 'react-toastify';
import './Login.css'; // <-- 1. Impor file CSS

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response,
      });
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    // 2. Gunakan div dengan class dari file CSS
    <div className="login-container"> 
      <div className="login-form-wrapper"> {/* 3. Wrapper untuk form */}
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100"> {/* Dibuat full-width */}
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;