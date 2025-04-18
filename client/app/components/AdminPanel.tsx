import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminPanel: React.FC = () => {
  const [hours, setHours] = useState<number>(0);
  const [fee, setFee] = useState<number | null>(null);
  const [totalSlots, setTotalSlots] = useState<number>(0);
  const [totalMoneyCollected, setTotalMoneyCollected] = useState<number>(0);
  const [paymentHistory, setPaymentHistory] = useState<
    { id: string; amount: number; method: string; date: string }[]
  >([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const slotsRes = await axios.get("/api/admin/slots");
        setTotalSlots(slotsRes.data.totalSlots);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        alert("Failed to fetch admin data. Please try again later.");
      }
    };

    fetchAdminData();
  }, []);

  const calculateFee = async () => {
    try {
      const res = await axios.post("/api/pricing/calculate-fee", { hours });
      setFee(res.data.fee);
    } catch (err) {
      console.error("Error calculating fee:", err);
    }
  };

  const paymentChartData = {
    labels: paymentHistory.map((payment) => payment.date),
    datasets: [
      {
        label: "Payment Amount (₹)",
        data: paymentHistory.map((payment) => payment.amount),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const paymentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Last 5 Payments",
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      {/* Total Slots and Money Collected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="text-lg font-bold">Total Slots</h3>
          <p className="text-2xl font-semibold">{totalSlots}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <h3 className="text-lg font-bold">Total Money Collected</h3>
          <p className="text-2xl font-semibold">₹{totalMoneyCollected}</p>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-xl font-bold mb-4">Last 5 Payments</h3>
        <ul className="space-y-2">
          {paymentHistory.map((payment) => (
            <li
              key={payment.id}
              className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-600">{payment.date}</p>
                <p className="text-lg font-semibold">₹{payment.amount}</p>
              </div>
              <span className="text-sm text-gray-500">{payment.method}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Chart */}
      <div>
        <h3 className="text-xl font-bold mb-4">Payment Visualization</h3>
        <Bar data={paymentChartData} options={paymentChartOptions} />
      </div>
    </div>
  );
};

export default AdminPanel;
