
import { useEffect, useState } from "react";
import "./ProviderProfile.css";

const API_URL = "http://localhost:5000/api/providers/profile";

const initialForm = {
  businessName: "",
  category: "",
  description: "",
  phone: "",
  location: ""
};

function ProviderProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = sessionStorage.getItem("helporaToken");

  const fetchProfile = async () => {
    try {
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 404) {
        setProfile(null);
        setForm(initialForm);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not load provider profile");
      }

      const provider = data.data;

      setProfile(provider);
      setForm({
        businessName: provider.businessName || "",
        category: provider.category || "",
        description: provider.description || "",
        phone: provider.phone || "",
        location: provider.location || ""
      });
    } catch (err) {
      setError(err.message || "Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please login to access your provider profile.");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    const isUpdating = Boolean(profile);

    try {
      const response = await fetch(API_URL, {
        method: isUpdating ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save provider profile");
      }

      setProfile(data.data);

      setForm({
        businessName: data.data.businessName || "",
        category: data.data.category || "",
        description: data.data.description || "",
        phone: data.data.phone || "",
        location: data.data.location || ""
      });

      setEditing(false);
      setMessage(data.message || "Provider profile saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save provider profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        businessName: profile.businessName || "",
        category: profile.category || "",
        description: profile.description || "",
        phone: profile.phone || "",
        location: profile.location || ""
      });

      setEditing(false);
    } else {
      setForm(initialForm);
    }

    setError("");
    setMessage("");
  };

  if (loading) {
    return <p>Loading provider profile...</p>;
  }

  const isFormVisible = !profile || editing;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>{profile ? "My Business Profile" : "Create Business Profile"}</h1>

        <p className="profile-subtitle">
          Manage your service business details
        </p>

        <div className="profile-avatar">
          {(profile?.businessName || form.businessName || "B")
            .charAt(0)
            .toUpperCase()}
        </div>

        {message && <p className="profile-message">{message}</p>}
        {error && (
          <p className="profile-message" style={{ color: "#b42318" }}>
            {error}
          </p>
        )}

        {isFormVisible ? (
          <form onSubmit={handleSubmit}>
            <label>Business Name</label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="Enter business name"
              required
            />

            <label>Category</label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Electrician, Plumber"
              required
            />

            <label>Business Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your services"
              rows="4"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "15px",
                fontFamily: "Arial, sans-serif",
                resize: "vertical"
              }}
            />

            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />

            <label>Business Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Enter business location"
              required
            />

            <div className="profile-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : profile
                    ? "Update Profile"
                    : "Create Profile"}
              </button>

              {profile && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <>
            <div className="profile-detail">
              <span>Business Name</span>
              <strong>{profile.businessName}</strong>
            </div>

            <div className="profile-detail">
              <span>Category</span>
              <strong>{profile.category}</strong>
            </div>

            <div className="profile-detail">
              <span>Description</span>
              <strong>{profile.description}</strong>
            </div>

            <div className="profile-detail">
              <span>Phone Number</span>
              <strong>{profile.phone}</strong>
            </div>

            <div className="profile-detail">
              <span>Location</span>
              <strong>{profile.location}</strong>
            </div>

            <div className="profile-detail">
              <span>Verification Status</span>
              <strong>{profile.verificationStatus}</strong>
            </div>

            {profile.adminNote && (
              <div className="profile-detail">
                <span>Admin Note</span>
                <strong>{profile.adminNote}</strong>
              </div>
            )}

            <button
              className="edit-profile-btn"
              onClick={() => {
                setMessage("");
                setEditing(true);
              }}
            >
              Edit Business Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProviderProfile;
