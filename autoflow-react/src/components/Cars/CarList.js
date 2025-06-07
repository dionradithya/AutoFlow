import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars } from '../../services/api';
import { toast } from 'react-toastify';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await getCars();
        console.log('Cars:', response.data); // Log to verify data
        setCars(response.data);
      } catch (error) {
        toast.error('Failed to fetch cars');
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Car List</h2>
      <div className="row">
        {cars.map((car) => (
          <div key={car.mobil_id} className="col-md-4 mb-3">
            <div className="card">
              {car.gambar ? (
                <img
                  src={car.gambar.startsWith('http') ? car.gambar : `http://localhost:8002/storage/${car.gambar}`}
                  className="card-img-top"
                  alt={car.nama}
                />
              ) : (
                <img
                  src="https://via.placeholder.com/300x200?text=No+Image"
                  className="card-img-top"
                  alt="No Image"
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{car.nama}</h5>
                <p className="card-text">Merk: {car.merk}</p>
                <p className="card-text">Price: Rp {car.amount.toLocaleString()}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/cars/${car.mobil_id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarList;