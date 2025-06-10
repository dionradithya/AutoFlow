import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
import { toast } from 'react-toastify';
import '../../pages/StandardPage.css'; // <-- 1. Impor CSS bersama


const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      // --- PERUBAHAN UTAMA DI SINI ---
      // Cek jika ada response error dan body-nya (data)
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // Cek jika errorData adalah objek (bukan string atau null)
        if (typeof errorData === 'object' && errorData !== null) {
          // Loop melalui setiap key di dalam objek error (misal: "email", "password")
          for (const key in errorData) {
            // Pastikan value-nya adalah array dan tidak kosong
            if (Array.isArray(errorData[key]) && errorData[key].length > 0) {
              // Tampilkan pesan error pertama untuk key tersebut
              toast.error(errorData[key][0]);
            }
          }
        } else {
          // Fallback jika response.data bukan objek (misal: hanya string "Unauthorized")
          toast.error(errorData.message || 'An unknown error occurred.');
        }
      } else {
        // Fallback untuk error jaringan atau error tak terduga lainnya
        toast.error('Registration failed. Please try again.');
      }
      // --- AKHIR PERUBAHAN ---
    }
  };

  return (
    // 2. Gunakan 'page-container' sebagai pembungkus utama
    <div className="page-container register-background">
      <h2 className="page-title">Create Your Account</h2>
      
      {/* 3. Bungkus form dengan 'profile-card' agar senada dengan halaman Profile */}
      <div className="profile-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4"> {/* Beri jarak lebih antar input */}
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control form-control-lg" /* Form control lebih besar */
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-lg"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control form-control-lg"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-3">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;