<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            if (!Schema::hasColumn('paiements', 'annonce_id')) {
                $table->unsignedBigInteger('annonce_id')->nullable()->after('commande_id');
                $table->foreign('annonce_id')->references('id')->on('annonces')->onDelete('cascade');
            }
            if (!Schema::hasColumn('paiements', 'statut')) {
                $table->enum('statut', ['valide', 'en_attente', 'annule'])->default('valide')->after('reference');
            }
        });
    }

    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            if (Schema::hasColumn('paiements', 'annonce_id')) {
                $table->dropForeign(['annonce_id']);
                $table->dropColumn('annonce_id');
            }
            if (Schema::hasColumn('paiements', 'statut')) {
                $table->dropColumn('statut');
            }
        });
    }
};