import PropTypes from "prop-types";

// Badge coloré indiquant le statut d'une prestation
export default function PrestationStatusBadge({ status }) {
  const colors = {
    "en attente": "bg-gray-200 text-gray-800",
    en_attente: "bg-gray-200 text-gray-800",
    acceptée: "bg-green-200 text-green-800",
    refusée: "bg-red-200 text-red-800",
    terminée: "bg-blue-200 text-blue-800",
  };

  const colorClass = colors[status] || "bg-gray-200 text-gray-800";

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${colorClass}`}>{status}</span>
  );
}

PrestationStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};