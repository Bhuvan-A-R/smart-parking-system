"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface ParkingHistory {
  slotId: string;
  amount: number;
  duration: number;
  paidAt: string;
}

const PastParking: React.FC<{ userId: string }> = ({ userId }) => {
  const [history, setHistory] = useState<ParkingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/slots/history/${userId}`
        );
        setHistory(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load history.");
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) return <p>Loading history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="text-xl text-black font-bold mb-4">Past Parking History</h3>
      <ul className="space-y-4">
        {history.map((entry, index) => (
          <li key={index} className="p-4 text-black border rounded shadow">
            <p>Slot ID: {entry.slotId}</p>
            <p>Amount Paid: ₹{entry.amount}</p>
            <p>Duration: {entry.duration} hours</p>
            <p>Paid At: {new Date(entry.paidAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PastParking;
