"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Booking {
  id: string;
  vehicleType: string;
  paymentStatus: string;
  paymentAmount: number;
  bookedAt: string;
}

const UserDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/slots/user-bookings/${userId}`
        );
        setBookings(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings.");
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="text-xl text-black font-bold mb-4">Your Bookings</h3>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li key={booking.id} className="p-4 text-black border rounded shadow">
            <p>Slot ID: {booking.id}</p>
            <p>Vehicle Type: {booking.vehicleType}</p>
            <p>Payment Status: {booking.paymentStatus}</p>
            <p>Payment Amount: ₹{booking.paymentAmount}</p>
            <p>Booked At: {new Date(booking.bookedAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
