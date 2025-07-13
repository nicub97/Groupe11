<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('livreurs', function (Blueprint $table) {
            $table->string('statut')->default('en_attente');
            $table->text('motif_refus')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('livreurs', function (Blueprint $table) {
            $table->dropColumn(['statut', 'motif_refus']);
        });
    }
};