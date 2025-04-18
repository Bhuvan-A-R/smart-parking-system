"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import SlotGrid from "../components/SlotGrid";
import AdminPanel from "../components/AdminPanel";
import UserDashboard from "../components/UserDashboard";
import PastParking from "../components/PastParking";

export default function DashboardPage() {
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    role: string;
  } | null>(null);
  const [users, setUsers] = useState<
    { name: string; role: string; _id: string }[]
  >([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);

        if (res.data.role === "admin" || res.data.role === "sub-admin") {
          const usersRes = await axios.get(`${API_BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(usersRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
        window.location.href = "/login";
      }
    };

    fetchUserDetails();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/add-user`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showNotification("User added successfully!", "success");
      setUsers((prevUsers) => [...prevUsers, res.data.user]);
      setNewUser({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error("Failed to add user:", err);
      showNotification("Error adding user.", "error");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
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

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black">
        Dashboard
      </h1>
      <p className="text-black mb-4">
        Welcome, {user.name} ({user.role})
      </p>

      <div className="space-y-6">
        {/* User Role: User */}
        {user.role === "user" && (
          <>
            <UserDashboard userId={user._id} />
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full sm:w-auto"
            >
              {showHistory ? "Hide Past Parking" : "Show Past Parking"}
            </button>
            {showHistory && <PastParking userId={user._id} />}
          </>
        )}

        {/* User Role: Admin or Sub-Admin */}
        {user.role !== "user" && (
          <div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-black">
                Parking Slots
              </h3>
              <SlotGrid userRole={user?.role || "user"} />
            </div>
            <div className=" pb-4"></div>
            {(user.role === "admin" || user.role === "sub-admin") && (
              <div>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
                  <button
                    onClick={() => setShowUsers(!showUsers)}
                    className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                  >
                    {showUsers ? "Hide Users" : "Show Users"}
                  </button>
                  {user.role === "admin" && (
                    <button
                      onClick={() => setShowAddUserForm(!showAddUserForm)}
                      className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                    >
                      {showAddUserForm ? "Hide Add User Form" : "Add New User"}
                    </button>
                  )}
                </div>

                {showUsers && (
                  <div>
                    <h3 className="text-xl font-bold mt-8 text-black">
                      All Users
                    </h3>
                    <ul className="text-black grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {users.map((u) => (
                        <li
                          key={u._id}
                          className="border p-4 rounded shadow bg-white"
                        >
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-sm text-gray-600">{u.role}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {showAddUserForm && user.role === "admin" && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4 text-black">
                      Add New User
                    </h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                        className="block w-flex p-2 border rounded text-black"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        className="block w-flex p-2 border rounded text-black"
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        className="block w-flex p-2 border rounded text-black"
                        required
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                        className="block w-flex p-2 border rounded text-black"
                      >
                        <option value="user">User</option>
                        <option value="sub-admin">Sub-Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                      >
                        Add User
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {user.role === "admin" && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-black">
                  Admin Panel
                </h3>
                <AdminPanel />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
