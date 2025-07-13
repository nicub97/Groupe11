/* Liste et téléchargement des factures mensuelles du prestataire */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import FactureCard from "../components/FactureCard";

export default function Factures() {
  const { token } = useAuth();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        const res = await api.get("/factures-prestataire", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFactures(res.data);
      } catch (err) {
        setError("Erreur lors du chargement des factures.");
        alert("Impossible de charger vos factures pour le moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchFactures();
  }, [token]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Mes factures</h2>
      {factures.length === 0 ? (
        <p>Aucune facture disponible</p>
      ) : (
        <ul className="space-y-4">
          {factures.map((f) => (
            <li key={f.id}>
              <FactureCard facture={f} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}