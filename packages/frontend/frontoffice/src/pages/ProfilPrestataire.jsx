import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ProfilPrestataire() {
  const { user, token } = useAuth();
  const [prestataire, setPrestataire] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [justificatifs, setJustificatifs] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get(`/prestataires/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setPrestataire(res.data))
      .catch(() => setError("Erreur de chargement"));
  }, [user, token]);

  useEffect(() => {
    if (!token || !user) return;
    api
      .get("/prestations", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const evals = res.data.filter(
          (p) =>
            p.prestataire_id === prestataire?.id &&
            p.statut === "terminée" &&
            p.intervention &&
            p.intervention.note !== null
        );
        setEvaluations(evals);
      })
      .catch(() => {});
  }, [token, user, prestataire]);

  useEffect(() => {
    if (!token) return;
    api
      .get("/prestataires/justificatifs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setJustificatifs(res.data))
      .catch(() => setUploadError("Erreur chargement des justificatifs"));
  }, [token]);

  const handleUpload = async () => {
    if (!newFile) return;
    setUploading(true);
    const data = new FormData();
    data.append("fichier", newFile);
    try {
      const res = await api.post("/prestataires/justificatifs", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setJustificatifs((prev) => [...prev, res.data]);
      setNewFile(null);
  } catch {
      setUploadError("Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      await api.delete(`/prestataires/justificatifs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJustificatifs((prev) => prev.filter((j) => j.id !== id));
  } catch {
      alert("Suppression impossible");
    }
  };

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!prestataire) return <p className="p-4">Chargement...</p>;

  const statutLabel =
    prestataire.statut === "valide"
      ? "Validé"
      : prestataire.statut === "refuse"
      ? "Refusé"
      : "En attente";

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">Mon statut prestataire</h2>
      <p>
        <strong>Statut :</strong> {statutLabel}
      </p>
      {prestataire.statut === "refuse" && prestataire.motif_refus && (
        <p className="text-red-600">
          Motif : {prestataire.motif_refus}
        </p>
      )}
      {evaluations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Mes évaluations</h3>
          <ul className="space-y-2">
            {evaluations.map((p) => (
              <li key={p.id} className="border p-2 rounded">
                <p className="font-medium">{p.type_prestation}</p>
                <p>
                  {new Date(p.date_heure).toLocaleDateString()} – {p.intervention?.note ?? "Non évaluée"}
                  /5 ⭐
                </p>
                {p.intervention?.commentaire_client && (
                  <p>{p.intervention.commentaire_client}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Mes justificatifs</h3>
        {uploadError && <p className="text-red-600">{uploadError}</p>}
        <ul className="space-y-2 mb-4">
          {justificatifs.map((j) => (
            <li
              key={j.id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <span>
                {j.chemin.split("/").pop()} - {j.statut || "en attente"}
              </span>
              {j.statut === "en_attente" && (
                <button
                  onClick={() => handleDelete(j.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>
        <input
          type="file"
          onChange={(e) => setNewFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Envoi..." : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
