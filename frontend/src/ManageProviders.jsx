
import { useEffect, useState } from "react";
import "./ManageProviders.css";

const API_URL = "http://localhost:5000/api/admin";

function ManageProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  const token = sessionStorage.getItem("helporaToken");

  const fetchProviders = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/pending-providers`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch providers");
      }

      setProviders(data.data || []);
    } catch (err) {
      setError(err.message || "Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const updateProviderStatus = async (id, status) => {
    let adminNote = "";

    if (status === "rejected") {
      adminNote = window.prompt("Please enter rejection reason:");

      if (adminNote === null) return;

      if (!adminNote.trim()) {
        setError("Rejection reason is required.");
        return;
      }
    }

    setMessage("");
    setError("");
    setProcessingId(id);

    try {
      const response = await fetch(
        `${API_URL}/providers/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status,
            adminNote
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update provider");
      }

      setMessage(data.message);
      await fetchProviders();

    } catch (err) {
      setError(err.message || "Unable to update provider");
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="manage-providers-page">

      <div className="manage-providers-header">
        <div>
          <h1>Manage Providers</h1>
          <p>Review and manage pending service providers.</p>
        </div>

        <a href="/admin-dashboard">Back to Dashboard</a>
      </div>

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {loading ? (
        <p>Loading providers...</p>
      ) : providers.length === 0 ? (
        <p>No pending providers found.</p>
      ) : (
        <div className="providers-table-wrapper">

          <table className="providers-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {providers.map((provider) => (
                <tr key={provider._id}>
                  <td>{provider.businessName}</td>
                  <td>{provider.user?.name || "N/A"}</td>
                  <td>{provider.user?.email || "N/A"}</td>
                  <td>{provider.category}</td>
                  <td>{provider.location}</td>

                  <td>
                    <span className="inactive-status">
                      {provider.verificationStatus}
                    </span>
                  </td>

                  <td>
                    <button
                      className="activate-btn"
                      disabled={processingId === provider._id}
                      onClick={() =>
                        updateProviderStatus(provider._id, "approved")
                      }
                    >
                      {processingId === provider._id
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    {" "}

                    <button
                      className="deactivate-btn"
                      disabled={processingId === provider._id}
                      onClick={() =>
                        updateProviderStatus(provider._id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}

export default ManageProviders;
