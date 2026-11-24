
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function CustomerDashboard() {
  const [customer, setCustomer] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem("helporaUser");
      if (savedUser) {
        setCustomer(JSON.parse(savedUser));
      }
    } catch {
      setError("Unable to load customer details.");
    }

    const fetchRequests = async () => {
      try {
        const token = sessionStorage.getItem("helporaToken");

        const response = await fetch(
          "http://localhost:5000/api/requests/customer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch bookings.");
        }

        setRequests(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const stats = [
    {
      title: "Total Bookings",
      count: requests.length,
      icon: "📋",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Requests",
      count: requests.filter((r) => r.status === "Pending").length,
      icon: "⏳",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Completed Services",
      count: requests.filter((r) => r.status === "Completed").length,
      icon: "✅",
      color: "bg-green-50 text-green-600",
    },
  ];

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
    Completed: "bg-green-100 text-green-700",
  };

  const recentBookings = requests.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome Back, {customer.name || "Customer"}! 👋
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your services and track your bookings.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((item) => (
            <div
              key={item.title}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-500 font-medium">
                    {item.title}
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800 mt-3">
                    {loading ? "..." : item.count}
                  </h2>
                </div>

                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${item.color}`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/search"
              className="bg-indigo-600 text-white p-5 rounded-xl text-center hover:bg-indigo-700 transition"
            >
              <span className="text-2xl">🔍</span>
              <p className="font-semibold mt-2">Find Services</p>
            </Link>

            <Link
              to="/my-requests"
              className="bg-indigo-50 text-indigo-700 p-5 rounded-xl text-center hover:bg-indigo-100 transition"
            >
              <span className="text-2xl">📋</span>
              <p className="font-semibold mt-2">My Requests</p>
            </Link>

            <Link
              to="/search"
              className="bg-indigo-50 text-indigo-700 p-5 rounded-xl text-center hover:bg-indigo-100 transition"
            >
              <span className="text-2xl">➕</span>
              <p className="font-semibold mt-2">Book New Service</p>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Recent Bookings
            </h2>

            <Link
              to="/my-requests"
              className="text-indigo-600 font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading bookings...</p>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-4">
                You have not booked any services yet.
              </p>
              <Link
                to="/search"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700"
              >
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-slate-100 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {booking.service?.title || "Service"}
                    </h3>

                    <p className="text-slate-500 mt-1">
                      Provider: {booking.provider?.name || "Provider"}
                    </p>

                    <p className="text-slate-500 mt-1">
                      Date:{" "}
                      {booking.requestedDate
                        ? new Date(booking.requestedDate).toLocaleDateString("en-IN")
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <p className="font-bold text-slate-800 text-lg mb-3">
                      ₹{booking.service?.price ?? "N/A"}
                    </p>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        statusColors[booking.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-5">
            My Profile
          </h2>

          <div className="flex flex-col sm:flex-row gap-5 items-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-4xl">
              👤
            </div>

            <div className="text-center sm:text-left">
              <h3 className="font-bold text-lg text-slate-800">
                {customer.name || "Customer"}
              </h3>

              <p className="text-slate-500 mt-1">
                {customer.email || "Email not available"}
              </p>

              <p className="text-slate-500 mt-1 capitalize">
                {customer.role || "customer"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerDashboard;
