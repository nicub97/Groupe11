import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PaiementSuccess() {
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const context = searchParams.get("context");
    const annonceId = searchParams.get("annonce_id");
    const entrepotId = localStorage.getItem("reservationEntrepot");
    const annonceData = localStorage.getItem("annonceForm");

    const finalize = async () => {
      try {
        if (context === "reserver" && annonceId && entrepotId) {
          await api.post(
            `/annonces/${annonceId}/reserver`,
            { entrepot_arrivee_id: Number(entrepotId) },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.removeItem("reservationEntrepot");
          setMessage("Réservation confirmée !");
        } else if (context === "creer" && annonceData) {
          const data = JSON.parse(annonceData);
          await api.post(
            "/annonces",
            { ...data.form, type: data.type },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          localStorage.removeItem("annonceForm");
          setMessage("Annonce créée avec succès !");
        } else {
          setMessage("Paiement confirmé.");
        }
        setTimeout(() => navigate("/annonces"), 1500);
      } catch (err) {
        setMessage(err.response?.data?.message || "Erreur après paiement.");
      }
    };

    finalize();
  }, [searchParams, token, navigate]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Paiement</h2>
      <p>{message || "Traitement en cours..."}</p>
    </div>
  );
}
