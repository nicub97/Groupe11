import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const STORAGE_BASE_URL = api.defaults.baseURL.replace("/api", "");

export default function AnnonceDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await api.get(`/public/annonces/${id}`);
        setAnnonce(res.data.data);
      } catch (err) {
        console.error("Erreur chargement annonce:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonce();
  }, [id]);

  if (loading) return <p className="mt-10 text-center">Chargement...</p>;
  if (error) return <p className="mt-10 text-center">Erreur lors du chargement.</p>;
  if (!annonce) return <p className="mt-10 text-center">Annonce introuvable</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">{annonce.titre}</h2>
      {annonce.photo && (
        <img
          src={`${STORAGE_BASE_URL}/storage/${annonce.photo}`}
          alt="Photo de l’annonce"
          className="mb-4 max-w-full h-auto"
        />
      )}
      <p className="mb-2">{annonce.description}</p>
      <p className="mb-2">
        <strong>Prix :</strong> {annonce.prix_propose} €
      </p>
      <p className="mb-2">
        <strong>Trajet :</strong> {annonce.entrepot_depart?.ville || "-"} → {" "}
        {annonce.entrepot_arrivee?.ville || "-"}
      </p>
      <button onClick={() => navigate("/register")} className="btn-primary mt-4">
        Réserver
      </button>
    </div>
  );
}
