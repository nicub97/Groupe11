import { useEffect, useState } from "react";
import { fetchPaiements } from "../../services/paiement";

export default function PaiementsList() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPaiements();
        setPaiements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = paiements.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.utilisateur?.nom?.toLowerCase().includes(term) ||
      p.utilisateur?.prenom?.toLowerCase().includes(term) ||
      p.utilisateur?.email?.toLowerCase().includes(term) ||
      String(p.utilisateur_id).includes(term)
    );
  });

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Paiements</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par client"
        className="border p-2 rounded w-full max-w-sm"
      />
      {filtered.length === 0 ? (
        <p>Aucun paiement trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100 text-left uppercase text-gray-600">
                <th className="p-3">Client</th>
                <th className="p-3">Type</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Date</th>
                <th className="p-3">Référence</th>
                <th className="p-3">Commande</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {p.utilisateur
                      ? `${p.utilisateur.prenom} ${p.utilisateur.nom}`
                      : p.utilisateur_id}
                  </td>
                  <td className="p-3 capitalize">{p.type}</td>
                  <td className="p-3">
                    {Number(p.montant).toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="p-3">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">{p.reference || "-"}</td>
                  <td className="p-3">{p.commande_id || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}