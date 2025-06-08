import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Komponen Halaman
import Navbar from './components/Layout/Navbar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Profile from './components/Auth/Profile';
import HomePage from './pages/HomePage';
import CarDetail from './components/Cars/CarDetail';
import CarForm from './components/Cars/CarForm';
import TransactionHistory from './components/Transactions/TransactionHistory';

// 1. Impor komponen penjaga kita
import ProtectedRoute from './components/Auth/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* == RUTE PUBLIK == */}
        {/* Rute-rute ini bisa diakses siapa saja, bahkan yang belum login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* == RUTE TERLINDUNGI == */}
        {/* Semua rute di dalam sini akan dijaga oleh ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/cars/add" element={<CarForm />} />
          <Route path="/cars/edit/:id" element={<CarForm />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          {/* Tambahkan rute lain yang perlu dilindungi di sini */}
        </Route>
        
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;