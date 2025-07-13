<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Utilisateur::firstOrCreate(
            ['identifiant' => 'Adm-Nicu'],
            [
                'prenom' => 'nicu',
                'nom' => 'balica',
                'password' => 'Azerty95@',
                'role' => 'admin',
            ]
        );
    }
}