import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Factures() {
  const { token } = useAuth();
  const [factures, setFactures] = useState([]);
  const [mois, setMois] = useState("");
  const [message, setMessage] = useState("");

  const fetchFactures = async () => {
    try {
      const res = await api.get("/factures-prestataire", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFactures(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des factures :", err);
    }
  };

  const genererFacture = async () => {
    if (!mois) return;
    try {
      await api.post(`/factures-prestataire/${mois}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Facture générée !");
      fetchFactures();
    } catch (err) {
      console.error("Erreur lors de la génération de la facture :", err);
      setMessage("❌ Erreur lors de la génération.");
    }
  };

  useEffect(() => {
    fetchFactures();
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-4">Mes factures mensuelles</h2>

      {message && <p className="mb-4 text-sm">{message}</p>}

      <div className="flex items-end gap-2 mb-6">
        <input
          type="month"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={genererFacture}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Générer ma facture
        </button>
      </div>

      {factures.length === 0 ? (
        <p>Aucune facture disponible.</p>
      ) : (
        <ul className="space-y-4">
          {factures.map((facture) => (
            <li key={facture.id} className="p-4 border rounded bg-white shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">📅 Mois : {facture.mois}</p>
                <p className="text-sm text-gray-600">💰 Total : {facture.montant_total} €</p>
              </div>
              <a
                href={`/storage/${facture.chemin_pdf}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Télécharger PDF
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
