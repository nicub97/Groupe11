import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AnnoncesDisponibles() {
  const { token } = useAuth();
  const [annoncesDisponibles, setAnnoncesDisponibles] = useState([]);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
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
        setAnnoncesDisponibles(res.data.annonces_disponibles);
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
    setSearchText("");
    setMinPrice("");
    setMaxPrice("");
    setDateDepart("");
    setDateArrivee("");
  };

  const filteredAnnonces = annoncesDisponibles.filter((annonce) => {
    const keyword = searchText.toLowerCase();

    if (keyword) {
      const inDesc = (annonce.description || "")
        .toLowerCase()
        .includes(keyword);
      const inCity =
        (annonce.lieu_depart || "").toLowerCase().includes(keyword) ||
        (annonce.lieu_arrivee || "").toLowerCase().includes(keyword);
      if (!(inDesc || inCity)) return false;
    }

    const price = Number(annonce.prix_propose);
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;

    if (dateDepart && new Date(annonce.date_depart) < new Date(dateDepart)) {
      return false;
    }
    if (dateArrivee && new Date(annonce.date_arrivee) > new Date(dateArrivee)) {
      return false;
    }

    return true;
  });

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Annonces disponibles</h2>

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
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="p-2 border rounded w-28"
        />
        <input
          type="number"
          placeholder="Prix max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded w-28"
        />
        <input
          type="date"
          value={dateDepart}
          onChange={(e) => setDateDepart(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={dateArrivee}
          onChange={(e) => setDateArrivee(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Réinitialiser les filtres
        </button>
      </div>

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
