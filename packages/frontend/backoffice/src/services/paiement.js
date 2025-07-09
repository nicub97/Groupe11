import api from "./api";

export async function fetchPaiements() {
  const res = await api.get("/paiements");
  // ⚠️ L'API renvoie uniquement les paiements de l'utilisateur connecté.
  return res.data;
}
