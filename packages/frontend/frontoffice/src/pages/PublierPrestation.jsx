/* Formulaire de publication d'une prestation (prestataire uniquement) */
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PublierPrestation() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type_prestation: "",
    description: "",
    date_heure: "",
    duree_estimee: "",
    tarif: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);
    try {
      await api.post(
        "/prestations",
        {
          ...form,
          duree_estimee: form.duree_estimee
            ? Number(form.duree_estimee)
            : null,
          tarif: Number(form.tarif),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setMessage("Prestation publiée avec succès.");
      setTimeout(() => navigate("/prestations"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la publication.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Publier une prestation</h2>
      {message && (
        <p className={`mb-4 ${success ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="type_prestation"
          placeholder="Type de prestation"
          value={form.type_prestation}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="datetime-local"
          name="date_heure"
          value={form.date_heure}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="duree_estimee"
          placeholder="Durée estimée (min)"
          value={form.duree_estimee}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          name="tarif"
          placeholder="Tarif (€)"
          value={form.tarif}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Publication..." : "Publier"}
        </button>
      </form>
    </div>
  );
}
