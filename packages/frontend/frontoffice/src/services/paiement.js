import api from "./api";

export async function createCheckoutSession(payload, _unused, context) {
  const res = await api.post(
    `/paiements/checkout-session?context=${context}`,
    payload,
  );
  return res.data;
}

export async function fetchPaiements() {
  const res = await api.get("/paiements");
  return res.data;
}