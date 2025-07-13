import { useState } from "react";
import PropTypes from "prop-types";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Boutons d'actions pour le prestataire selon le statut de la prestation
export default function ActionButtons({ prestationId, statut, onChange }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const changerStatut = async (nouveauStatut) => {
    setLoading(true);
    try {
      await api.patch(
        `/prestations/${prestationId}/statut`,
        { statut: nouveauStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onChange) onChange();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du changement de statut.");
    } finally {
      setLoading(false);
    }
  };

  if (!statut) return null;

  return (
    <div className="space-x-2 mt-2">
      {(statut === "en attente" || statut === "en_attente") && (
        <>
          <button
            onClick={() => changerStatut("acceptée")}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            Accepter
          </button>
          <button
            onClick={() => changerStatut("refusée")}
            disabled={loading}
            className="btn-danger disabled:opacity-50"
          >
            Refuser
          </button>
        </>
      )}

      {statut === "acceptée" && (
        <button
          onClick={() => changerStatut("terminée")}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          Terminer
        </button>
      )}
    </div>
  );
}

ActionButtons.propTypes = {
  prestationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  statut: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};