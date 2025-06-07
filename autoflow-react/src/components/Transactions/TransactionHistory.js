import React, { useState, useEffect } from 'react';
import { getTransactionHistory } from '../../services/api';
import { toast } from 'react-toastify';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getTransactionHistory();
        setTransactions(response.data);
      } catch (error) {
        toast.error('Failed to fetch transaction history');
      }
    };
    fetchTransactions();
  }, []);

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
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.car?.nama || 'Unknown'}</td>
                <td>Rp {transaction.amount}</td>
                <td>{transaction.status}</td>
                <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionHistory;