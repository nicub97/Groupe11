import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminLivreur() {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Livreurs</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="p-3">Nom</th>
              <th className="p-3">Email</th>
              <th className="p-3">Valide</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Motif de refus</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {livreurs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-gray-50 align-top">
                <td className="p-3">{l.utilisateur?.prenom} {l.utilisateur?.nom}</td>
                <td className="p-3">{l.utilisateur?.email}</td>
                <td className="p-3">{l.valide ? "Oui" : "Non"}</td>
                <td className="p-3 space-y-1">
                  {l.piece_identite_document && (
                    <a
                      href={`/storage/${l.piece_identite_document}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline block"
                    >
                      Pièce d'identité
                    </a>
                  )}
                  {l.permis_conduire_document && (
                    <a
                      href={`/storage/${l.permis_conduire_document}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline block"
                    >
                      Permis de conduire
                    </a>
                  )}
                </td>
                <td className="p-3 text-sm">{l.motif_refus || ""}</td>
                <td className="p-3 space-x-2">
                  {!l.valide && (
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
    </div>
  );
}
