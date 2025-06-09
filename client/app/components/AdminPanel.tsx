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
      paymentId: string;
      amount: number;
      method: string;
      date: string;
      userName: string;
    }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

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

  const handleDownloadClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setShowModal(true); // Show the modal to collect user details
  };

  const handleDownloadInvoice = async () => {
    if (!userName || !userEmail) {
      alert("Please enter your name and email.");
      return;
    }

    try {
      const response = await axios.post(
        `/api/admin/generate-invoice/${selectedPaymentId}`,
        { userName, userEmail },
        { responseType: "blob" } // Ensure the response is treated as a file
      );

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `invoice-${selectedPaymentId || "unknown"}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      setShowModal(false); // Close the modal after download
    } catch (err) {
      console.error("Error downloading invoice:", err);
      alert("Failed to download invoice.");
    }
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
              key={`${payment.paymentId}-${index}`}
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
              <button
                onClick={() => handleDownloadClick(payment.paymentId)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Download Invoice
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal for User Details */}
      {showModal && (
        <div
          className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setShowModal(false)} // Close popover when clicking outside
        >
          <div
            className="absolute bg-white p-4 rounded shadow-lg w-80"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <h3 className="text-lg text-black font-bold mb-4">Enter Your Details</h3>
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border p-2 text-black rounded w-full mb-4"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="border p-2 text-black rounded w-full mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDownloadInvoice}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Download Invoice
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
