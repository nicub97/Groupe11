<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Annonce;
use App\Models\TrajetLivreur;
use App\Models\EtapeLivraison;
use App\Models\Entrepot;
use App\Models\CodeBox;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AnnonceController extends Controller
{
    public function index(Request $request)
    {
        $query = Annonce::with(['client', 'commercant', 'entrepotDepart', 'entrepotArrivee']);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'ILIKE', "%$search%")
                  ->orWhere('description', 'ILIKE', "%$search%");
            });
        }

        if ($request->filled('sort') && in_array($request->sort, ['asc', 'desc'])) {
            $query->orderBy('prix_propose', $request->sort);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $annonce = Annonce::with([
            'client',
            'commercant',
            'entrepotDepart',
            'entrepotArrivee',
            'etapesLivraison.codes'
        ])->find($id);

        if (! $annonce) {
            return response()->json(['message' => 'Annonce introuvable.'], 404);
        }

        return response()->json($annonce);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        // Déterminer les règles dynamiquement selon le rôle
        $rules = [
            'type' => 'required|in:livraison_client,produit_livre',
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'prix_propose' => 'required|numeric|min:0',
            'photo' => 'nullable|file|image|max:2048',
            'entrepot_depart_id' => 'required|exists:entrepots,id',
        ];

        // Si client → il faut entrepot_arrivee_id
        if ($user->role === 'client') {
            $rules['entrepot_arrivee_id'] = 'required|exists:entrepots,id';
        }

        if ($request->type === 'livraison_client') {
            $rules['entrepot_arrivee_id'] = ($rules['entrepot_arrivee_id'] ?? 'required|exists:entrepots,id') . '|different:entrepot_depart_id';
        }

        $validated = $request->validate($rules);

        $data = $validated;
        unset($data['photo']);

        DB::beginTransaction();

        $annonce = new Annonce($data);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('documents/annonces', 'public');
            $annonce->photo = $path;
        }

        if ($user->role === 'client') {
            $annonce->id_client = $user->id;
        } elseif ($user->role === 'commercant') {
            $annonce->id_commercant = $user->id;
            $annonce->entrepot_arrivee_id = null; // ne doit pas être défini au départ
        }

        $annonce->save();



        DB::commit();

        return response()->json([
            'message' => 'Annonce créée avec succès.',
            'annonce' => $annonce
        ], 201);
    }


    public function update(Request $request, $id)
    {
        $annonce = Annonce::find($id);

        if (! $annonce) {
            return response()->json(['message' => 'Annonce introuvable.'], 404);
        }

        if (
            $annonce->type === 'produit_livre' &&
            $annonce->id_client !== null
        ) {
            return response()->json(['message' => 'Cette annonce a déjà été réservée et ne peut plus être modifiée.'], 403);
        }

        $validated = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'prix_propose' => 'sometimes|numeric|min:0',
            'photo' => 'nullable|string',
            'entrepot_depart_id' => 'sometimes|exists:entrepots,id',
            'entrepot_arrivee_id' => 'sometimes|exists:entrepots,id',
        ]);

        $annonce->update($validated);

        return response()->json(['message' => 'Annonce mise à jour.', 'annonce' => $annonce]);
    }

    public function destroy($id)
    {
        $annonce = Annonce::find($id);

        if (! $annonce) {
            return response()->json(['message' => 'Annonce introuvable.'], 404);
        }

        $user = auth()->user();

        $estAuteur =
            ($user->role === 'client' && $annonce->id_client === $user->id) ||
            ($user->role === 'commercant' && $annonce->id_commercant === $user->id);

        if (! $estAuteur && $user->role !== 'admin') {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if (
            $annonce->type === 'produit_livre' &&
            $annonce->id_client !== null
        ) {
            return response()->json(['message' => 'Cette annonce a déjà été réservée et ne peut plus être modifiée.'], 403);
        }

        $annonce->delete();

        return response()->json(['message' => 'Annonce supprimée avec succès.']);
    }

    public function mesAnnonces()
    {
        $user = Auth::user();

        if (!in_array($user->role, ['client', 'commercant'])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $annonces = Annonce::with([
            'etapesLivraison.livreur',
            'entrepotDepart',
            'entrepotArrivee'
        ])
        ->where(function ($q) use ($user) {
            if ($user->role === 'client') {
                $q->where('id_client', $user->id);
            } elseif ($user->role === 'commercant') {
                $q->where('id_commercant', $user->id);
            }
        })
        ->latest()
        ->get();

        return response()->json($annonces);
    }


    public function annoncesDisponibles()
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'livreur') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $trajets = TrajetLivreur::with('entrepotDepart')->where('livreur_id', $user->id)->get();

        if ($trajets->isEmpty()) {
            return response()->json(['annonces_disponibles' => []]);
        }

        $annonces = Annonce::with(['etapesLivraison', 'entrepotDepart', 'entrepotArrivee'])
            ->where('is_paid', true)
            ->whereIn('type', ['livraison_client', 'produit_livre'])
            ->get();

        $disponibles = [];

        foreach ($annonces as $annonce) {
            // ❗ Spécifique aux annonces produit_livre : ignorer si pas encore réservée
            if (
                $annonce->type === 'produit_livre' &&
                (
                    ! $annonce->id_client ||
                    ! $annonce->entrepotArrivee
                )
            ) {
                continue;
            }

            $etapes = $annonce->etapesLivraison;

            // ⚠️ S'il y a déjà des étapes, il ne faut AUCUNE étape livreur en cours
            if ($etapes->count() > 0) {
                $enCours = $etapes->first(fn($e) => $e->statut !== 'terminee' && $e->est_client === false);
                if ($enCours) continue;
            }

            // Déterminer la ville de départ actuelle
            $depart_actuel = $annonce->entrepotDepart?->ville ?? '';

            $lastStep = $etapes
                ->where('statut', 'terminee');

            if ($annonce->type === 'produit_livre') {
                $lastStep = $lastStep->where('est_commercant', false);
            } elseif ($annonce->type === 'livraison_client') {
                $lastStep = $lastStep->where('est_client', false);
            }

            $lastStep = $lastStep->last();

            if ($lastStep) {
                $depart_actuel = $lastStep->lieu_arrivee;
            }

            // Vérifier compatibilité avec un trajet du livreur
            $compatible = $trajets->first(function ($trajet) use ($depart_actuel) {
                return $trajet->entrepotDepart &&
                    strcasecmp(trim($trajet->entrepotDepart->ville), trim($depart_actuel)) === 0;
            });

            if ($compatible) {
                $disponibles[] = $annonce;
            }
        }

        return response()->json([
            'livreur_connecte_id' => $user->id,
            'annonces_disponibles' => $disponibles
        ]);
    }



    public function accepterAnnonce(Request $request, $id)
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'livreur') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $annonce = Annonce::with(['etapesLivraison', 'entrepotDepart'])->findOrFail($id);

        $enCours = $annonce->etapesLivraison()->where('statut', '!=', 'terminee')->exists();

        if ($enCours) {
            return response()->json(['message' => 'Cette annonce est déjà en cours de livraison.'], 400);
        }

        $lastStep = $annonce->etapesLivraison()
            ->where('statut', 'terminee')
            ->orderByDesc('created_at')
            ->first();

        // 🚚 Si des étapes existent déjà, on crée directement l'étape livreur
        if ($lastStep) {
            $depart_actuel = $lastStep->lieu_arrivee;

            $trajet = TrajetLivreur::with(['entrepotDepart', 'entrepotArrivee'])
                ->where('livreur_id', $user->id)
                ->whereHas('entrepotDepart', function ($q) use ($depart_actuel) {
                    $q->where('ville', $depart_actuel);
                })
                ->first();

            if (! $trajet || ! $trajet->entrepotArrivee) {
                return response()->json(['message' => 'Trajet livreur introuvable.'], 400);
            }

            $boxId = CodeBox::where('etape_livraison_id', $lastStep->id)
                ->where('type', 'depot')
                ->value('box_id');

            $etapeLivreur = EtapeLivraison::create([
                'annonce_id' => $annonce->id,
                'livreur_id' => $user->id,
                'lieu_depart' => $trajet->entrepotDepart->ville,
                'lieu_arrivee' => $trajet->entrepotArrivee->ville,
                'statut' => 'en_cours',
                'est_client' => false,
                'est_commercant' => false,
                'est_mini_etape' => false,
            ]);

            if ($boxId) {
                CodeBox::create([
                    'box_id' => $boxId,
                    'etape_livraison_id' => $etapeLivreur->id,
                    'type' => 'retrait',
                    'code_temporaire' => Str::random(6),
                ]);

                CodeBox::create([
                    'box_id' => $boxId,
                    'etape_livraison_id' => $etapeLivreur->id,
                    'type' => 'depot',
                    'code_temporaire' => Str::random(6),
                ]);
            }

            return response()->json([
                'message' => 'Annonce acceptée. Retrait livreur en attente.',
                'etape' => $etapeLivreur,
            ]);
        }

        // ➡️ Aucune étape terminée : création de la mini-étape de dépôt initial
        $entrepot = $annonce->entrepotDepart;
        $box = $entrepot?->boxes()->where('est_occupe', false)->first();
        if (! $box) {
            return response()->json(['message' => 'Aucune box disponible pour le client.'], 400);
        }

        $etapeDepot = EtapeLivraison::create([
            'annonce_id' => $annonce->id,
            'livreur_id' => $user->id,
            'lieu_depart' => $entrepot->ville,
            'lieu_arrivee' => $entrepot->ville,
            'statut' => 'en_cours',
            'est_client' => $annonce->type === 'livraison_client',
            'est_commercant' => $annonce->type === 'produit_livre',
            'est_mini_etape' => true,
        ]);

        CodeBox::create([
            'box_id' => $box->id,
            'etape_livraison_id' => $etapeDepot->id,
            'type' => 'depot',
            'code_temporaire' => Str::random(6),
        ]);

        $box->est_occupe = true;
        $box->save();

        return response()->json([
            'message' => 'Annonce acceptée. Dépôt en attente.',
            'etape' => $etapeDepot,
        ]);
    }

    public function reserverAnnonce(Request $request, $id)
    {
        $user = Auth::user();

        if ($user->role !== 'client') {
            return response()->json(['message' => 'Seuls les clients peuvent réserver.'], 403);
        }

        $request->validate([
            'entrepot_arrivee_id' => 'required|exists:entrepots,id',
        ]);

        $annonce = Annonce::findOrFail($id);

        if ($annonce->type !== 'produit_livre') {
            return response()->json(['message' => 'Cette annonce ne peut pas être réservée.'], 400);
        }

        abort_if(
            $request->entrepot_arrivee_id == $annonce->entrepot_depart_id,
            422,
            "L'entrepôt d'arrivée doit être différent de l'entrepôt de départ."
        );

        if ($annonce->id_client !== null || $annonce->entrepot_arrivee_id !== null) {
            return response()->json(['message' => 'Annonce déjà réservée.'], 400);
        }

        $annonce->id_client = $user->id;
        $annonce->entrepot_arrivee_id = $request->entrepot_arrivee_id;
        $annonce->save();

        return response()->json(['message' => 'Annonce réservée avec succès.']);
    }

    public function payer(Request $request, Annonce $annonce)
    {
        $this->authorize('pay', $annonce);

        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));

        // Crée une session Checkout Stripe
        $session = $stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => ['name' => 'Paiement annonce'],
                    'unit_amount' => (int) ($annonce->prix_propose * 100),
                ],
                'quantity' => 1,
            ]],
            'success_url' => route('annonces.payer.callback', [
                'annonce' => $annonce->id,
                'session_id' => '{CHECKOUT_SESSION_ID}',
            ]),
            'cancel_url' => rtrim(env('FRONTEND_URL', ''), '/') . '/paiement/cancel',
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }

    public function paiementCallback(Request $request, Annonce $annonce)
    {
        $sessionId = $request->query('session_id');

        if (! $sessionId) {
            return response()->json(['message' => 'Session manquante.'], 400);
        }

        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
        $session = $stripe->checkout->sessions->retrieve($sessionId);

        if ($session && $session->payment_status === 'paid') {
            $annonce->is_paid = true;
            $annonce->save();
        }

        return redirect(rtrim(env('FRONTEND_URL', ''), '/') . '/paiement/success');
    }

}
