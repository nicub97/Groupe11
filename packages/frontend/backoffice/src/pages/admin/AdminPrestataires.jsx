import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminPrestataires() {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justifs, setJustifs] = useState({});

  useEffect(() => {
    fetchPrestataires();
  }, []);

  async function fetchPrestataires() {
    try {
      const res = await api.get("/prestataires");
      setPrestataires(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const voirJustifs = async (id) => {
    try {
      const res = await api.get(`/prestataires/${id}/justificatifs`);
      setJustifs((prev) => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const valider = async (id) => {
    if (!window.confirm("Valider ce prestataire ?")) return;
    try {
      await api.patch(`/prestataires/${id}/valider`);
      fetchPrestataires();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de validation");
    }
  };

  const refuser = async (id) => {
    const motif = prompt("Motif du refus ?", "");
    if (motif === null) return;
    try {
      await api.patch(`/prestataires/${id}/refuser`, { motif_refus: motif });
      fetchPrestataires();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de refus");
    }
  };

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Prestataires</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Inscription</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prestataires.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 align-top">
                <td className="p-3">{p.utilisateur?.prenom} {p.utilisateur?.nom}</td>
                <td className="p-3">{p.utilisateur?.email}</td>
                <td className="p-3 capitalize">{p.statut}</td>
                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => voirJustifs(p.utilisateur_id)} className="text-blue-600 hover:underline">
                    Voir justificatifs
                  </button>
                  <button onClick={() => valider(p.utilisateur_id)} className="text-green-600 hover:underline">
                    Valider
                  </button>
                  <button onClick={() => refuser(p.utilisateur_id)} className="text-red-600 hover:underline">
                    Refuser
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Object.entries(justifs).map(([id, files]) => (
        <div key={id} className="mt-4">
          <h2 className="font-semibold">Justificatifs utilisateur {id}</h2>
          <ul className="list-disc ml-6">
            {files.map((f) => (
              <li key={f.id}>
                <a href={`/storage/${f.chemin}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {f.chemin}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
