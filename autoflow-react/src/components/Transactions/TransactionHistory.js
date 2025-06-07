import React, { useState, useEffect } from "react";
import { getTransactionHistory, getCarById } from "../../services/api"; // Pastikan getCarById ada di api.js
import { toast } from "react-toastify";

const TransactionHistory = () => {
  // State untuk menyimpan daftar transaksi mentah dari API
  const [transactions, setTransactions] = useState([]);
  // State untuk menyimpan detail mobil yang sudah di-fetch ({ mobil_id: {nama, merk, ...} })
  const [carDetails, setCarDetails] = useState({});
  // State untuk menampilkan status loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Ambil riwayat transaksi
        const historyResponse = await getTransactionHistory();
        const trans = historyResponse.data;
        setTransactions(trans);

        // 2. Jika ada transaksi, ambil detail mobil untuk setiap transaksi
        if (trans.length > 0) {
          // Kumpulkan semua ID mobil yang unik untuk menghindari panggilan API ganda
          const uniqueCarIds = [...new Set(trans.map((tx) => tx.mobil_id))];

          // Buat array of promises untuk mengambil semua detail mobil secara bersamaan
          const carPromises = uniqueCarIds.map((id) => getCarById(id));
          
          // Tunggu semua panggilan API selesai
          const carResponses = await Promise.all(carPromises);

          // Ubah array hasil menjadi sebuah objek/map agar mudah diakses
          // Contoh: { '1': { mobil_id: 1, nama: 'Avanza', ... }, '2': { ... } }
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
        setIsLoading(false); // Sembunyikan loading setelah semua proses selesai
      }
    };

    fetchAllData();
  }, []); // Dependensi kosong agar useEffect hanya berjalan sekali saat komponen dimuat

  const getStatusBadge = (status) => {
    // ... (Fungsi ini sudah benar, tidak perlu diubah) ...
    switch (status.toLowerCase()) {
        case "success":
        case "settlement":
            return <span className="badge bg-success text-white">{status}</span>;
        case "pending":
            return <span className="badge bg-warning text-dark">{status}</span>;
        case "expired":
        case "failed":
        case "denied":
            return <span className="badge bg-danger text-white">{status}</span>;
        default:
            return <span className="badge bg-secondary text-white">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                <tr>
                    {/* Header tabel yang sudah diperbarui */}
                    <th>Car Name</th>
                    <th>Brand</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((tx) => {
                    // Ambil detail mobil untuk transaksi saat ini dari state carDetails
                    const car = carDetails[tx.mobil_id];
                    return (
                    <tr key={tx.id || tx.order_id}>
                        {/* Tampilkan Nama Mobil atau "Loading..." jika data belum siap */}
                        <td>{car ? car.nama : "Loading..."}</td>
                        {/* Tampilkan Merk Mobil atau "-" jika data belum siap */}
                        <td>{car ? car.merk : "-"}</td>
                        {/* Format angka agar lebih mudah dibaca */}
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
