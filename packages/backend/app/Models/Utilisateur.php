<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'utilisateurs';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'pays',
        'telephone',
        'adresse_postale',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Mutator pour hasher automatiquement le mot de passe
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = bcrypt($value);
    }

    // Annonces créées par le client (type livraison_client, service ou produit_livre)
    public function annoncesClient()
    {
        return $this->hasMany(Annonce::class, 'id_client');
    }

    // Annonces créées par le commerçant (type produit_livre)
    public function annoncesCommercant()
    {
        return $this->hasMany(Annonce::class, 'id_commercant');
    }

    // Annonces créées par le prestataire (type service)
    public function annoncesPrestataire()
    {
        return $this->hasMany(Annonce::class, 'id_prestataire');
    }

    // Annonces pour lesquelles l'utilisateur est livreur (via table pivot)
    public function livraisons()
    {
        return $this->belongsToMany(Annonce::class, 'annonce_utilisateur', 'utilisateur_id', 'annonce_id')
                    ->where('type', '!=', 'service');
    }

    // Commandes faites par ce client
    public function commandes()
    {
        return $this->hasMany(Commande::class, 'client_id');
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isBackOffice()
    {
        return $this->role === 'backoffice';
    }

    public function portefeuille()
    {
        return $this->hasOne(Portefeuille::class, 'utilisateur_id');
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class, 'utilisateur_id');
    }

    public function colisLivres()
    {
        return $this->hasMany(Colis::class, 'livreur_id');
    }

    public function messagesEnvoyes()
    {
        return $this->hasMany(Communication::class, 'expediteur_id');
    }

    public function messagesRecus()
    {
        return $this->hasMany(Communication::class, 'destinataire_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'utilisateur_id');
    }

    public function annoncesLivrees()
    {
        return $this->belongsToMany(Annonce::class, 'annonce_utilisateur', 'utilisateur_id', 'annonce_id');
    }

    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function commercant()
    {
        return $this->hasOne(Commercant::class);
    }

    public function livreur()
    {
        return $this->hasOne(Livreur::class);
    }



}
