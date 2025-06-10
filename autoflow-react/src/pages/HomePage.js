import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCars, deleteCar } from '../services/api';
import { toast } from 'react-toastify';
import CarSlider from '../components/Cars/CarSlider'; // Impor komponen slider
import './HomePage.css'; // Impor CSS baru kita

const HomePage = () => {
  const [topCars, setTopCars] = useState([]);
  const [otherCars, setOtherCars] = useState([]);
  const [allCars, setAllCars] = useState([]); // Simpan semua mobil untuk fungsi delete
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); 

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await getCars();
        const carsData = response.data;
        setAllCars(carsData);

        // Logika untuk memisahkan mobil
        // 1. Urutkan berdasarkan harga (termahal dulu)
        // 2. Jika harga sama, urutkan berdasarkan ID (terbaru dulu)
        const sortedCars = [...carsData].sort((a, b) => {
          if (b.amount !== a.amount) {
            return b.amount - a.amount;
          }
          return b.mobil_id - a.mobil_id; // Asumsi ID lebih tinggi = lebih baru
        });

        // Ambil 3 mobil teratas untuk slider
        setTopCars(sortedCars.slice(0, 3));
        // Ambil sisanya untuk galeri
        setOtherCars(sortedCars); // Tampilkan semua di bawah, termasuk top 3

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
        // Hapus mobil dari state dan biarkan useEffect mengatur ulang
        const updatedCars = allCars.filter(car => car.mobil_id !== carId);
        setAllCars(updatedCars);

        const sortedCars = [...updatedCars].sort((a, b) => (b.amount - a.amount) || (b.mobil_id - a.mobil_id));
        setTopCars(sortedCars.slice(0, 3));
        setOtherCars(sortedCars);

        toast.success('Car deleted successfully!');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete car');
      }
    }
  };

  return (
    <div className="homepage-container">
      {/* Bagian Slider */}
      <CarSlider topCars={topCars} />

      {/* Bagian Judul Penawaran */}
      <div className="offers-title-container">
        <h2 className="offers-title">Exclusive Offers !!</h2>
      </div>
      
      {/* Tombol Add New Car (jika login) */}
      {isAuthenticated && ( 
        <div className="add-car-container">
          <button className="btn btn-success" onClick={() => navigate('/cars/add')}>
            Add New Car
          </button>
        </div>
      )}

      <div className="offers-panel">
        {/* Galeri Mobil */}
        <div className="car-grid-container container">
            <div className="row">
            {otherCars.map((car) => (
                <div key={car.mobil_id} className="col-lg-4 col-md-6 mb-4">
                <div className="car-card">
                    <img
                    src={car.gambar.startsWith('http') ? car.gambar : `http://localhost:8002/storage/${car.gambar}`}
                    className="card-img-top"
                    alt={car.nama}
                    onClick={() => navigate(`/cars/${car.mobil_id}`)}
                    />
                    <div className="card-body">
                    <h5 className="card-title">{car.nama}</h5>
                    <p className="card-text">Merk: {car.merk}</p>
                    <p className="card-text">Harga: Rp {car.amount.toLocaleString('id-ID')}</p>
                    {isAuthenticated && (
                        <div className="action-buttons mt-3">
                        <button className="btn btn-warning me-2" onClick={() => navigate(`/cars/edit/${car.mobil_id}`)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(car.mobil_id)}>Delete</button>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;