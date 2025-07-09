import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchPaiements } from "../../services/paiement";

export default function MesPaiements() {
  const { token } = useAuth();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPaiements(token);
        setPaiements(data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des paiements.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) return <p className="p-4">Chargement...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Mes paiements</h2>
      {paiements.length === 0 ? (
        <p>Aucun paiement trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left uppercase text-gray-600">
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Référence</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 capitalize">{p.type}</td>
                  <td className="p-3">
                    {Number(p.montant).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="p-3 capitalize">{p.statut || "-"}</td>
                  <td className="p-3">{p.reference || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
