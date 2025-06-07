import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../../services/api';
import { toast } from 'react-toastify';
import PaymentPopup from '../Payment/PaymentPopup';

const CarDetail = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      if (!id || id === 'undefined') {
        toast.error('Invalid car ID');
        navigate('/');
        return;
      }
      try {
        const response = await getCarById(id);
        console.log('Car data:', response.data); // Log to verify data
        setCar(response.data);
      } catch (error) {
        console.error('Error fetching car:', {
          message: error.message,
          response: error.response,
          request: error.request,
        });
        toast.error(error.response?.data?.error || 'Failed to fetch car details');
        navigate('/');
      }
    };
    fetchCar();
  }, [id, navigate]);

  if (!car) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <h2>{car.nama}</h2>
      <div className="row">
        <div className="col-md-6">
          {car.gambar ? (
            <img
              src={car.gambar.startsWith('http') ? car.gambar : `http://localhost:8002/storage/${car.gambar}`}
              className="img-fluid"
              alt={car.nama}
            />
          ) : (
            <img
              src="https://via.placeholder.com/300x200?text=No+Image"
              className="img-fluid"
              alt="No Image"
            />
          )}
        </div>
        <div className="col-md-6">
          <p><strong>Merk:</strong> {car.merk}</p>
          <p><strong>Price:</strong> Rp {car.amount.toLocaleString()}</p>
          <p><strong>Description:</strong> {car.deskripsi || 'No description'}</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowPayment(true)}
            disabled={!localStorage.getItem('token')}
          >
            Buy Now
          </button>
          {!localStorage.getItem('token') && (
            <p className="text-danger mt-2">Please login to make a purchase</p>
          )}
        </div>
      </div>
      {showPayment && (
        <PaymentPopup
          car={{ ...car, id: car.mobil_id }} // Pass mobil_id as id for PaymentPopup
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};

export default CarDetail;