import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function ChangePassword() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return setMessage("Le mot de passe est trop court.");
    if (newPassword !== confirmPassword) return setMessage("Les mots de passe ne correspondent pas.");

    try {
      await api.patch(`/utilisateurs/${user.id}`, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("Mot de passe mis à jour avec succès.");
      setSuccess(true);

      setTimeout(() => navigate("/profil/edit"), 1500);
    } catch {
      setMessage("Erreur lors du changement de mot de passe.");
      setSuccess(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold text-center">Changer mon mot de passe</h2>

      {message && (
        <p className={`text-center mt-2 ${success ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input type="password" placeholder="Mot de passe actuel" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="password" placeholder="Confirmation du mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded" required />
        <button type="submit" className="btn-primary w-full">Valider</button>
      </form>

      <div className="mt-4 text-center space-y-1">
        <Link to="/profil/edit" className="text-sm text-blue-600 hover:underline">
          ← Retour à la modification
        </Link>
        <br />
        <Link to="/profil/resetpassword" className="text-sm text-gray-600 hover:underline">
          Mot de passe oublié ? Réinitialiser ici.
        </Link>
      </div>
    </div>
  );
}
