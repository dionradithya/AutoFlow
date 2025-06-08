// KODE INI SUDAH TIDAK DIPAKAI LAGI, HANYA DISIMPAN UNTUK BERJAGA-JAGA SAJA (SUDAH DIGANTIKAN HOMEPAGE.JS)
// KODE INI SUDAH TIDAK DIPAKAI LAGI, HANYA DISIMPAN UNTUK BERJAGA-JAGA SAJA (SUDAH DIGANTIKAN HOMEPAGE.JS)
// KODE INI SUDAH TIDAK DIPAKAI LAGI, HANYA DISIMPAN UNTUK BERJAGA-JAGA SAJA (SUDAH DIGANTIKAN HOMEPAGE.JS)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars, deleteCar } from '../../services/api'; 
import { toast } from 'react-toastify';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); 

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await getCars();
        console.log('Cars:', response.data);
        setCars(response.data);
      } catch (error) {
        toast.error('Failed to fetch cars');
      }
    };
    fetchCars();
  }, []);

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(carId);
        setCars(cars.filter(car => car.mobil_id !== carId));
        toast.success('Car deleted successfully!');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete car');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Car List</h2>
      {isAuthenticated && ( 
        <div className="mb-3">
          <button className="btn btn-success" onClick={() => navigate('/cars/add')}>
            Add New Car
          </button>
        </div>
      )}
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
                  className="btn btn-primary me-2"
                  onClick={() => navigate(`/cars/${car.mobil_id}`)}
                >
                  View Details
                </button>
                {isAuthenticated && (
                  <>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => navigate(`/cars/edit/${car.mobil_id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(car.mobil_id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarList;