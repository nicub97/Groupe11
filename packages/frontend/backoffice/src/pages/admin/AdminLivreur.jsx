import { useEffect, useState } from "react";
import api from "../../services/api";

const STORAGE_BASE_URL = api.defaults.baseURL.replace("/api", "");

const labelType = {
  piece_identite: "Pièce d'identité",
  permis_conduire: "Permis de conduire",
};

export default function AdminLivreur() {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justifs, setJustifs] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    fetchLivreurs();
  }, []);

  async function fetchLivreurs() {
    try {
      const res = await api.get("/admin/livreurs");
      setLivreurs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const voirJustifs = async (id) => {
    try {
      const res = await api.get(`/livreurs/${id}/justificatifs`);
      setJustifs((prev) => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const valider = async (id) => {
    if (!window.confirm("Valider ce livreur ?")) return;
    try {
      await api.post(`/admin/livreurs/${id}/valider`);
      fetchLivreurs();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de validation");
    }
  };

  const refuser = async (id) => {
    const motif = prompt("Motif du refus ?", "");
    if (motif === null) return;
    try {
      await api.post(`/admin/livreurs/${id}/refuser`, { motif_refus: motif });
      fetchLivreurs();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de refus");
    }
  };

  const filteredLivreurs = livreurs.filter((l) => {
    const term = search.toLowerCase();
    const user = l.utilisateur || {};
    const matchesText =
      (user.nom || "").toLowerCase().includes(term) ||
      (user.prenom || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter ? l.statut === statusFilter : true;
    const matchesCity = cityFilter
      ? (user.adresse_postale || "")
          .toLowerCase()
          .includes(cityFilter.toLowerCase())
      : true;
    return matchesText && matchesStatus && matchesCity;
  });

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Livreurs</h1>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="border p-2 rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="valide">Validé</option>
          <option value="en_attente">En attente</option>
          <option value="refuse">Refusé</option>
        </select>
        <input
          type="text"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          placeholder="Ville ou adresse"
          className="border p-2 rounded"
        />
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setCityFilter("");
          }}
          className="admin-btn-secondary"
        >
          Réinitialiser les filtres
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Valide</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Motif de refus</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLivreurs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-gray-50 align-top">
                <td className="p-3">{l.utilisateur?.prenom} {l.utilisateur?.nom}</td>
                <td className="p-3">{l.utilisateur?.email}</td>
                <td className="p-3">{l.valide ? "Oui" : "Non"}</td>
                <td className="p-3 capitalize">{l.statut}</td>
                <td className="p-3">
                  <button onClick={() => voirJustifs(l.utilisateur_id)} className="text-blue-600 hover:underline">
                    Voir justificatifs
                  </button>
                </td>
                <td className="p-3 text-sm">{l.motif_refus || ""}</td>
                <td className="p-3 space-x-2">
                  {l.statut === "en_attente" && (
                    <>
                      <button
                        onClick={() => valider(l.utilisateur_id)}
                        className="text-green-600 hover:underline"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => refuser(l.utilisateur_id)}
                        className="text-red-600 hover:underline"
                      >
                        Refuser
                      </button>
                    </>
                  )}
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
                <span className="mr-2 font-medium">
                  {labelType[f.type] || f.type}
                </span>
                –
                <a
                  href={`${STORAGE_BASE_URL}/storage/${f.chemin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-blue-600 underline"
                >
                  Télécharger fichier
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}