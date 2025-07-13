# Backend API Documentation

## Overview
This document describes all API routes defined in `routes/api.php` for the Laravel backend. It includes HTTP methods, endpoints, called controller methods, expected parameters, authentication/role requirements and basic response information.

All routes are prefixed with `/api` when served by Laravel. Authentication uses Sanctum tokens. Unless stated otherwise, responses are returned in JSON format.

## Authentication

| Method | URL | Controller@method | Description | Middleware/Roles | Success Status |
|-------|-----|-----------------|-------------|-----------------|---------------|
| POST | `/login` | `AuthController@login` | Login with `email` or `identifiant` and `password`. | None | 200 |
| POST | `/register` | `AuthController@register` | Register a new user (client, commercant, livreur, prestataire or admin). | None | 201 |
| GET | `/verify-email/{id}/{hash}` | `EmailVerificationController@verify` | Confirm email address. | `signed` | 200 |

### Logout
| POST | `/logout` | `AuthController@logout` | Revoke current token. | `auth:sanctum` | 200 |

## Admin Routes
Middleware: `auth:sanctum`, `role:admin`

| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| POST | `/admin/register` | `AuthController@registerAdmin` | Create an administrator account. |
| GET | `/admin/statistiques` | `StatAdminController@index` | Dashboard statistics. |
| POST | `/utilisateurs` | `UtilisateurController@store` | Create user. |
| PATCH | `/utilisateurs/{id}` | `UtilisateurController@update` | Update any user. |
| POST | `/notifications` | `NotificationController@store` | Create notification. |
| POST | `/entrepots` | `EntrepotController@store` | Create warehouse. |
| PATCH | `/entrepots/{id}` | `EntrepotController@update` | Update warehouse. |
| DELETE | `/entrepots/{id}` | `EntrepotController@destroy` | Delete warehouse. |
| POST | `/boxes` | `BoxController@store` | Create box in warehouse. |
| PATCH | `/boxes/{id}` | `BoxController@update` | Update box. |
| DELETE | `/boxes/{id}` | `BoxController@destroy` | Delete box. |
| PATCH | `/annonces/{id}` | `AnnonceController@update` | Update any advert. |
| DELETE | `/annonces/{id}` | `AnnonceController@destroy` | Delete advert. |
| GET | `/clients` | `ClientController@index` | List clients. |
| GET | `/clients/{id}` | `ClientController@show` | View client by user id. |
| PATCH | `/clients/{id}` | `ClientController@update` | Update client. |
| PATCH | `/prestataires/{id}/valider` | `PrestataireValidationController@valider` | Validate provider account. |
| PATCH | `/prestations/{id}/assigner` | `PrestationController@assigner` | Assign provider to a service. |
| GET | `/admin/factures-prestataire` | `FacturePrestataireController@index` | List providers invoices. |
| GET | `/admin/factures-prestataire/{id}` | `FacturePrestataireController@show` | View provider invoice. |

## Client Routes
Middleware: `auth:sanctum`, roles `admin,client`

| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/clients` | `ClientController@index` | List clients. |
| GET | `/clients/{id}` | `ClientController@show` | View client profile. |
| PATCH | `/clients/{id}` | `ClientController@update` | Update client profile (address or phone). |
| POST | `/evaluations` | `EvaluationController@store` | Create evaluation of an intervention. |
| POST | `/factures` | `FactureController@store` | Create invoice manually. |
| POST | `/annonces/{id}/reserver` | `AnnonceController@reserverAnnonce` | Reserve a merchant advert. |

## Livreur Routes
Middleware: `auth:sanctum`, roles `admin,livreur`

| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| POST | `/colis` | `ColisController@store` | Create package. |
| PATCH | `/colis/{id}/box` | `ColisController@affecterBox` | Assign box to package. |
| GET | `/livreurs/{id}` | `LivreurController@show` | View deliverer profile. |
| PATCH | `/livreurs/{id}` | `LivreurController@update` | Update deliverer. |
| GET | `/annonces-disponibles` | `AnnonceController@annoncesDisponibles` | List adverts compatible with deliverer routes. |
| POST | `/annonces/{id}/accepter` | `AnnonceController@accepterAnnonce` | Accept delivery advert. |
| GET | `/mes-trajets` | `TrajetLivreurController@index` | List deliverer routes. |
| POST | `/mes-trajets` | `TrajetLivreurController@store` | Add route. |
| DELETE | `/mes-trajets/{id}` | `TrajetLivreurController@destroy` | Delete route. |

## Commercant Routes
Middleware: `auth:sanctum`, roles `admin,commercant`

| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/commercants/{id}` | `CommercantController@show` | View merchant profile. |
| PATCH | `/commercants/{id}` | `CommercantController@update` | Update merchant profile. |

## Prestataire Routes
Middleware: `auth:sanctum`, roles `admin,prestataire`

| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/prestataires/{id}` | `PrestataireController@show` | View provider profile. |
| PATCH | `/prestataires/{id}` | `PrestataireController@update` | Update provider profile. |
| POST | `/prestations` | `PrestationController@store` | Publish a new service (provider must be validated). |
| POST | `/prestataires/{id}/justificatifs` | `PrestataireValidationController@store` | Upload proof document. |
| GET | `/prestataires/{id}/justificatifs` | `PrestataireValidationController@index` | List uploaded documents. |

## Authenticated Routes
Middleware: `auth:sanctum`

### Users
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/utilisateurs` | `UtilisateurController@index` | List users. |
| GET | `/utilisateurs/{id}` | `UtilisateurController@show` | Show user. |
| PATCH | `/utilisateurs/{id}` | `UtilisateurController@update` | Update own profile or by admin. |
| DELETE | `/utilisateurs/{id}` | `UtilisateurController@destroy` | Delete user. |

### Annonces
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/annonces` | `AnnonceController@index` | List adverts with optional filters (`type`, `search`, `sort`). |
| GET | `/annonces/{id}` | `AnnonceController@show` | Show advert details. |
| GET | `/mes-annonces` | `AnnonceController@mesAnnonces` | List adverts created by authenticated client or merchant. |
| POST | `/annonces` | `AnnonceController@store` | Create advert. |
| PATCH | `/annonces/{id}` | `AnnonceController@update` | Update own advert. |
| DELETE | `/annonces/{id}` | `AnnonceController@destroy` | Delete own advert. |
| POST | `/annonces/{annonce}/payer` | `AnnonceController@payer` | Start Stripe checkout for advert. (`can:pay,annonce`). |
| GET | `/annonces/{annonce}/paiement-callback` | `AnnonceController@paiementCallback` | Stripe callback URL. |

### Commandes
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/commandes` | `CommandeController@index` | List orders. |
| GET | `/commandes/{id}` | `CommandeController@show` | Show order. |
| POST | `/commandes` | `CommandeController@store` | Create order. |

### Paiements
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/paiements` | `PaiementController@index` | List payments of current user. |
| GET | `/paiements/{id}` | `PaiementController@show` | Show a payment. |
| POST | `/paiements` | `PaiementController@store` | Record a payment. |
| POST | `/paiements/checkout-session` | `PaiementController@createCheckoutSession` | Create Stripe checkout session. |

### Colis
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/colis` | `ColisController@index` | List packages. |
| GET | `/colis/{id}` | `ColisController@show` | Show package details. |

### Boxes & Entrepôts
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/boxes` | `BoxController@index` | List boxes (optional `entrepot_id` filter). |
| PATCH | `/boxes/{id}` | `BoxController@update` | Update box. |
| DELETE | `/boxes/{id}` | `BoxController@destroy` | Delete box. |
| GET | `/entrepots` | `EntrepotController@index` | List warehouses. |
| GET | `/entrepots/{id}` | `EntrepotController@show` | Show warehouse. |
| PATCH | `/entrepots/{id}` | `EntrepotController@update` | Update warehouse. |
| DELETE | `/entrepots/{id}` | `EntrepotController@destroy` | Delete warehouse. |

### Factures & Évaluations
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/factures` | `FactureController@index` | List invoices for current user. |
| GET | `/factures/{id}` | `FactureController@show` | Show invoice. |
| GET | `/evaluations` | `EvaluationController@index` | List evaluations. |
| GET | `/evaluations/cible/{utilisateur_id}` | `EvaluationController@showByCible` | Evaluations targeting provider `utilisateur_id`. |
| GET | `/evaluations/{id}` | `EvaluationController@show` | Show evaluation. |

### Notifications & Communications
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/notifications` | `NotificationController@index` | List notifications for current user. |
| POST | `/notifications/{id}/lire` | `NotificationController@markAsRead` | Mark notification as read. |
| GET | `/communications/{destinataire_id}` | `CommunicationController@index` | List messages with recipient. |
| POST | `/communications` | `CommunicationController@store` | Send message. |
| POST | `/communications/{id}/lire` | `CommunicationController@markAsRead` | Mark message as read. |

### Étapes de Livraison
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/mes-etapes` | `EtapeLivraisonController@mesEtapes` | List delivery steps for connected deliverer. |
| GET | `/etapes/{id}` | `EtapeLivraisonController@show` | Show delivery step. |
| PATCH | `/etapes/{id}/statut` | `EtapeLivraisonController@changerStatut` | Change step status. |
| PATCH | `/etapes/{id}/cloturer` | `EtapeLivraisonController@cloturerEtape` | Close a step. |
| GET | `/etapes/{id}/suivante` | `EtapeLivraisonController@etapeSuivante` | Get next step. |
| POST | `/valider-code-box` | `EtapeLivraisonController@validerCode` | Validate deposit or withdrawal code. |
| GET | `/etapes/{id}/codes` | `EtapeLivraisonController@codes` | List codes for a step. |

### Divers
| Method | URL | Controller@method | Description |
|-------|-----|-----------------|-------------|
| GET | `/livreurs` | `UtilisateurController@indexLivreurs` | List all deliverers. |
| GET | `/portefeuille` | `PortefeuilleController@show` | Wallet balance for user. |
| POST | `/portefeuille/credit` | `PortefeuilleController@credit` | Credit wallet. |
| POST | `/portefeuille/debit` | `PortefeuilleController@debit` | Debit wallet. |
| POST | `/adresses-livraison` | `AdresseLivraisonController@store` | Add delivery address. |
| GET | `/prestataires` | `PrestataireController@index` | List validated providers. |
| GET | `/prestations` | `PrestationController@index` | List services for current user. |
| GET | `/prestations/catalogue` | `PrestationController@catalogue` | List all available services. |
| GET | `/prestations/{id}` | `PrestationController@show` | Show service details. |
| PUT | `/prestations/{id}` | `PrestationController@update` | Update service (client). |
| DELETE | `/prestations/{id}` | `PrestationController@destroy` | Delete service. |
| PATCH | `/prestations/{id}/statut` | `PrestationController@changerStatut` | Provider changes service status. |
| GET | `/plannings` | `PlanningPrestataireController@index` | List provider availabilities. |
| POST | `/plannings` | `PlanningPrestataireController@store` | Add availability slot. |
| DELETE | `/plannings/{id}` | `PlanningPrestataireController@destroy` | Remove availability. |
| GET | `/interventions` | `InterventionController@index` | List interventions for client or provider. |
| POST | `/interventions` | `InterventionController@store` | Validate an intervention. |
| GET | `/factures-prestataire` | `FacturePrestataireController@mesFactures` | Provider invoice list. |
| POST | `/factures-prestataire/{mois}` | `FacturePrestataireController@genererFactureMensuelle` | Generate monthly invoice. |
| POST | `/email/verification-notification` | `EmailVerificationNotificationController@store` | Resend verification link. |

## Models Overview
The following Eloquent models are used in inputs or responses:

- `Utilisateur`: id, nom, prenom, email/identifiant, password (hashed), role, pays, telephone, adresse_postale.
- `Client`: utilisateur_id, adresse, telephone.
- `Commercant`: utilisateur_id, nom_entreprise, siret.
- `Prestataire`: utilisateur_id, domaine, description, valide.
- `Livreur`: utilisateur_id, piece_identite, permis_conduire, piece_identite_document, permis_conduire_document.
- `Annonce`: type, titre, description, prix_propose, photo, id_client, id_commercant, id_livreur_reservant, entrepot_depart_id, entrepot_arrivee_id, is_paid.
- `Entrepot`: nom, adresse, ville, code_postal, pays.
- `Box`: entrepot_id, code_box, est_occupe.
- `EtapeLivraison`: annonce_id, livreur_id, lieu_depart, lieu_arrivee, statut, est_client, est_commercant, est_mini_etape.
- `CodeBox`: box_id, etape_livraison_id, type, code_temporaire, utilise, mail_envoye_at.
- `Portefeuille`: utilisateur_id, solde.
- `Paiement`: utilisateur_id, commande_id, annonce_id, montant, sens, type, reference, statut.
- `Facture`: utilisateur_id, montant_total, chemin_pdf, date_emission.
- `FacturePrestataire`: prestataire_id, mois, montant_total, chemin_pdf.
- `Prestation`: prestataire_id, client_id, type_prestation, description, date_heure, duree_estimee, tarif, statut.
- `PlanningPrestataire`: prestataire_id, date_disponible, heure_debut, heure_fin.
- `Intervention`: prestation_id, commentaire_client, note, statut_final.
- `Notification`: utilisateur_id, titre, contenu, cible_type, cible_id, lu_at.
- `TrajetLivreur`: livreur_id, entrepot_depart_id, entrepot_arrivee_id, disponible_du, disponible_au.

## Error Handling
Most endpoints return `404` when a resource is not found or `403` when the authenticated user lacks permissions. Validation failures return `422` with error details. Successful creations usually respond with `201` and the created resource.