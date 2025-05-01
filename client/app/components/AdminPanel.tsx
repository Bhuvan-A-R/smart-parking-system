import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
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

const socket = io(
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
);

const formatToIST = (utcDate: string): string => {
  const date = new Date(utcDate);
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

const AdminPanel: React.FC = () => {
  const [totalMoneyCollected, setTotalMoneyCollected] = useState<number>(0);
  const [paymentHistory, setPaymentHistory] = useState<
    {
      id: string;
      amount: number;
      method: string;
      date: string;
      userName: string;
    }[]
  >([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const paymentsRes = await axios.get(
          `${API_BASE_URL}/api/admin/payments`
        );

        setTotalMoneyCollected(paymentsRes.data.totalMoneyCollected);
        setPaymentHistory(paymentsRes.data.lastFivePayments);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchAdminData();

    // Listen for real-time updates
    socket.on("paymentUpdated", (data) => {
      console.log("Real-time update received:", data);
      setTotalMoneyCollected(data.totalMoneyCollected);
      setPaymentHistory((prev) => [data.newPayment, ...prev.slice(0, 4)]); // Add new payment and keep the last 5
    });

    return () => {
      socket.off("paymentUpdated");
    };
  }, []);

  // Separate data for cash and UPI
  const cashPayments = paymentHistory.filter(
    (payment) => payment.method === "cash"
  );
  const upiPayments = paymentHistory.filter(
    (payment) => payment.method === "upi"
  );

  // Generate unique dates for the labels
  const uniqueDates = Array.from(
    new Set(paymentHistory.map((payment) => formatToIST(payment.date)))
  );

  // Generate data for cash and UPI payments
  const cashData = uniqueDates.map((date) => {
    const payment = cashPayments.find((p) => formatToIST(p.date) === date);
    return payment ? payment.amount : 0;
  });

  const upiData = uniqueDates.map((date) => {
    const payment = upiPayments.find((p) => formatToIST(p.date) === date);
    return payment ? payment.amount : 0;
  });

  const paymentChartData = {
    labels: uniqueDates,
    datasets: [
      {
        label: "Cash Payments (₹)",
        data: cashData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "UPI Payments (₹)",
        data: upiData,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
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
        text: "Payment Visualization (Cash vs UPI)",
      },
    },
    animation: {
      duration: 1000, // Animation duration in milliseconds
      easing: "easeInOutQuad" as const, // Animation easing function
    },
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      {/* Total Money Collected */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-black">Total Money Collected</h3>
        <p className="text-2xl font-semibold text-blue-600">
          ₹{totalMoneyCollected}
        </p>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-black">Last 5 Payments</h3>
        <ul>
          {paymentHistory.map((payment, index) => (
            <li
              key={`${payment.id}-${index}`}
              className="mb-5 p-4 bg-gray-100 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-600">
                  {formatToIST(payment.date)}
                </p>
                <p className="text-lg font-semibold text-black">
                  ₹{payment.amount}
                </p>
              </div>
              <p className="text-sm text-right font-bold text-red-600">
                {payment.method.toUpperCase()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Chart */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-black">
          Payment Visualization
        </h3>
        <Bar data={paymentChartData} options={paymentChartOptions} />
      </div>
    </div>
  );
};

export default AdminPanel;
