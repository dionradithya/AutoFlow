// src/components/Payment/PaymentPopup.js

import React, { useEffect, useRef } from 'react'; // Impor useRef
import { buyCar } from '../../services/api';
import { toast } from 'react-toastify';

const PaymentPopup = ({ car, onClose }) => {
  // --- TAMBAHKAN REF INI ---
  const paymentInitiated = useRef(false);

  useEffect(() => {
    // ... (logika load script Midtrans tetap sama) ...
    const snapScript = document.createElement('script');
    snapScript.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    snapScript.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY);
    snapScript.async = true;
    document.body.appendChild(snapScript);

    const initiatePayment = async () => {
      // ... (logika initiatePayment Anda tetap sama) ...
      try {
        const response = await buyCar({ mobil_id: car.id, amount: car.amount });
        const { snap_token } = response.data;
        if (!snap_token) throw new Error('No Snap token received');
        
        // Pastikan window.snap sudah tersedia sebelum digunakan
        const snap = window.snap;
        if (!snap) throw new Error('Snap.js not available');

        snap.pay(snap_token, {
          onSuccess: () => { toast.success('Payment successful!'); onClose(); },
          onPending: () => { toast.info('Payment pending.'); onClose(); },
          onError: () => { toast.error('Payment failed.'); onClose(); },
          onClose: () => { toast.info('Payment popup closed.'); onClose(); },
        });
      } catch (error) {
        toast.error(error.response?.data?.error || error.message || 'Failed to initiate payment');
        onClose();
      }
    };

    // --- TAMBAHKAN KONDISI INI ---
    // Cek apakah Snap.js sudah termuat dan pembayaran belum diinisiasi
    const checkSnapAndPay = () => {
      if (window.snap && !paymentInitiated.current) {
        paymentInitiated.current = true; // Tandai bahwa pembayaran telah diinisiasi
        initiatePayment();
      } else if (!paymentInitiated.current) {
        // Jika Snap belum ada, coba lagi setelah beberapa saat
        setTimeout(checkSnapAndPay, 100);
      }
    };
    
    checkSnapAndPay();

    return () => {
      if (snapScript.parentNode) {
        snapScript.parentNode.removeChild(snapScript);
      }
    };
    // Menggunakan dependency yang lebih stabil
  }, [car.id, car.amount, onClose]);

  return (
    // ... (JSX Anda tetap sama) ...
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      {/* ... */}
    </div>
  );
};

export default PaymentPopup;