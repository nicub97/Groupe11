import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { createCheckoutSession } from "../services/paiement";;
import { useAuth } from "../context/AuthContext";

export default function ReserverAnnonce() {
  const { annonceId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [annonce, setAnnonce] = useState(null);
  const [entrepots, setEntrepots] = useState([]);
  const [entrepotArriveeId, setEntrepotArriveeId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "client") {
      navigate("/");
    }

    const fetchAnnonce = async () => {
      try {
        const res = await api.get(`/annonces/${annonceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnonce(res.data);
      } catch (err) {
        console.error("Erreur chargement annonce :", err);
      }
    };

    const fetchEntrepots = async () => {
      try {
        const res = await api.get("/entrepots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrepots(res.data);
      } catch (err) {
        console.error("Erreur chargement entrepôts :", err);
      }
    };

    fetchAnnonce();
    fetchEntrepots();
  }, [annonceId, token, user, navigate]);

  useEffect(() => {
    if (searchParams.get("cancel") === "1") {
      setMessage(
        "Le paiement a échoué ou a été annulé. Aucune annonce n’a été créée.",
      );
    }
  }, [searchParams]);

  const reserver = async () => {
    if (!entrepotArriveeId) {
      setMessage("Veuillez sélectionner un entrepôt d’arrivée.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await api.get(`/annonces/${annonceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.id_client !== null || res.data.entrepot_arrivee_id !== null) {
        setMessage("Cette annonce a déjà été réservée par un autre client.");
        setLoading(false);
        return;
      }
      localStorage.setItem("reservationEntrepot", entrepotArriveeId);
      localStorage.setItem("paymentContext", "reserver");
      localStorage.setItem("reservationAnnonceId", annonceId);
      const { checkout_url } = await createCheckoutSession(
        { annonce_id: Number(annonceId), type: annonce.type },
        token,
        "reserver",
      );
      window.location.href = checkout_url;
    } catch (err) {
      console.error("Erreur réservation :", err);
      const msg =
        err.response?.data?.message ||
        "Erreur lors de la redirection de paiement.";
      setMessage(msg);
      setLoading(false);
    }
  };

  if (!annonce) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Réserver l’annonce</h2>

      <p className="mb-2">
        <strong>Titre :</strong> {annonce.titre}
      </p>
      <p className="mb-2">
        <strong>Description :</strong> {annonce.description}
      </p>
      <p className="mb-2">
        <strong>Prix proposé :</strong> {annonce.prix_propose} €
      </p>
      <p className="mb-4">
        <strong>Départ :</strong> {annonce.entrepot_depart?.ville || "-"}
      </p>

      <div className="mb-4">
        <label className="block font-medium mb-1">
          Sélectionnez un entrepôt d’arrivée :
        </label>
        <select
          value={entrepotArriveeId}
          onChange={(e) => setEntrepotArriveeId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Choisir un entrepôt --</option>
          {entrepots.map((e) => (
            <option key={e.id} value={e.id}>
              {e.ville}
            </option>
          ))}
        </select>
      </div>
          
      <button
        onClick={reserver}
        disabled={loading}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? "Redirection..." : "Réserver"}
      </button>

      {message && <p className="mt-4 text-sm text-blue-700">{message}</p>}
    </div>
  );
}
