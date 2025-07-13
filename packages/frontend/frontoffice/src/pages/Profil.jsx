import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Profil() {
  const { user, token, logout } = useAuth();
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (!window.confirm("Confirmez-vous la suppression de votre compte ?")) return;
    try {
      await api.delete(`/utilisateurs/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
    } catch {
      setMessage("Erreur lors de la suppression de compte.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">Mon profil</h2>
      {message && <p className="text-center text-red-600">{message}</p>}

      <div className="space-y-2">
        <p><strong>Nom :</strong> {user.nom}</p>
        <p><strong>Prénom :</strong> {user.prenom}</p>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Téléphone :</strong> {user.telephone}</p>
        <p><strong>Pays :</strong> {user.pays}</p>
        <p><strong>Adresse :</strong> {user.adresse_postale}</p>
      </div>

      <div className="text-center mt-4">
        <Link to="/profil/edit" className="btn-primary">
          Modifier mes informations
        </Link>
      </div>

      {user.role === "livreur" && (
        <div className="text-center">
          <Link to="/profil-livreur" className="text-blue-600 underline">
            Statut et gestion des justificatifs
          </Link>
        </div>
      )}

      {user.role === "prestataire" && (
        <div className="text-center">
          <Link to="/profil-prestataire" className="text-blue-600 underline">
            Statut et gestion des justificatifs
          </Link>
        </div>
      )}

      <hr className="my-6" />

      <button onClick={handleDelete} className="btn-danger w-full">
        Supprimer mon compte
      </button>
    </div>
  );
}