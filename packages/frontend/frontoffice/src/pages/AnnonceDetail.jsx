import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { createCheckoutSession } from "../services/paiement";

export default function AnnonceDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await api.get(`/annonces/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnonce(res.data);
      } catch (err) {
        console.error("Erreur chargement annonce :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, [id, token]);

  const reserver = async () => {
    try {
      localStorage.setItem("paymentContext", "reserver");
      localStorage.setItem("reservationAnnonceId", id);
      const { checkout_url } = await createCheckoutSession(
        { annonce_id: Number(id), type: annonce.type },
        token,
        "reserver",
      );
      window.location.href = checkout_url;
    } catch (err) {
      console.error("Erreur réservation :", err);
      alert(
        err.response?.data?.message ||
          "Erreur lors de la redirection de paiement.",
      );
    }
  };

  if (loading) return <p className="mt-10 text-center">Chargement...</p>;
  if (!annonce) return <p className="mt-10 text-center">Annonce introuvable</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">{annonce.titre}</h2>
      <p className="mb-2">{annonce.description}</p>
      <p className="mb-2">
        <strong>Prix :</strong> {annonce.prix_propose} €
      </p>
      <p className="mb-2">
        <strong>Trajet :</strong> {annonce.entrepot_depart?.ville || "❓"} → {annonce.entrepot_arrivee?.ville || "❓"}
      </p>
      {user?.role === "client" && !annonce.id_client && (
        <button
          onClick={reserver}
          className="btn-primary mt-4"
        >
          Réserver
        </button>
      )}
    </div>
  );
}
