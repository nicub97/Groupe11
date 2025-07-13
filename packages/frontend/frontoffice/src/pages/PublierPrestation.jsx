/* Formulaire de publication d'une prestation (prestataire uniquement) */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PublierPrestation() {
  const { user } = useAuth();
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
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [error, setError] = useState("");
  const [prestataire, setPrestataire] = useState(null);
  const [loadingPrestataire, setLoadingPrestataire] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/prestataires/${user.id}`)
      .then((res) => setPrestataire(res.data))
      .catch(() => setPrestataire(null))
      .finally(() => setLoadingPrestataire(false));
  }, [user]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await api.get("/plannings");
        const formatted = res.data.map((s) => {
          const value = `${s.date_disponible}T${s.heure_debut.slice(0, 5)}`;
          return {
            id: s.id,
            value,
            label: `${new Date(s.date_disponible).toLocaleDateString()} \u2013 ${s.heure_debut} \u2192 ${s.heure_fin}`,
          };
        });
        setSlotsDisponibles(formatted);
      } catch (err) {
        console.error(err);
        setSlotsDisponibles([]);
      }
    };

    fetchSlots();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);
    setError("");

    if (!slotsDisponibles.some((s) => s.value === form.date_heure)) {
      setError(
        "Veuillez choisir un créneau valide défini dans vos disponibilités."
      );
      setLoading(false);
      return;
    }
    try {
      await api.post(
        "/prestations",
        {
          ...form,
          duree_estimee: form.duree_estimee
            ? Number(form.duree_estimee)
            : null,
          tarif: Number(form.tarif),
        }
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

  if (loadingPrestataire) return <p className="p-4">Chargement...</p>;
  if (prestataire && prestataire.statut !== "valide") {
    return (
      <p className="p-4 text-red-600">
        Vous ne pouvez pas publier tant que votre profil n'est pas validé
      </p>
    );
  }

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
        {slotsDisponibles.length === 0 ? (
          <p>Aucune disponibilité trouvée</p>
        ) : (
          <select
            name="date_heure"
            value={form.date_heure}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Choisir un créneau --</option>
            {slotsDisponibles.map((slot) => (
              <option key={slot.id} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
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
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Publication..." : "Publier"}
        </button>
      </form>
    </div>
  );
}