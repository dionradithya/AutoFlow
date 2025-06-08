import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../services/api';
import { toast } from 'react-toastify';
import '../../pages/StandardPage.css'; // <-- Impor CSS bersama kita
import defaultAvatar from '../../assets/image/userprofileimage01.png'; // <-- 1. Impor gambar default

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setUser(response.data.user);
      } catch (error) {
        toast.error('Failed to fetch profile data. Please login.');
        navigate('/login');
      }
    };

    if (localStorage.getItem('token')) {
      fetchProfile();
    } else {
      toast.info('You need to be logged in to view your profile.');
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="loading-container container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  // Format tanggal untuk "Member Since"
  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long'
  });

  return (
    // 2. Gunakan struktur JSX baru yang sesuai dengan desain
    <div className="page-container">
        <h2 className="page-title">My Profile</h2>
        <div className="profile-wrapper">
            <div className="testimonial-profile-card">

                <div className="card-header-s">
                    <div className="profile-image-wrapper">
                        {/* Jika user punya foto, bisa diganti di sini. Jika tidak, pakai default. */}
                        <img src={user.photo || defaultAvatar} alt="User profile" className="profile-image" />
                    </div>
                </div>

                <div className="card-content-s">
                    <h3 className="user-name-s">{user.name.toUpperCase()}</h3>
                    <p className="user-track-s">Member Since {memberSince}</p>
                    <div className="divider-s"></div>
                    <p className="user-bio-s">
                        Welcome to Autoflow! Your registered email is <strong>{user.email}</strong>.
                    </p>
                </div>
                
            </div>
        </div>
    </div>
  );
};

export default Profile;