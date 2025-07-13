import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PrestationStatusBadge from "../components/PrestationStatusBadge";

export default function CataloguePublic() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [dateDepart, setDateDepart] = useState(null);
  const [dateArrivee, setDateArrivee] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/public/prestations");
        setData(res.data.data);
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

  const handleReset = () => {
    setSearchText("");
    setMinPrice(null);
    setMaxPrice(null);
    setDateDepart(null);
    setDateArrivee(null);
  };

  const filteredData = data.filter((p) => {
    const keyword = searchText.toLowerCase();

    if (keyword) {
      const inDesc = (p.description || "").toLowerCase().includes(keyword);
      const inType = (p.type_prestation || "").toLowerCase().includes(keyword);
      if (!(inDesc || inType)) return false;
    }

    const price = Number(p.tarif);
    if (minPrice !== null && price < minPrice) return false;
    if (maxPrice !== null && price > maxPrice) return false;

    if (dateDepart !== null && new Date(p.date_heure) < new Date(dateDepart)) {
      return false;
    }
    if (dateArrivee !== null && new Date(p.date_heure) > new Date(dateArrivee)) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Catalogue des prestations</h2>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="p-2 border rounded flex-1 min-w-[150px]"
        />
        <input
          type="number"
          placeholder="Prix min"
          value={minPrice ?? ""}
          onChange={(e) =>
            setMinPrice(e.target.value === "" ? null : Number(e.target.value))
          }
          className="p-2 border rounded w-28"
        />
        <input
          type="number"
          placeholder="Prix max"
          value={maxPrice ?? ""}
          onChange={(e) =>
            setMaxPrice(e.target.value === "" ? null : Number(e.target.value))
          }
          className="p-2 border rounded w-28"
        />
        <input
          type="date"
          value={dateDepart ?? ""}
          onChange={(e) =>
            setDateDepart(e.target.value === "" ? null : e.target.value)
          }
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={dateArrivee ?? ""}
          onChange={(e) =>
            setDateArrivee(e.target.value === "" ? null : e.target.value)
          }
          className="p-2 border rounded"
        />
        <button onClick={handleReset} className="btn-secondary">
          Réinitialiser les filtres
        </button>
      </div>

      {filteredData.length > 0 ? (
        filteredData.map((p) => (
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
