import { useEffect, useState } from "react";
import api from "../../services/api";

const STORAGE_BASE_URL = api.defaults.baseURL.replace("/api", "");

export default function AdminPrestataires() {
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justifs, setJustifs] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [showEval, setShowEval] = useState({});
  const [search, setSearch] = useState("");

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

  const voirEvaluations = async (utilisateurId) => {
    try {
      if (!evaluations[utilisateurId]) {
        const res = await api.get(`/evaluations/cible/${utilisateurId}`);
        setEvaluations((prev) => ({ ...prev, [utilisateurId]: res.data }));
      }
      setShowEval((prev) => ({ ...prev, [utilisateurId]: !prev[utilisateurId] }));
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
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher..."
        className="border p-2 mb-4 w-full max-w-xs"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Motif de refus</th>
              <th className="p-3">Inscription</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prestataires
              .filter(
                (p) =>
                  p.utilisateur?.nom.toLowerCase().includes(search.toLowerCase()) ||
                  p.utilisateur?.prenom.toLowerCase().includes(search.toLowerCase())
              )
              .map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 align-top">
                <td className="p-3">{p.utilisateur?.prenom} {p.utilisateur?.nom}</td>
                <td className="p-3">{p.utilisateur?.email}</td>
                <td className="p-3 capitalize">{p.statut}</td>
                <td className="p-3 text-sm">{p.motif_refus || ""}</td>
                <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => voirJustifs(p.utilisateur_id)} className="text-blue-600 hover:underline">
                    Voir justificatifs
                  </button>
                  <button onClick={() => voirEvaluations(p.utilisateur_id)} className="text-indigo-600 hover:underline">
                    Voir évaluations
                  </button>
                  {p.statut === "en_attente" && (
                    <>
                      <button onClick={() => valider(p.utilisateur_id)} className="text-green-600 hover:underline">
                        Valider
                      </button>
                      <button onClick={() => refuser(p.utilisateur_id)} className="text-red-600 hover:underline">
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
                <a
                  href={`${STORAGE_BASE_URL}/storage/${f.chemin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {f.chemin}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {Object.entries(showEval).map(([id, visible]) => (
        visible && evaluations[id] && (
          <div key={`eval-${id}`} className="mt-4">
            <h2 className="font-semibold">Évaluations utilisateur {id}</h2>
            <ul className="list-disc ml-6">
              {evaluations[id].map((e) => (
                <li key={e.id} className="mb-2">
                  <span className="font-medium">{e.prestation.type_prestation}</span>
                  {" - "}
                  {new Date(e.prestation.date_heure).toLocaleDateString()} - {e.note}/5 ⭐
                  {e.commentaire_client && <p>{e.commentaire_client}</p>}
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
}
