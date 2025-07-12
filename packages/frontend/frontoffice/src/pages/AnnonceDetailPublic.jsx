import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AnnonceDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await api.get(`/public/annonces/${id}`);
        setAnnonce(res.data.data);
      } catch (err) {
        console.error("Erreur chargement annonce :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, [id]);

  const reserver = () => {
    navigate("/register");
  };

  if (loading) return <p className="mt-10 text-center">Chargement...</p>;
  if (!annonce) return <p className="mt-10 text-center">Annonce introuvable</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">{annonce.titre}</h2>
      {annonce.photo && (
        <img
          src={annonce.photo}
          alt="Photo de l’annonce"
          className="w-full max-w-md rounded-xl shadow mb-4"
        />
      )}
      <p className="mb-2">{annonce.description}</p>
      <p className="mb-2">
        <strong>Prix :</strong> {annonce.prix_propose} €
      </p>
      <p className="mb-2">
        <strong>Trajet :</strong> {annonce.entrepot_depart || "❓"} → {annonce.entrepot_arrivee || "❓"}
      </p>
      <button onClick={reserver} className="btn-primary mt-4">
        Réserver
      </button>
    </div>
  );
}
