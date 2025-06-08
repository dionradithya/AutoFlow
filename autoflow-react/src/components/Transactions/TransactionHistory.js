import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // 1. Impor useNavigate
import { getTransactionHistory, getCarById } from "../../services/api";
import { toast } from "react-toastify";
import '../../pages/StandardPage.css';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [carDetails, setCarDetails] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // 2. Inisialisasi useNavigate

    // 3. useEffect untuk memastikan script Midtrans Snap dimuat
    useEffect(() => {
        const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        // Ambil client key dari environment variables Anda
        const clientKey = process.env.REACT_APP_MIDTRANS_CLIENT_KEY; 

        // Cek apakah script sudah ada sebelum menambahkannya lagi
        if (!document.querySelector(`script[src="${midtransScriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = midtransScriptUrl;
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            document.body.appendChild(script);

            // Cleanup script saat komponen di-unmount
            return () => {
                document.body.removeChild(script);
            };
        }
    }, []);


    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const historyResponse = await getTransactionHistory();
                const trans = historyResponse.data;
                setTransactions(trans);

                if (trans.length > 0) {
                    const uniqueCarIds = [...new Set(trans.map((tx) => tx.mobil_id))];
                    const carPromises = uniqueCarIds.map((id) => getCarById(id));
                    const carResponses = await Promise.all(carPromises);

                    const detailsMap = carResponses.reduce((acc, response) => {
                        const car = response.data;
                        if (car && car.mobil_id) {
                            acc[car.mobil_id] = car;
                        }
                        return acc;
                    }, {});
                    setCarDetails(detailsMap);
                }
            } catch (error) {
                toast.error("Failed to fetch transaction data.");
                console.error("Fetch Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // 4. Fungsi untuk mencoba kembali pembayaran
    const handleRetryPayment = (snapToken) => {
        if (!snapToken) {
            toast.error("Payment token is missing for this transaction.");
            return;
        }

        if (window.snap) {
            window.snap.pay(snapToken, {
                onSuccess: function(result) {
                    toast.success("Payment successful!");
                    // Reload halaman untuk melihat status terbaru
                    window.location.reload();
                },
                onPending: function(result) {
                    toast.info("Still waiting for your payment.");
                },
                onError: function(result) {
                    toast.error("Payment failed.");
                },
                onClose: function() {
                    toast.warn("You closed the popup without finishing the payment.");
                }
            });
        } else {
            toast.error("Payment gateway is not ready. Please wait a moment and try again.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case "success":
            case "settlement":
                return <span className="badge bg-success text-white">{status}</span>;
            case "pending":
                return <span className="badge bg-warning text-dark">{status}</span>;
            default:
                return <span className="badge bg-danger text-white">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading transaction history...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 className="page-title">Transaction History</h2>
            {transactions.length === 0 ? (
                <div className="profile-card text-center">
                    <p className="m-0">No transactions found.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="themed-table">
                        <thead>
                            <tr>
                                <th>Car Name</th>
                                <th>Brand</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => {
                                const car = carDetails[tx.mobil_id];
                                // 5. Cek apakah transaksi pending dan punya snap_token
                                const isPayable = tx.payment_status === 'pending' && tx.snap_token;
                                return (
                                    <tr 
                                        key={tx.id || tx.order_id} 
                                        className={isPayable ? 'clickable-row' : ''}
                                        onClick={() => isPayable && handleRetryPayment(tx.snap_token)}
                                    >
                                        <td>{car ? car.nama : "Loading..."}</td>
                                        <td>{car ? car.merk : "-"}</td>
                                        <td>Rp {new Intl.NumberFormat("id-ID").format(tx.amount)}</td>
                                        <td>{getStatusBadge(tx.payment_status)}</td>
                                        <td>{new Date(tx.created_at).toLocaleDateString("id-ID")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
