"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

interface Slot {
  id: string;
  status: "free" | "occupied";
  vehicleType: string;
  userId: { name: string; email: string } | null;
  bookedAt?: string;
  paymentStatus?: "pending" | "approved";
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const SlotGrid: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [showAssignPopover, setShowAssignPopover] = useState(false);
  const [showPaymentPopover, setShowPaymentPopover] = useState(false);
  const [showBookPopover, setShowBookPopover] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [totalSlots, setTotalSlots] = useState<number>(0);
  const [vehicleType, setVehicleType] = useState<string>("bike");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  useEffect(() => {
    const fetchSlotsAndUsers = async () => {
      try {
        const slotsRes = await axios.get(`${API_BASE_URL}/api/slots`);
        const usersRes = await axios.get(`${API_BASE_URL}/api/users`);
        setSlots(slotsRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
        setLoading(false);
      }
    };

    fetchSlotsAndUsers();

    // Connect to the Socket.IO server
    const socket = io(API_BASE_URL);

    // Listen for slot updates
    socket.on("slotUpdated", (updatedSlot: Slot) => {
      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === updatedSlot.id ? updatedSlot : slot
        )
      );
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [API_BASE_URL]);

  const handleAssignSlot = async () => {
    if (!selectedSlot || !selectedUser) return;

    try {
      await axios.post(`${API_BASE_URL}/api/slots/assign/${selectedSlot}`, {
        userId: selectedUser,
      });
      showNotification("Slot assigned successfully!", "success");
      setSelectedSlot(null);
      setSelectedUser(null);
      setShowAssignPopover(false);

      // Refresh slots
      const res = await axios.get(`${API_BASE_URL}/api/slots`);
      setSlots(res.data);
    } catch (err) {
      console.error("Error assigning slot:", err);
      showNotification("Failed to assign slot.", "error");
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    try {
      const userId = "currentUserId"; // Replace with the logged-in user's ID
      await axios.post(`${API_BASE_URL}/api/slots/book/${selectedSlot}`, {
        userId,
      });
      showNotification("Slot booked successfully!", "success");
      setSelectedSlot(null);
      setShowBookPopover(false);

      // Refresh slots
      const res = await axios.get(`${API_BASE_URL}/api/slots`);
      setSlots(res.data);
    } catch (err: any) {
      console.error("Error booking slot:", err.response?.data || err.message);
      showNotification("Failed to book slot.", "error");
    }
  };

  const handleFreeSlot = async (slotId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/slots/free/${slotId}`);
      showNotification("Slot freed successfully!", "success");
      // Refresh slots
      const res = await axios.get(`${API_BASE_URL}/api/slots`);
      setSlots(res.data);
    } catch (err) {
      console.error("Error freeing slot:", err);
      showNotification("Failed to free slot.", "error");
    }
  };

  const handleLeavingSlot = async (slotId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/slots/leaving/${slotId}`);
      showNotification("Redirecting to payment page...", "success");

      // Redirect to payment page
      router.push(`/payment/${slotId}`);
    } catch (err) {
      console.error("Error marking slot as leaving:", err);
      showNotification("Failed to mark slot as leaving.", "error");
    }
  };

  const handleApprovePayment = async (slotId: string) => {
    if (!paymentMethod) {
      showNotification("Please select a payment method.", "error");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/slots/approve-payment/${slotId}`,
        {
          paymentMethod,
        }
      );
      const { amount, duration } = res.data;

      showNotification(
        `Payment approved! Amount: ₹${amount} for ${duration} hours.`,
        "success"
      );
      setPaymentMethod(null);
      setShowPaymentPopover(false);

      // Refresh slots
      const slotsRes = await axios.get(`${API_BASE_URL}/api/slots`);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error("Error approving payment:", err);
      showNotification("Failed to approve payment.", "error");
    }
  };

  const handleAssignSlots = async () => {
    try {
      const prefix = vehicleType === "bike" ? "B" : "C";
      const slots = Array.from({ length: totalSlots }, (_, i) => ({
        id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
        vehicleType,
        status: "free",
      }));

      await axios.post(`${API_BASE_URL}/api/slots/assign`, { slots });
      showNotification("Slots assigned successfully!", "success");
      // Refresh slots
      const res = await axios.get(`${API_BASE_URL}/api/slots`);
      setSlots(res.data);
    } catch (err) {
      console.error("Error assigning slots:", err);
      showNotification("Failed to assign slots.", "error");
    }
  };

  const handleClearSlots = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/slots/clear`);
      showNotification("All slots cleared successfully!", "success");
      setSlots([]);
    } catch (err) {
      console.error("Error clearing slots:", err);
      showNotification("Failed to clear slots.", "error");
    }
  };

  const handlePayForSlot = async (slotId: string) => {
    try {
      const userId = "currentUserId"; // Replace with the logged-in user's ID
      const res = await axios.post(`${API_BASE_URL}/api/slots/pay/${slotId}`, {
        userId,
      });
      const { amount, duration } = res.data;

      showNotification(
        `Payment successful! Amount: ₹${amount} for ${duration} hours.`,
        "success"
      );

      // Refresh slots
      const slotsRes = await axios.get(`${API_BASE_URL}/api/slots`);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error("Error processing payment:", err);
      showNotification("Failed to process payment.", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-hide after 3 seconds
  };

  if (loading) return <p>Loading slots...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {slots.map((slot) => {
          const isAssigned = slot.userId !== null;
          const isBooked = slot.status === "occupied";
          const isPaymentPending = slot.paymentStatus === "pending";
          const isPaymentApproved = slot.paymentStatus === "approved";

          return (
            <div
              key={slot.id}
              className={`p-4 rounded shadow text-center ${
                slot.status === "free" ? "bg-green-500" : "bg-red-500"
              } text-black`}
            >
              <p>Slot {slot.id}</p>
              <p>{slot.vehicleType}</p>
              <p>
                {slot.status === "free"
                  ? "Free"
                  : `Booked by ${slot.userId?.name || "Admin"}`}
              </p>

              {/* Admin Actions */}
              {userRole === "admin" && !isAssigned && (
                <button
                  onClick={() => {
                    setSelectedSlot(slot.id);
                    setShowAssignPopover(true);
                  }}
                  className="bg-blue-500 px-2 py-1 rounded mt-2 text-white"
                >
                  Assign Slot
                </button>
              )}

              {userRole === "admin" && isAssigned && !isBooked && (
                <button
                  onClick={() => {
                    setSelectedSlot(slot.id);
                    setShowBookPopover(true);
                  }}
                  className="bg-purple-500 px-2 py-1 rounded mt-2 text-white"
                >
                  Book Slot
                </button>
              )}

              {userRole === "admin" && isBooked && isPaymentPending && (
                <button
                  onClick={() => {
                    setSelectedSlot(slot.id);
                    setShowPaymentPopover(true);
                  }}
                  className="bg-yellow-500 px-2 py-1 rounded mt-2 text-white"
                >
                  Approve Payment
                </button>
              )}

              {userRole === "admin" && isPaymentApproved && (
                <button
                  onClick={() => {
                    setSelectedSlot(slot.id);
                    setShowPaymentPopover(true); // Show payment popover again
                  }}
                  className="bg-yellow-500 px-2 py-1 rounded mt-2 text-white"
                >
                  Approve Payment Again
                </button>
              )}

              {/* User Actions */}
              {userRole === "user" && slot.status === "free" && (
                <button
                  onClick={() => {
                    setSelectedSlot(slot.id);
                    setShowBookPopover(true);
                  }}
                  className="bg-green-500 px-2 py-1 rounded mt-2 text-white"
                >
                  Book Slot
                </button>
              )}

              {userRole === "user" && isBooked && isPaymentPending && (
                <button
                  onClick={() => {
                    setSelectedSlot(slot.id);
                    setShowPaymentPopover(true);
                  }}
                  className="bg-yellow-500 px-2 py-1 rounded mt-2 text-white"
                >
                  Pay Now
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Popover for User Selection */}
      {showPopover && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-black">
              Booking Slot {selectedSlot}
            </h3>
            <select
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 rounded w-full mb-4 text-black"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPopover(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSlot}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Slot Popover */}
      {showAssignPopover && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-black">
              Assign Slot {selectedSlot}
            </h3>
            <select
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 rounded w-full mb-4 text-black"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAssignPopover(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSlot}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Slot Popover */}
      {showBookPopover && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-black">
              Book Slot {selectedSlot}
            </h3>
            <p className="text-black mb-6">
              Are you sure you want to book this slot for yourself?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowBookPopover(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSlot}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popover */}
      {showPaymentPopover && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-black">
              Approve Payment for Slot {selectedSlot}
            </h3>
            <select
              value={paymentMethod || ""}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border p-2 rounded w-full mb-4 text-black"
            >
              <option value="">Select Payment Method</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPaymentPopover(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprovePayment(selectedSlot!)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {userRole === "admin" && (
        <div className="mt-6 text-black">
          <h3 className="text-xl font-bold mb-4">Manage Slots</h3>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <input
              type="number"
              placeholder="Total Slots"
              value={totalSlots}
              onChange={(e) => setTotalSlots(Number(e.target.value))}
              className="border p-2 rounded w-full sm:w-auto"
            />
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="border p-2 rounded w-full sm:w-auto"
            >
              <option value="bike">Bike</option>
              <option value="car">Car</option>
            </select>
            <button
              onClick={handleAssignSlots}
              className="bg-green-500 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Assign Slots
            </button>
            <button
              onClick={handleClearSlots}
              className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Clear Slots
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotGrid;
