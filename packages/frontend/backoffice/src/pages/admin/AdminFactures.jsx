import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminFactures() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/factures-prestataire")
      .then((res) => setFactures(res.data.data || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Factures Prestataires</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">Mois</th>
              <th className="p-3">Prestataire</th>
              <th className="p-3">Montant</th>
              <th className="p-3">PDF</th>
            </tr>
          </thead>
          <tbody>
            {factures.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{f.mois}</td>
                <td className="p-3">
                  {f.prestataire?.utilisateur?.prenom} {f.prestataire?.utilisateur?.nom}
                </td>
                <td className="p-3">{f.montant_total} €</td>
                <td className="p-3">
                  <a
                    href={`/storage/${f.chemin_pdf}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Télécharger
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}