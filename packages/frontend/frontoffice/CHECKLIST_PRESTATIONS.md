✅ **Checklist – Frontoffice Prestations (client + prestataire)**

### 🗂️ Structure & Préparation

- [x] Nettoyer les anciens fichiers inutiles (déjà fait par Codex)
- [x] Créer la structure unifiée des pages (déjà fait par Codex)
- [x] Mettre en place gestion utilisateur connecté (auth + rôle client/prestataire)
- [x] Utiliser Axios pour la gestion des appels API (React Query retiré)
- [x] Créer un layout de base (header/footer/route guards si besoin)

---

### 📄 Pages principales

#### `Catalogue.jsx` (prestations publiques)
- [x] Récupérer la liste des prestations disponibles via `GET /prestations/catalogue`
- [x] Afficher chaque prestation dans une `PrestationCard`
- [x] Ajouter un bouton ou lien vers `PrestationDetail.jsx` (par ID)

#### `PrestationDetail.jsx`
- [x] Récupérer la prestation via `GET /prestations/:id`
- [x] Si client : bouton "Réserver" → `PATCH /prestations/:id/reserver`
- [x] Si prestataire : boutons “Accepter / Refuser / Terminer” → `PATCH /prestations/:id/statut`
- [x] Si prestation terminée (client) : formulaire `POST /evaluations`
- [x] Si prestation terminée (prestataire) : bouton `POST /interventions`

#### `Prestations.jsx`
- [x] Récupérer les prestations de l’utilisateur connecté via `GET /prestations`
- [x] Filtrer selon rôle (client = réservées / prestataire = assignées)
- [x] Lien vers `PrestationDetail.jsx`

---

### 📆 Disponibilités

#### `Disponibilites.jsx` (prestataire uniquement)
- [x] Récupérer les créneaux via `GET /plannings`
- [x] Ajouter un créneau via `POST /plannings`
- [x] Supprimer un créneau via `DELETE /plannings/:id`
- [x] Afficher message d’erreur si chevauchement (géré côté backend)

---

### 📝 Publication

#### `PublierPrestation.jsx`
- [x] Créer formulaire de publication
- [x] Soumettre via `POST /prestations`
- [x] Message de succès ou redirection

---

### 📄 Factures

#### `Factures.jsx`
- [x] Récupérer la liste des factures via `GET /factures-prestataire`
- [x] Afficher mois + montant
- [x] Bouton "Télécharger PDF"

---

### ♻️ Composants partagés (à créer dans `/components/`)
- [x] `PrestationCard.jsx`
- [ ] `PrestationStatusBadge.jsx`
- [ ] `EvaluationForm.jsx`
- [ ] `PlanningForm.jsx`
- [ ] `FactureCard.jsx`
- [ ] `ActionButtons.jsx` (prestataire)

---
