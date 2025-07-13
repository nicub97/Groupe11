import PropTypes from "prop-types";

// Carte affichant les informations d'une facture mensuelle
export default function FactureCard({ facture }) {
  const { mois, montant, pdf_url, chemin_pdf } = facture;
  const url = pdf_url || chemin_pdf;

  return (
    <div className="flex justify-between items-center border p-4 rounded mb-2">
      <div>
        <p className="font-semibold">{mois}</p>
        <p className="text-gray-600">{montant} €</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
      >
        Télécharger PDF
      </a>
    </div>
  );
}

FactureCard.propTypes = {
  facture: PropTypes.object.isRequired,
};