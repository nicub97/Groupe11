import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import PrestationStatusBadge from "./PrestationStatusBadge";

export default function PrestationCard({ prestation }) {
  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="text-lg font-semibold">{prestation.type_prestation}</h3>
      <p className="my-2">{prestation.description}</p>
      <p>
        Date : {new Date(prestation.date_heure).toLocaleString()} - Tarif :
        {" "}
        {prestation.tarif} €
      </p>
      <PrestationStatusBadge status={prestation.statut} />
      {prestation.intervention && prestation.intervention.note !== null && (
        <span className="ml-2 px-2 py-1 rounded bg-green-200 text-green-800 text-sm">
          Évaluée
        </span>
      )}
      <Link to={`/prestations/${prestation.id}`} className="text-blue-600 underline">
        Voir détail
      </Link>
    </div>
  );
}

PrestationCard.propTypes = {
  prestation: PropTypes.object.isRequired,
};