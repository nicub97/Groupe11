<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use App\Models\Utilisateur;
use App\Models\Client;
use App\Models\Commercant;
use App\Models\Livreur;
use App\Models\Prestataire;
use App\Models\JustificatifPrestataire;
use Faker\Factory as Faker;

class UtilisateursSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('fr_FR');

        // Clients
        for ($i = 1; $i <= 10; $i++) {
            $user = Utilisateur::create([
                'nom' => $faker->lastName(),
                'prenom' => $faker->firstName(),
                'email' => $faker->unique()->safeEmail(),
                'password' => 'Azerty95@',
                'role' => 'client',
                'pays' => $faker->country(),
                'telephone' => $faker->phoneNumber(),
                'adresse_postale' => $faker->address(),
            ]);

            Client::create([
                'utilisateur_id' => $user->id,
                'adresse' => $user->adresse_postale,
                'telephone' => $user->telephone,
            ]);
        }

        // Commercants
        for ($i = 1; $i <= 10; $i++) {
            $user = Utilisateur::create([
                'nom' => $faker->lastName(),
                'prenom' => $faker->firstName(),
                'email' => $faker->unique()->safeEmail(),
                'password' => 'Azerty95@',
                'role' => 'commercant',
                'pays' => $faker->country(),
                'telephone' => $faker->phoneNumber(),
                'adresse_postale' => $faker->address(),
            ]);

            Commercant::create([
                'utilisateur_id' => $user->id,
                'nom_entreprise' => $faker->company(),
                'siret' => $faker->numerify('##############'),
            ]);
        }

        // Prestataires
        for ($i = 1; $i <= 10; $i++) {
            $user = Utilisateur::create([
                'nom' => $faker->lastName(),
                'prenom' => $faker->firstName(),
                'email' => $faker->unique()->safeEmail(),
                'password' => 'Azerty95@',
                'role' => 'prestataire',
                'pays' => $faker->country(),
                'telephone' => $faker->phoneNumber(),
                'adresse_postale' => $faker->address(),
            ]);

            $prestataire = Prestataire::create([
                'utilisateur_id' => $user->id,
                'domaine' => $faker->jobTitle(),
                'description' => $faker->sentence(),
                'statut' => 'en_attente',
            ]);

            $justificatifPath = 'documents/prestataires/justificatif_' . $i . '.pdf';
            Storage::disk('public')->put(
                $justificatifPath,
                file_get_contents(resource_path('fichiers_fictifs/justificatif.pdf'))
            );

            JustificatifPrestataire::create([
                'prestataire_id' => $prestataire->id,
                'chemin' => $justificatifPath,
                'type' => 'pdf',
            ]);
        }

        // Livreurs
        for ($i = 1; $i <= 10; $i++) {
            $user = Utilisateur::create([
                'nom' => $faker->lastName(),
                'prenom' => $faker->firstName(),
                'email' => $faker->unique()->safeEmail(),
                'password' => 'Azerty95@',
                'role' => 'livreur',
                'pays' => $faker->country(),
                'telephone' => $faker->phoneNumber(),
                'adresse_postale' => $faker->address(),
            ]);

            $piecePath = 'documents/livreurs/piece_identite_' . $i . '.pdf';
            $permisPath = 'documents/livreurs/permis_' . $i . '.pdf';

            Storage::disk('public')->put(
                $piecePath,
                file_get_contents(resource_path('fichiers_fictifs/piece_identite.pdf'))
            );
            Storage::disk('public')->put(
                $permisPath,
                file_get_contents(resource_path('fichiers_fictifs/permis.pdf'))
            );

            Livreur::create([
                'utilisateur_id' => $user->id,
                'piece_identite' => 'ID' . $faker->numerify('########'),
                'permis_conduire' => 'PC' . $faker->numerify('########'),
                'piece_identite_document' => $piecePath,
                'permis_conduire_document' => $permisPath,
            ]);
        }
    }
}
