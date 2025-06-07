import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Layout/Navbar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import CarList from './components/Cars/CarList';
import CarDetail from './components/Cars/CarDetail';
import TransactionHistory from './components/Transactions/TransactionHistory';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<CarList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/transactions" element={<TransactionHistory />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App