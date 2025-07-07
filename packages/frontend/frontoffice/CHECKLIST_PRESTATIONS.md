✅ **Checklist – Frontoffice Prestations (client + prestataire)**

### 🗂️ Structure & Préparation

- [x] Nettoyer les anciens fichiers inutiles (déjà fait par Codex)
- [x] Créer la structure unifiée des pages (déjà fait par Codex)
- [ ] Mettre en place gestion utilisateur connecté (auth + rôle client/prestataire)
- [ ] Installer React Query (ou Axios) pour gestion des appels API
- [ ] Créer un layout de base (header/footer/route guards si besoin)

---

### 📄 Pages principales

#### `Catalogue.jsx` (prestations publiques)
- [ ] Récupérer la liste des prestations disponibles via `GET /prestations/catalogue`
- [ ] Afficher chaque prestation dans une `PrestationCard`
- [ ] Ajouter un bouton ou lien vers `PrestationDetail.jsx` (par ID)

#### `PrestationDetail.jsx`
- [ ] Récupérer la prestation via `GET /prestations/:id`
- [ ] Si client : bouton "Réserver" → `PATCH /prestations/:id/reserver`
- [ ] Si prestataire : boutons “Accepter / Refuser / Terminer” → `PATCH /prestations/:id/statut`
- [ ] Si prestation terminée (client) : formulaire `POST /evaluations`
- [ ] Si prestation terminée (prestataire) : bouton `POST /interventions`

#### `Prestations.jsx`
- [ ] Récupérer les prestations de l’utilisateur connecté via `GET /prestations`
- [ ] Filtrer selon rôle (client = réservées / prestataire = assignées)
- [ ] Lien vers `PrestationDetail.jsx`

---

### 📆 Disponibilités

#### `Disponibilites.jsx` (prestataire uniquement)
- [ ] Récupérer les créneaux via `GET /plannings`
- [ ] Ajouter un créneau via `POST /plannings`
- [ ] Supprimer un créneau via `DELETE /plannings/:id`
- [ ] Afficher message d’erreur si chevauchement (géré côté backend)

---

### 📝 Publication

#### `PublierPrestation.jsx`
- [ ] Créer formulaire de publication
- [ ] Soumettre via `POST /prestations`
- [ ] Message de succès ou redirection

---

### 📄 Factures

#### `Factures.jsx`
- [ ] Récupérer la liste des factures via `GET /factures-prestataire`
- [ ] Afficher mois + montant
- [ ] Bouton "Télécharger PDF"

---

### ♻️ Composants partagés (à créer dans `/components/`)
- [ ] `PrestationCard.jsx`
- [ ] `PrestationStatusBadge.jsx`
- [ ] `EvaluationForm.jsx`
- [ ] `PlanningForm.jsx`
- [ ] `FactureCard.jsx`
- [ ] `ActionButtons.jsx` (prestataire)

---
