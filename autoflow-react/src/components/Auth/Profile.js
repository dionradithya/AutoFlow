import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../services/api';
import { toast } from 'react-toastify';

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

    // Check if token exists before fetching profile
    if (localStorage.getItem('token')) {
      fetchProfile();
    } else {
      toast.info('You need to be logged in to view your profile.');
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="container mt-5">
      <h2>User Profile</h2>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{user.name}</h5>
          <p className="card-text"><strong>Email:</strong> {user.email}</p>
          <p className="card-text"><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;