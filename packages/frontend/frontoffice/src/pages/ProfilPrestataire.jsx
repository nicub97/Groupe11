import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STORAGE_BASE_URL = api.defaults.baseURL.replace("/api", "");

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
      await api.post("/prestataires/justificatifs", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const list = await api.get("/prestataires/justificatifs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJustificatifs(list.data);

      const profil = await api.get(`/prestataires/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrestataire(profil.data);
      alert(
        "\u2705 Vos documents ont bien été reçus. Votre profil repasse en cours de validation."
      );
      setNewFile(null);
    } catch {
      setUploadError("Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
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
      {prestataire.statut === "refuse" && (
        <p className="text-red-600">
          {prestataire.motif_refus && (
            <span>Motif : {prestataire.motif_refus}</span>
          )}
          {!prestataire.motif_refus && <span>Votre profil a été refusé.</span>}
        </p>
      )}
      {prestataire.statut === "en_attente" && (
        <p className="text-orange-600">Votre profil est en attente de validation.</p>
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
              <a
                href={`${STORAGE_BASE_URL}/storage/${j.chemin}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {j.chemin.split("/").pop()}
              </a>
              {/* Le justificatif refusé est désormais supprimé côté admin */}
            </li>
          ))}
        </ul>
        {prestataire.statut === "refuse" && (
          <>
            <label className="block font-medium">Justificatif (RIB, RC Pro, etc.)</label>
            <input
              type="file"
              onChange={(e) => setNewFile(e.target.files[0])}
              className="mb-2 block"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? "Envoi..." : "Ajouter"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
