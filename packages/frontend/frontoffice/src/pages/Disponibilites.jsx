/* Gestion des créneaux de disponibilité du prestataire */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import PlanningForm from "../components/PlanningForm";

export default function Disponibilites() {
  const { token } = useAuth();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const fetchSlots = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/plannings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSlots(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des créneaux.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAddSlot = async ({ date, heure_debut, heure_fin }) => {
    // vérifie localement les chevauchements de créneau
    const conflict = slots.some(
      (s) =>
        s.date_disponible === date &&
        !(heure_fin <= s.heure_debut || heure_debut >= s.heure_fin)
    );
    if (conflict) {
      setMessage("Ce créneau chevauche un créneau existant.");
      return;
    }

    setMessage("");
    try {
      await api.post(
        "/plannings",
        { date_disponible: date, heure_debut, heure_fin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Créneau ajouté avec succès.");
      fetchSlots();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'ajout.";
      setMessage(msg);
    } finally {
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    try {
      await api.delete(`/plannings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Mes disponibilités</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {slots.length === 0 ? (
            <p>Aucun créneau enregistré.</p>
          ) : (
            <ul className="space-y-2 mb-6">
              {slots.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {new Date(s.date_disponible).toLocaleDateString()} – {s.heure_debut} → {s.heure_fin}
                  </span>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="font-semibold mb-2">Ajouter un créneau</h3>
          {message && (
            <p className="mb-2 text-center text-sm text-red-600">{message}</p>
          )}
          <PlanningForm onSubmit={handleAddSlot} />
        </>
      )}
    </div>
  );
}
