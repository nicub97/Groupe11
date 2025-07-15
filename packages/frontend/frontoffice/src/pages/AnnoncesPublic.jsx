import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AnnoncesPublic() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [dateDepart, setDateDepart] = useState(null);
  const [dateArrivee, setDateArrivee] = useState(null);

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

  const handleReset = () => {
    setSearchText("");
    setMinPrice(null);
    setMaxPrice(null);
    setDateDepart(null);
    setDateArrivee(null);
  };

  const filteredAnnonces = annonces.filter((annonce) => {
    const keyword = searchText.toLowerCase();

    if (keyword) {
      const inDesc = (annonce.description || "").toLowerCase().includes(keyword);
      const inVille =
        (annonce.entrepot_depart?.ville || "").toLowerCase().includes(keyword) ||
        (annonce.entrepot_arrivee?.ville || "").toLowerCase().includes(keyword);
      if (!(inDesc || inVille)) return false;
    }

    const price = Number(annonce.prix_propose);
    if (minPrice !== null && price < minPrice) return false;
    if (maxPrice !== null && price > maxPrice) return false;

    if (dateDepart !== null && new Date(annonce.date_depart) < new Date(dateDepart)) {
      return false;
    }
    if (dateArrivee !== null && new Date(annonce.date_arrivee) > new Date(dateArrivee)) {
      return false;
    }

    return true;
  });

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Annonces</h2>

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

      {filteredAnnonces.length === 0 ? (
        <p>Aucune annonce disponible.</p>
      ) : (
        <ul className="space-y-4">
          {filteredAnnonces.map((annonce) => (
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
                {annonce.entrepot_depart?.ville || "-"} → {" "}
                {annonce.entrepot_arrivee?.ville || "-"}
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
