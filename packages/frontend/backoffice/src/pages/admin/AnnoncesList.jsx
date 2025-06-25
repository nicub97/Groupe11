import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AnnoncesList() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/annonces')
      .then(res => setAnnonces(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id) {
    if (!window.confirm("Confirmer la suppression de cette annonce ?")) return;
    api.delete(`/annonces/${id}`)
      .then(() => setAnnonces(prev => prev.filter(a => a.id !== id)))
      .catch(err => console.error(err));
  }

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des annonces</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">Titre</th>
              <th className="p-3">Type</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {annonces.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{a.titre}</td>
                <td className="p-3">{a.type}</td>
                <td className="p-3">{a.prix_propose} €</td>
                <td className="p-3 capitalize">{a.statut}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
