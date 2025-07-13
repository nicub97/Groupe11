import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AnnoncesPublic() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await api.get("/public/annonces");
        console.log(res.data);
        setAnnonces(res.data.data);
      } catch (err) {
        console.error("Erreur chargement annonces:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonces();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Annonces</h2>
      {annonces.length === 0 ? (
        <p>Aucune annonce disponible.</p>
      ) : (
        <ul className="space-y-4">
          {annonces.map((annonce) => (
            <li
              key={annonce.id}
              className="p-4 border rounded bg-white shadow"
            >
              <h3
                onClick={() => navigate(`/annonces-public/${annonce.id}`)}
                className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                {annonce.titre}
              </h3>
              <p>{annonce.description}</p>
              <p className="text-sm text-gray-500">
                Prix : {annonce.prix_propose} € • Départ :
                {" "}
                {annonce.entrepot_depart?.ville || "❓"} → {" "}
                {annonce.entrepot_arrivee?.ville || "❓"}
              </p>
              <p className="text-xs text-gray-400">
                Publié le : {new Date(annonce.created_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => navigate(`/annonces-public/${annonce.id}`)}
                className="btn-primary mt-3"
              >
                Voir l'annonce
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
