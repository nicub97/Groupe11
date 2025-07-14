import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STORAGE_BASE_URL = api.defaults.baseURL.replace("/api", "");

export default function ProfilLivreur() {
  const { user, token } = useAuth();
  const [livreur, setLivreur] = useState(null);
  const [justifs, setJustifs] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get(`/livreurs/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLivreur(res.data))
      .catch(() => setError("Erreur de chargement"));

    api
      .get(`/livreurs/${user.id}/justificatifs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setJustifs(res.data))
      .catch(() => setJustifs([]));
  }, [user, token]);

  const statutLabel =
    livreur?.statut === "valide"
      ? "Validé"
      : livreur?.statut === "refuse"
      ? "Refusé"
      : "En attente";

  const handleUpload = async () => {
    if (!file) return;
    const data = new FormData();
    data.append("fichier", file);
    setUploading(true);
    try {
      const res = await api.post("/livreurs/justificatifs", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setJustifs((prev) => [...prev, res.data]);
      if (livreur.statut === "refuse") {
        setLivreur((l) => ({ ...l, statut: "en_attente", motif_refus: null }));
      }
      alert("\u2705 Document envoyé.");
      setFile(null);
    } catch {
      setError("Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      await api.delete(`/livreurs/justificatifs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJustifs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      alert("Suppression impossible");
    }
  };

  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!livreur) return <p className="p-4">Chargement...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">Mon statut livreur</h2>
      <p>
        <strong>Statut :</strong> {statutLabel}
      </p>
      {livreur.statut === "refuse" && (
        <p className="text-red-600 font-semibold">
          {livreur.motif_refus ? `Motif : ${livreur.motif_refus}` : "Votre profil a été refusé."}
        </p>
      )}
      {livreur.statut === "en_attente" && (
        <p className="text-orange-600 font-semibold">Votre profil est en attente de validation.</p>
      )}
      <div className="mt-6 space-y-2">
        <h3 className="text-lg font-semibold">Mes justificatifs</h3>
        <ul className="space-y-2 mb-4">
          {justifs.map((j) => (
            <li key={j.id} className="border p-2 rounded flex justify-between items-center">
              <a
                href={`${STORAGE_BASE_URL}/storage/${j.chemin}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {j.type || j.chemin}
              </a>
              {livreur.statut === "refuse" && (
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
        {livreur.statut === "refuse" && (
          <>
            {justifs.some((j) => j.statut === "refuse") ? (
              <p className="text-sm text-gray-600">
                📂 Vous devez supprimer les justificatifs refusés avant d’en ajouter un nouveau.
              </p>
            ) : (
              <>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="mb-2 block"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary mt-2 disabled:opacity-50"
                >
                  {uploading ? "Envoi..." : "Envoyer"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}