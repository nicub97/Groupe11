import { useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Formulaire d\'évaluation d\'une prestation terminée
export default function EvaluationForm({ interventionId, onSubmit }) {
  const { token } = useAuth();
  const [note, setNote] = useState(1);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(
        "/evaluations",
        {
          intervention_id: interventionId,
          note,
          commentaire_client: commentaire,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentaire("");
      setNote(1);
      if (onSubmit) onSubmit();
    } catch (err) {
      setError("Erreur lors de l'envoi de l'évaluation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <label className="block">
        Note :
        <select
          value={note}
          onChange={(e) => setNote(Number(e.target.value))}
          className="ml-2 border p-1 rounded"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder="Commentaire"
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}

EvaluationForm.propTypes = {
  interventionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onSubmit: PropTypes.func,
};
