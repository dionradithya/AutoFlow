import React, { useEffect } from 'react';
import { buyCar } from '../../services/api';
import { toast } from 'react-toastify';

const PaymentPopup = ({ car, onClose }) => {
  useEffect(() => {
    // Load Midtrans Snap.js
    const snapScript = document.createElement('script');
    snapScript.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    snapScript.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY);
    snapScript.async = true;
    snapScript.onload = () => console.log('Snap.js loaded');
    snapScript.onerror = () => console.error('Failed to load Snap.js');
    document.body.appendChild(snapScript);

    const initiatePayment = async () => {
      try {
        const response = await buyCar({
          mobil_id: car.id,
          amount: car.amount,
        });
        console.log('Buy car response:', response.data);
        const { snap_token } = response.data; // Use snap_token instead of token
        if (!snap_token) {
          throw new Error('No Snap token received');
        }
        if (!window.snap) {
          throw new Error('Snap.js not available');
        }
        window.snap.pay(snap_token, {
          onSuccess: () => {
            toast.success('Payment successful!');
            onClose();
          },
          onPending: () => {
            toast.info('Payment pending. Please complete the payment.');
            onClose();
          },
          onError: () => {
            toast.error('Payment failed.');
            onClose();
          },
          onClose: () => {
            toast.info('Payment popup closed.');
            onClose();
          },
        });
      } catch (error) {
        console.error('Payment error:', {
          message: error.message,
          response: error.response,
        });
        toast.error(error.response?.data?.error || error.message || 'Failed to initiate payment');
        onClose();
      }
    };

    initiatePayment();

    return () => {
      if (snapScript.parentNode) {
        snapScript.parentNode.removeChild(snapScript);
      }
    };
  }, [car, onClose]);

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Processing Payment for {car.nama}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>Loading payment gateway...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;