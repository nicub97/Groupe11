<?php

namespace App\Http\Controllers;

use App\Models\EtapeLivraison;
use App\Models\CodeBox;
use App\Models\TrajetLivreur;
use App\Models\Entrepot;
use App\Models\Annonce;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\CodeDepotMail;
use App\Mail\CodeRetraitMail;
use App\Services\PaiementService;

class EtapeLivraisonController extends Controller
{
    public function show($id)
    {
        $user = Auth::user();

        $etape = EtapeLivraison::with(['annonce', 'codes'])->findOrFail($id);
        $annonce = $etape->annonce;

        if ($user->role === 'commercant' && $annonce->id_commercant !== $user->id) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        return response()->json($etape);
    }

    public function mesEtapes()
    {
        $user = Auth::user();

        if ($user->role !== 'livreur') {
            return response()->json(['message' => 'Accès réservé aux livreurs.'], 403);
        }

        $etapes = EtapeLivraison::with('annonce', 'codes')
            ->where('livreur_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($etapes);
    }
    public function changerStatut(Request $request, $id)
    {
        $user = Auth::user();

        $etape = EtapeLivraison::findOrFail($id);

        if ($etape->livreur_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'statut' => 'required|in:en_attente,en_cours,terminee',
        ]);

        $statuts = ['en_attente' => 0, 'en_cours' => 1, 'terminee' => 2];
        if ($statuts[$request->statut] < $statuts[$etape->statut]) {
            return response()->json(['message' => 'Transition invalide.'], 400);
        }

        $etape->statut = $request->statut;
        $etape->save();

        return response()->json(['message' => 'Statut mis à jour.', 'etape' => $etape]);
    }

    public function cloturerEtape($id)
    {
        $user = Auth::user();
        $etape = EtapeLivraison::with('annonce', 'codes')->findOrFail($id);

        if ($etape->livreur_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($etape->statut === 'terminee') {
            return response()->json(['message' => 'Étape déjà terminée.'], 200);
        }

        
        $codeDepot = $etape->codes->first(fn($c) => $c->type === 'depot' && $c->utilise);

        if (! $codeDepot) {
            return response()->json(['message' => 'Le dépôt n’a pas encore été validé.'], 400);
        }

        $etape->statut = 'terminee';
        $etape->save();

        return response()->json(['message' => 'Étape clôturée avec succès.']);
    }

    public function validerCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'type' => 'required|in:depot,retrait',
            'etape_id' => 'required|exists:etapes_livraison,id',
        ]);

        $user = Auth::user();
        $etape = EtapeLivraison::with('annonce')->findOrFail($request->etape_id);
        $annonce = $etape->annonce;

        if ($request->type === 'depot') {
            if ($etape->est_client && $user->id !== $annonce->id_client) {
                return response()->json([
                    'message' => 'Accès interdit pour valider ce code.'
                ], 403);
            }
            if ($etape->est_commercant && $user->id !== $annonce->id_commercant) {
                return response()->json([
                    'message' => 'Accès interdit pour valider ce code.'
                ], 403);
            }
        }

        if ($request->type === 'retrait') {
            if ($etape->est_client && $user->id !== $annonce->id_client) {
                return response()->json(['message' => 'Accès interdit pour valider ce code.'], 403);
            }
            if (! $etape->est_client && $user->id !== $etape->livreur_id) {
                return response()->json(['message' => 'Accès interdit pour valider ce code.'], 403);
            }
        }

        if ($user->role === 'commercant' && $annonce->id_commercant !== $user->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($request->type === 'retrait' && ! $etape->peutRetirer()) {
            return response()->json([
                'message' => 'Le colis n\'a pas encore été déposé.'
            ], 400);
        }

        $codeBox = CodeBox::where('etape_livraison_id', $etape->id)
            ->where('type', $request->type)
            ->where('code_temporaire', $request->code)
            ->where('utilise', false)
            ->first();

        if (!$codeBox) {
            return response()->json(['message' => 'Code invalide ou déjà utilisé'], 400);
        }

        $codeBox->utilise = true;
        $codeBox->save();

        if ($request->type === 'retrait') {
            $box = $codeBox->box;
            if ($box) {
                $box->est_occupe = false;
                $box->save();
            }
        }

        if (!$codeBox->mail_envoye_at) {
            $destinataire = null;
            $mailable = null;

            if ($codeBox->type === 'depot') {
                if ($etape->est_client) {
                    $destinataire = $etape->annonce->client;
                } elseif ($etape->est_commercant) {
                    $destinataire = $etape->annonce->commercant;
                } else {
                    $destinataire = $etape->livreur;
                }
                $mailable = new CodeDepotMail($codeBox);
            } else {
                if ($etape->est_client) {
                    $destinataire = $etape->annonce->client;
                } else {
                    $destinataire = $etape->livreur;
                }
                $mailable = new CodeRetraitMail($codeBox);
            }

            if ($destinataire) {
                Mail::to($destinataire->email)->send($mailable);
                $codeBox->mail_envoye_at = now();
                $codeBox->save();
            }
        }

        if (($etape->est_client || $etape->est_commercant) && $request->type === 'depot') {
            $etape->statut = 'terminee';
            $etape->save();

            if (
                $etape->est_mini_etape &&
                ! EtapeLivraison::where('annonce_id', $etape->annonce_id)
                    ->where('livreur_id', $etape->livreur_id)
                    ->where('est_mini_etape', false)
                    ->exists()
            ) {
                $trajet = TrajetLivreur::with(['entrepotDepart', 'entrepotArrivee'])
                    ->where('livreur_id', $etape->livreur_id)
                    ->where('entrepot_depart_id', $etape->annonce->entrepot_depart_id)
                    ->first();

                if ($trajet && $trajet->entrepotArrivee) {
                    $etapeLivreur = EtapeLivraison::create([
                        'annonce_id' => $etape->annonce_id,
                        'livreur_id' => $etape->livreur_id,
                        'lieu_depart' => $trajet->entrepotDepart->ville,
                        'lieu_arrivee' => $trajet->entrepotArrivee->ville,
                        'statut' => 'en_cours',
                        'est_client' => false,
                        'est_commercant' => false,
                        'est_mini_etape' => false,
                    ]);

                    $boxRetrait = $codeBox->box;
                    if ($boxRetrait) {
                        CodeBox::create([
                            'box_id' => $boxRetrait->id,
                            'etape_livraison_id' => $etapeLivreur->id,
                            'type' => 'retrait',
                            'code_temporaire' => Str::random(6),
                        ]);

                        $boxDepot = Entrepot::where('ville', $etapeLivreur->lieu_arrivee)
                            ->first()?->boxes()
                            ->where('est_occupe', false)
                            ->where('id', '!=', $boxRetrait->id)
                            ->first();

                        if ($boxDepot) {
                            CodeBox::createDepotCode($etapeLivreur, $boxDepot);
                        }
                    }
                }
            }

            return response()->json(['message' => 'Code de dépôt validé. Étape clôturée.']);
        }

        
        if ($etape->est_client && $request->type === 'retrait') {
            if ($etape->statut === 'en_cours') {
                $etape->statut = 'terminee';
                $etape->save();
            }

            PaiementService::distribuerPaiement($etape->annonce);

            return response()->json(['message' => 'Colis retiré. Livraison terminée.']);
        }

        if (! $etape->est_client && ! $etape->est_commercant) {
            if ($request->type === 'retrait') {
                return response()->json(['message' => 'Code de retrait validé. Vous pouvez maintenant déposer.']);
            }

            if ($request->type === 'depot') {
                $etape->statut = 'terminee';
                $etape->save();

                $annonce = $etape->annonce;

                $annonce->id_livreur_reservant = null;
                $annonce->save();

                if (
                    $etape->lieu_arrivee === $annonce->entrepotArrivee->ville &&
                    !EtapeLivraison::where('annonce_id', $annonce->id)
                        ->where('est_client', true)
                        ->where('lieu_depart', $etape->lieu_arrivee)
                        ->where('lieu_arrivee', $etape->lieu_arrivee)
                        ->exists()
                ) {
                    $etapeClient = EtapeLivraison::create([
                        'annonce_id' => $annonce->id,
                        'livreur_id' => $etape->livreur_id,
                        'lieu_depart' => $etape->lieu_arrivee,
                        'lieu_arrivee' => $etape->lieu_arrivee,
                        'statut' => 'en_cours',
                        'est_client' => true,
                        'est_commercant' => false,
                        'est_mini_etape' => true,
                    ]);

                    $box = Entrepot::where('ville', $etape->lieu_arrivee)
                        ->first()?->boxes()
                        ->where('est_occupe', false)
                        ->first();

                    if ($box) {
                        $code = CodeBox::create([
                            'box_id' => $box->id,
                            'etape_livraison_id' => $etapeClient->id,
                            'type' => 'retrait',
                            'code_temporaire' => Str::random(6),
                        ]);

                        $box->est_occupe = true;
                        $box->save();

                        Mail::to($annonce->client->email)->send(new CodeRetraitMail($code));
                        $code->mail_envoye_at = now();
                        $code->save();
                    }
                }

                return response()->json(['message' => 'Colis déposé. Étape clôturée.']);
            }
        }

        return response()->json(['message' => 'Code validé.']);
    }


    public function codes($id)
    {
        $user = Auth::user();
        $etape = EtapeLivraison::with(['codes', 'annonce'])->findOrFail($id);

        if ($user->role === 'commercant' && $etape->annonce->id_commercant !== $user->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        return response()->json($etape->codes);
    }

    public function etapeSuivante($id)
    {
        $etape = EtapeLivraison::findOrFail($id);

        $suivante = EtapeLivraison::where('annonce_id', $etape->annonce_id)
            ->where('livreur_id', $etape->livreur_id)
            ->where('created_at', '>', $etape->created_at)
            ->orderBy('created_at')
            ->first();

        if (! $suivante) {
            return response()->json(['message' => 'Aucune étape suivante trouvée.'], 404);
        }

        return response()->json($suivante);
    }

}