import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCarById, createCar, updateCar } from '../../services/api'; 
import { toast } from 'react-toastify';
import '../../pages/StandardPage.css';

const CarForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama: '',
        merk: '',
        amount: '',
        deskripsi: '',
        gambar: null,
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchCar = async () => {
                try {
                    const response = await getCarById(id);
                    const carData = response.data;
                    setFormData({
                        nama: carData.nama,
                        merk: carData.merk,
                        amount: carData.amount,
                        deskripsi: carData.deskripsi,
                        gambar: null,
                    });
                    setPreview(carData.gambar.startsWith('http') ? carData.gambar : `http://localhost:8002/storage/${carData.gambar}`);
                } catch (error) {
                    toast.error('Failed to fetch car data for editing.');
                    navigate('/');
                }
            };
            fetchCar();
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, gambar: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // ===================================================================
        // === PERUBAHAN UTAMA: MENGIRIM OBJEK BIASA, BUKAN FORMDATA =========
        // ===================================================================
        // Sekarang kita hanya mengirim objek state 'formData' secara langsung.
        // Biarkan fungsi di 'api.js' yang mengurus konversi ke FormData.
        try {
            if (id) {
                // Mode Edit: Kirim objek state 'formData'
                await updateCar(id, formData);
                toast.success('Car updated successfully!');
            } else {
                // Mode Add: Kirim objek state 'formData'
                await createCar(formData); 
                toast.success('Car added successfully!');
            }
            navigate('/');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                const validationErrors = error.response.data.errors;
                for (const key in validationErrors) {
                    toast.error(validationErrors[key][0]); 
                }
            } else {
                toast.error(error.response?.data?.message || 'An error occurred. Please check the console.');
                console.error("Submit Error:", error.response || error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">{id ? 'Edit Car' : 'Add New Car'}</h2>
            <div className="profile-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label">Nama Mobil</label>
                        <input type="text" name="nama" className="form-control form-control-lg" value={formData.nama} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Merk</label>
                        <input type="text" name="merk" className="form-control form-control-lg" value={formData.merk} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Harga (Amount)</label>
                        <input type="number" name="amount" className="form-control form-control-lg" value={formData.amount} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Deskripsi</label>
                        <textarea 
                            name="deskripsi" 
                            className="form-control form-control-lg" 
                            rows="4" 
                            value={formData.deskripsi} 
                            onChange={handleChange} 
                            required 
                            maxLength="750"
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#b0a8a4', marginTop: '5px' }}>
                            {formData.deskripsi.length} / 750
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Gambar Mobil</label>
                        <input type="file" name="gambar" className="form-control" onChange={handleFileChange} />
                        {preview && <img src={preview} alt="Preview" style={{ width: '200px', marginTop: '15px', borderRadius: '8px' }} />}
                    </div>
                    <div className="form-buttons-container mt-4">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => navigate(-1)} 
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Menyimpan...' : (id ? 'Update Mobil' : 'Tambah Mobil')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CarForm;
