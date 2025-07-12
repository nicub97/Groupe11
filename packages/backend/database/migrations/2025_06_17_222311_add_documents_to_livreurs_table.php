<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('livreurs', function (Blueprint $table) {
            $table->string('piece_identite_document')->nullable();
            $table->string('permis_conduire_document')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('livreurs', function (Blueprint $table) {
            $table->dropColumn(['piece_identite_document', 'permis_conduire_document']); // TODO: vérifier la suppression lors du déploiement
        });
    }
};
