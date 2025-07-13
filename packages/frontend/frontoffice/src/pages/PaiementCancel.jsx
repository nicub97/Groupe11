import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaiementCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    const context = localStorage.getItem("paymentContext");
    if (context === "creer") {
      localStorage.removeItem("annonceForm");
      localStorage.removeItem("annoncePhoto");
      localStorage.removeItem("paymentContext");
      navigate("/annonces/creer?cancel=1", { replace: true });
    } else if (context === "reserver") {
      const annonceId = localStorage.getItem("reservationAnnonceId");
      localStorage.removeItem("reservationEntrepot");
      localStorage.removeItem("reservationAnnonceId");
      localStorage.removeItem("paymentContext");
      if (annonceId) {
        navigate(`/annonces/${annonceId}/reserver?cancel=1`, { replace: true });
      } else {
        navigate("/annonces", { replace: true });
      }
    } else if (context === "payer") {
      localStorage.removeItem("payerAnnonceId");
      localStorage.removeItem("paymentContext");
      navigate("/mes-annonces?cancel=1", { replace: true });
    } else if (context === "prestation_reserver") {
      const prestationId = localStorage.getItem("prestationId");
      localStorage.removeItem("prestationId");
      localStorage.removeItem("paymentContext");
      if (prestationId) {
        navigate(`/prestations/${prestationId}?cancel=1`, { replace: true });
      } else {
        navigate("/prestations", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <p>Redirection...</p>
    </div>
  );
}