import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AnnoncesDisponibles() {
  const { token } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [dateArrivee, setDateArrivee] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnonces = async () => {
      try {
        const res = await api.get("/annonces-disponibles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnonces(res.data.annonces_disponibles);
      } catch (err) {
        console.error("Erreur API :", err);
        setError("Erreur lors du chargement des annonces.");
      }
    };

    fetchAnnonces();
  }, [token]);

  const handleAccepter = async (annonceId) => {
    if (!window.confirm("Accepter cette annonce ?")) return;

    try {
      await api.post(`/annonces/${annonceId}/accepter`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Étape de livraison créée. Vous pouvez la suivre dans 'Mes étapes'.");
      navigate("/mes-etapes");
    } catch (err) {
      console.error("Erreur acceptation :", err);
      alert("Erreur lors de l'acceptation.");
    }
  };

  const handleReset = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setDateDepart("");
    setDateArrivee("");
  };

  const filteredAnnonces = annonces.filter((a) => {
    const keyword = search.toLowerCase();

    if (keyword) {
      const inCity =
        (a.lieu_depart || "").toLowerCase().includes(keyword) ||
        (a.lieu_arrivee || "").toLowerCase().includes(keyword);
      const inDesc = (a.description || "").toLowerCase().includes(keyword);
      const inType = (a.type || "").toLowerCase().includes(keyword);
      if (!(inCity || inDesc || inType)) return false;
    }

    const price = Number(a.prix_propose);
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;

    if (dateDepart && new Date(a.date_depart) < new Date(dateDepart)) {
      return false;
    }
    if (dateArrivee && new Date(a.date_arrivee) > new Date(dateArrivee)) {
      return false;
    }

    return true;
  });

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Annonces disponibles</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Prix min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <input
            type="number"
            placeholder="Prix max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
        <input
          type="date"
          value={dateDepart}
          onChange={(e) => setDateDepart(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <input
          type="date"
          value={dateArrivee}
          onChange={(e) => setDateArrivee(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>
      <button
        onClick={handleReset}
        className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Réinitialiser les filtres
      </button>

      {filteredAnnonces.length === 0 ? (
        <p>Aucune annonce compatible pour le moment.</p>
      ) : (
        <ul className="space-y-6">
          {filteredAnnonces.map((a) => (
            <li key={a.id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{a.titre}</h3>
              <p>{a.description}</p>
              <p className="text-sm text-gray-600">Prix : {a.prix_propose} €</p>
              {a.lieu_depart && <p>Trajet : {a.lieu_depart} → {a.lieu_arrivee}</p>}
              <p className="text-xs text-gray-400">
                Créée par : {a.client?.prenom || a.commercant?.prenom} {a.client?.nom || a.commercant?.nom}
              </p>

              <button
                onClick={() => handleAccepter(a.id)}
                className="mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
              >
                Accepter l’annonce
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
