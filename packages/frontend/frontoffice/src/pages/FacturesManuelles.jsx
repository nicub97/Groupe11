import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function FacturesManuelles() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [btnLoadingId, setBtnLoadingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        if (user.role === "livreur") {
          const res = await api.get("/mes-etapes");
          const terminees = (res.data || []).filter((e) => e.statut === "terminee");
          setItems(terminees);
        } else {
          const res = await api.get("/mes-annonces");
          const payees = (res.data || []).filter((a) => a.is_paid === true);
          setItems(payees);
        }
      } catch (err) {
        console.error("Erreur chargement :", err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleGenerate = async (id) => {
    setBtnLoadingId(id);
    try {
      let endpoint = "";
      if (user.role === "livreur") {
        endpoint = `/factures/livreur/etape/${id}`;
      } else if (user.role === "client") {
        endpoint = `/factures/client/annonce/${id}`;
      } else {
        endpoint = `/factures/commercant/annonce/${id}`;
      }
      const res = await api.post(endpoint);
      const url = res.data.url;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Erreur generation facture:", err);
      alert("Impossible de générer la facture");
    } finally {
      setBtnLoadingId(null);
    }
  };

  if (loading) return <p className="p-4">Chargement...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Mes factures</h2>
      {items.length === 0 ? (
        <p>Aucun élément facturable disponible.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  {user.role === "livreur"
                    ? `${item.lieu_depart} → ${item.lieu_arrivee}`
                    : item.titre}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(item.created_at).toLocaleDateString()} -
                  {" "}
                  {Number(
                    user.role === "livreur"
                      ? item.annonce?.prix_propose
                      : item.prix_propose
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleGenerate(item.id)}
                disabled={btnLoadingId === item.id}
                className="btn-primary disabled:opacity-50"
              >
                {btnLoadingId === item.id ? "Génération..." : "Générer la facture"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
