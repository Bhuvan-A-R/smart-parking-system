import { useState } from "react";
import BookingModal from "./BookingModal";

export default function SlotCard({ slot }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className={`p-4 border rounded-lg shadow-md ${
        slot.isAvailable ? "bg-green-100" : "bg-red-100"
      }`}
    >
      <h3 className="text-lg font-bold text-black">Slot {slot.slotNumber}</h3>
      <p className="text-sm text-gray-600">
        {slot.isAvailable ? "Available" : "Occupied"}
      </p>
      {slot.isAvailable && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book Now
        </button>
      )}
      {isModalOpen && (
        <BookingModal slot={slot} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
