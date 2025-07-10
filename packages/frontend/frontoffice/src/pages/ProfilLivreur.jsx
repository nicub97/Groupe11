import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STORAGE_BASE_URL = api.defaults.baseURL.replace("/api", "");

export default function ProfilLivreur() {
  const { user, token } = useAuth();
  const [livreur, setLivreur] = useState(null);
  const [files, setFiles] = useState({ identite: null, permis: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get(`/livreurs/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLivreur(res.data))
      .catch(() => setError("Erreur de chargement"));
  }, [user, token]);

  const statutLabel =
    livreur?.statut === "valide"
      ? "Validé"
      : livreur?.statut === "refuse"
      ? "Refusé"
      : "En attente";

  const handleUpload = async () => {
    if (!files.identite && !files.permis) return;
    const data = new FormData();
    if (files.identite) data.append("piece_identite_document", files.identite);
    if (files.permis) data.append("permis_conduire_document", files.permis);
    setUploading(true);
    try {
      const res = await api.post("/livreurs/justificatifs", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setLivreur(res.data.livreur);
      alert(
        "\u2705 Vos documents ont bien été reçus. Votre profil repasse en validation."
      );
      setFiles({ identite: null, permis: null });
    } catch {
      setError("Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (type) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    try {
      await api.delete(`/livreurs/justificatifs/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLivreur((prev) => ({
        ...prev,
        [`${type}_document`]: null,
      }));
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
          {livreur.piece_identite_document && (
            <li className="border p-2 rounded flex justify-between items-center">
              <a
                href={`${STORAGE_BASE_URL}/storage/${livreur.piece_identite_document}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Pièce d'identité
              </a>
              {livreur.statut === "refuse" && (
                <button
                  onClick={() => handleDelete("piece_identite")}
                  className="text-sm text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              )}
            </li>
          )}
          {livreur.permis_conduire_document && (
            <li className="border p-2 rounded flex justify-between items-center">
              <a
                href={`${STORAGE_BASE_URL}/storage/${livreur.permis_conduire_document}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Permis de conduire
              </a>
              {livreur.statut === "refuse" && (
                <button
                  onClick={() => handleDelete("permis_conduire")}
                  className="text-sm text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              )}
            </li>
          )}
        </ul>
        {livreur.statut === "refuse" && (
          <>
            {livreur.piece_identite_document || livreur.permis_conduire_document ? (
              <p className="text-sm text-gray-600">
                📂 Vous devez supprimer les justificatifs refusés avant d’en
                ajouter un nouveau.
              </p>
            ) : (
              <>
                <label className="block font-medium">Pièce d'identité</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFiles((f) => ({ ...f, identite: e.target.files[0] }))
                  }
                  className="mb-2 block"
                />

                <label className="block font-medium">Permis de conduire</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setFiles((f) => ({ ...f, permis: e.target.files[0] }))
                  }
                  className="mb-2 block"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-2"
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
