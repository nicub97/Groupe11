import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PrestationStatusBadge from "../components/PrestationStatusBadge";

export default function CataloguePublic() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/public/prestations");
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Catalogue des prestations</h2>
      {data && data.length > 0 ? (
        data.map((p) => (
          <div key={p.id} className="border rounded p-4 mb-4">
            <h3 className="text-lg font-semibold">{p.type_prestation}</h3>
            <p className="my-2">{p.description}</p>
            <p>
              Date : {new Date(p.date_heure).toLocaleString()} - Tarif: {p.tarif} €
            </p>
            <PrestationStatusBadge status={p.statut} />
            {p.intervention && p.intervention.note !== null && (
              <span className="ml-2 px-2 py-1 rounded bg-green-200 text-green-800 text-sm">
                Évaluée
              </span>
            )}
            <button
              onClick={() => navigate(`/catalogue-public/${p.id}`)}
              className="text-blue-600 underline mt-2"
            >
              Voir détail
            </button>
          </div>
        ))
      ) : (
        <p>Aucune prestation disponible.</p>
      )}
    </div>
  );
}
