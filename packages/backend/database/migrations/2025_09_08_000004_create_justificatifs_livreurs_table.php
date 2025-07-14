<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('justificatifs_livreurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livreur_id')->constrained()->onDelete('cascade');
            $table->string('chemin');
            $table->string('type')->nullable();
            $table->string('statut')->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('justificatifs_livreurs');
    }
};
