import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // 1. Cek apakah ada token di localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  // 2. Jika ada token (sudah login), izinkan akses ke halaman tujuan.
  //    <Outlet /> adalah "gerbang" menuju komponen halaman (misal: HomePage, Profile)
  // 3. Jika tidak ada token, "lempar" pengguna ke halaman /login.
  //    'replace' digunakan agar pengguna tidak bisa menekan tombol "back" di browser untuk kembali ke halaman terproteksi.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;