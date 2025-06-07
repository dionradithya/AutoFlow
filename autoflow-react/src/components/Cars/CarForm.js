import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCar, getCarById, updateCar } from '../../services/api';
import { toast } from 'react-toastify';

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
  const [existingImage, setExistingImage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchCar = async () => {
        try {
          const response = await getCarById(id);
          const carData = response.data;
          setFormData({
            nama: carData.nama || '',
            merk: carData.merk || '',
            amount: carData.amount || '',
            deskripsi: carData.deskripsi || '',
            gambar: null,
          });
          setExistingImage(carData.gambar);
        } catch (error) {
          toast.error('Failed to load car data for editing.');
          navigate('/cars');
        }
      };
      fetchCar();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, gambar: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateCar(id, formData);
        toast.success('Car updated successfully!');
      } else {
        await createCar(formData);
        toast.success('Car added successfully!');
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving car:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to save car');
    }
  };

  return (
    <div className="container mt-5">
      <h2>{isEditMode ? 'Edit Car' : 'Add New Car'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nama Mobil</label>
          <input
            type="text"
            name="nama"
            className="form-control"
            value={formData.nama}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Merk</label>
          <input
            type="text"
            name="merk"
            className="form-control"
            value={formData.merk}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Harga (Amount)</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Deskripsi</label>
          <textarea
            name="deskripsi"
            className="form-control"
            value={formData.deskripsi}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Gambar Mobil</label>
          <input
            type="file"
            name="gambar"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
          />
          {isEditMode && existingImage && (
            <p className="mt-2">
              Current image: <a href={existingImage.startsWith('http') ? existingImage : `http://localhost:8002/storage/${existingImage}`} target="_blank" rel="noopener noreferrer">View</a>
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          {isEditMode ? 'Update Car' : 'Add Car'}
        </button>
      </form>
    </div>
  );
};

export default CarForm;