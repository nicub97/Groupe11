import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
      setFiles({ identite: null, permis: null });
    } catch {
      setError("Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
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
        <p>
          Pièce d'identité : {livreur.piece_identite_document ? livreur.piece_identite_document.split("/").pop() : "Aucun"}
        </p>
        <p>
          Permis de conduire : {livreur.permis_conduire_document ? livreur.permis_conduire_document.split("/").pop() : "Aucun"}
        </p>
        <input type="file" onChange={(e) => setFiles(f => ({ ...f, identite: e.target.files[0] }))} className="block" />
        <input type="file" onChange={(e) => setFiles(f => ({ ...f, permis: e.target.files[0] }))} className="block mt-2" />
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-2"
        >
          {uploading ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
