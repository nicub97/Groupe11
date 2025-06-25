import api from "./api";

export async function effectuerPaiement(annonceId, montant, token) {
  const res = await api.post(
    "/paiements",
    {
      annonce_id: annonceId,
      montant,
      sens: "debit",
      type: "portefeuille",
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
