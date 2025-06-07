import React, { useState, useEffect } from "react";
import { getTransactionHistory } from "../../services/api";
import { toast } from "react-toastify";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getTransactionHistory();
        setTransactions(response.data);
      } catch (error) {
        toast.error("Failed to fetch transaction history");
      }
    };
    fetchTransactions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "success":
      case "settlement":
        return <span className="badge bg-success">{status}</span>;
      case "pending":
        return <span className="badge bg-warning text-dark">{status}</span>;
      case "expired":
      case "failed":
      case "denied":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container mt-5">
      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Car Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.order_id}</td>
                <td>{/* Nama Mobil, perlu fetch terpisah */}</td>
                <td>Rp {tx.amount.toLocaleString()}</td>
                <td>{getStatusBadge(tx.payment_status)}</td>{" "}
                {/* Tampilkan badge status */}
                <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistory;
