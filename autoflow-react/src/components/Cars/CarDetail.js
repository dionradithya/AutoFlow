import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../../services/api';
import { toast } from 'react-toastify';
import PaymentPopup from '../Payment/PaymentPopup'; // 1. Impor PaymentPopup
import '../../pages/StandardPage.css'; // Impor CSS bersama untuk layout

const CarDetail = () => {
    const { id } = useParams();
    const [car, setCar] = useState(null);
    const [showPayment, setShowPayment] = useState(false); // 2. Tambahkan state untuk popup
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('token'); // Cek status login

    useEffect(() => {
        const fetchCar = async () => {
            if (!id || id === 'undefined') {
                toast.error('Invalid car ID');
                navigate('/');
                return;
            }
            try {
                const response = await getCarById(id);
                setCar(response.data);
            } catch (error) {
                console.error('Error fetching car:', error);
                toast.error(error.response?.data?.error || 'Failed to fetch car details');
                navigate('/');
            }
        };
        fetchCar();
    }, [id, navigate]);

    if (!car) {
        return (
            <div className="loading-container container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-container">
                <div className="car-detail-layout">
                    <div className="car-detail-image-wrapper">
                        <img src={car.gambar.startsWith('http') ? car.gambar : `http://localhost:8002/storage/${car.gambar}`} alt={car.nama} />
                    </div>
                    <div className="car-detail-info">
                        <h2 className="page-title" style={{textAlign: 'left', marginBottom: '1rem'}}>{car.nama}</h2>
                        <h3>Merk: {car.merk}</h3>
                        <p className="price">Price: Rp {car.amount.toLocaleString('id-ID')}</p>
                        <p className="description"><strong>Description:</strong> {car.deskripsi || 'No description available.'}</p>
                        
                        {/* 3. Tombol Buy Now yang memanggil popup */}
                        <button 
                            className="btn btn-primary mt-3" 
                            onClick={() => setShowPayment(true)}
                            disabled={!isAuthenticated} // Tombol nonaktif jika belum login
                        >
                            Buy Now
                        </button>
                        
                        {/* Pesan jika pengguna belum login */}
                        {!isAuthenticated && (
                            <p className="text-danger mt-2" style={{color: '#ff6b6b'}}>
                                Please login to make a purchase
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Logika untuk menampilkan PaymentPopup */}
            {showPayment && (
                <PaymentPopup
                    car={{ ...car, id: car.mobil_id }}
                    onClose={() => setShowPayment(false)}
                />
            )}
        </>
    );
};

export default CarDetail;
