import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { effectuerPaiement } from "../services/paiement";

export default function PaiementForm({ annonceId, montant, onPaid }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePaiement = async () => {
    setLoading(true);
    setError("");
    try {
      await effectuerPaiement(annonceId, montant, token);
      if (onPaid) onPaid();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePaiement}
        disabled={loading}
        className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Paiement..." : "Payer"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

PaiementForm.propTypes = {
  annonceId: PropTypes.number.isRequired,
  montant: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onPaid: PropTypes.func,
};
