import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Save, Trash2 } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, bio: user.bio || "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    const { data } = await api.put("/users/profile", form);
    setUser(data.user);
    localStorage.setItem("soket-user", JSON.stringify(data.user));
    setMessage("Profile saved");
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    const { data } = await api.put("/users/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setUser(data.user);
    localStorage.setItem("soket-user", JSON.stringify(data.user));
    setMessage("Profile image updated");
  };

  const deleteProfile = async () => {
    const confirmed = window.confirm("Delete your profile, conversations, requests, and messages permanently?");
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await api.delete("/users/profile");
      logout();
      navigate("/signup", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete profile");
      setDeleting(false);
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-editor">
        <Link className="icon-link" to="/">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="profile-hero">
          <Avatar user={user} size="xl" />
          <label className="camera-button">
            <Camera size={18} />
            <input type="file" accept="image/*" onChange={uploadImage} />
          </label>
        </div>
        <form className="auth-form" onSubmit={saveProfile}>
          <label>
            Full name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Bio
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="4" />
          </label>
          <button className="primary-button" type="submit">
            <Save size={17} /> Save profile
          </button>
          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}
        </form>
        <section className="danger-zone">
          <div>
            <strong>Delete profile</strong>
            <p>Remove your account, chat requests, conversations, and messages.</p>
          </div>
          <button className="danger-button" onClick={deleteProfile} disabled={deleting}>
            <Trash2 size={17} /> {deleting ? "Deleting..." : "Delete"}
          </button>
        </section>
      </section>
    </main>
  );
}
